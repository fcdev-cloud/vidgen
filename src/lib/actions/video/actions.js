"use server";
import pool from '@/lib/db';
import { fal } from "@fal-ai/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import { redirect } from "next/navigation";
import { r2 } from '@/lib/s3';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";


// Link to to proxy route
fal.config({
  proxyUrl: "/api/fal/proxy", 
});

export async function createVideoAction(prevState, formData) {
    const prompt = formData.get('prompt');
    let newVideoId = null;

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        redirect(`/login?prompt_prohibited`);
    }

    // Extract session user ID
    const userId =  session.user.ID;

    // Get the user ID of
    try {
        // Database Entry
        const title = prompt.substring(0, 25) + "...";
        const [result] = await pool.execute(
            'INSERT INTO videos (title, prompt, status, user_id) VALUES (?, ?, ?, ?)',
            [title, prompt, 'processing', userId]
        );
        newVideoId = result.insertId;

        // fal.ai Generation (Wan 2.1)
        // 'subscribe' handles the queue and polling for you
        const result_ai = await fal.subscribe("fal-ai/wan-t2v", {
            input: {
                prompt: prompt,
                resolution: "480p",
                aspect_ratio: "9:16",
                duration: "5",
            },
            logs: true, 
        });

        // 3. File Setup
        const videoUrl = result_ai.data.video.url;
        const fileName = `videos/${newVideoId}.mp4`;
        const relativePath = `/${fileName}`;


        // 4. Download Video
        const response = await fetch(videoUrl);
        const buffer = Buffer.from(await response.arrayBuffer());


        // 5. Upload it to R2 and capture response
        const uploadResponse = await r2.send(new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileName,
            Body: buffer,
            ContentType: "video/mp4",
        }));

        // Throw error and let the catch block handle cleanup if upload fails
        if (uploadResponse.$metadata.httpStatusCode !== 200) {
            throw new Error(`${uploadResponse.$metadata.httpStatusCode}`);
        }
        // 6. Final DB Update
        await pool.execute(
            'UPDATE videos SET file_path = ?, status = ? WHERE id = ?',
            [relativePath, 'completed', newVideoId]
        );

        revalidatePath('/');
        revalidatePath(`/profile/${session.user.name}`);
        return { success: true };

    } catch (error) {
        console.error("Error:", error);
        
        // Auto-cleanup: remove row if generation failed
        if (newVideoId) {
            await pool.execute('DELETE FROM videos WHERE id = ?', [newVideoId]);
        }
        
        return { success: false, error: "AI generation failed. Please try again." };
    }
}

export async function readVideoAction(videoId) {
    try {
        const [rows] = await pool.execute(
            `SELECT 
                v.ID, 
                v.title, 
                v.prompt, 
                v.file_path, 
                v.user_id, 
                v.created_at,
                u.username, 
                u.ID AS owner_id 
             FROM videos v
             JOIN users u ON v.user_id = u.ID 
             WHERE v.ID = ? 
             LIMIT 1`,
            [videoId]
        );
        

        if (rows.length === 0) {
            return { success: false, error: "Video not found." };
        }

         if(process.env.R2_PUBLIC_SUBDOMAIN) {
            rows.forEach(row => {
                if (row.file_path) {
                    row.file_path = `${process.env.R2_PUBLIC_SUBDOMAIN}${row.file_path}`;
                }
            });
        }

        return { success: true, data: rows[0] };

    } catch (error) {
        console.error("Database Read Error:", error);
        return { success: false, error: "Failed to fetch video details." };
    }
}

export async function readVideosAction(page = 1, limit = 8, username = null) {
    try {
        const safePage = Math.max(1, parseInt(page, 10) || 1);
        const safeLimit = Math.min(50, parseInt(limit, 10) || 8); // Added a max cap for safety
        const offset = (safePage - 1) * safeLimit;

        let rows = [];

        if (username) {
            // Query for a specific user's videos + their info
            [rows] = await pool.query(
                `SELECT v.*, u.username, u.ID AS owner_id 
                FROM videos v 
                JOIN users u ON v.user_id = u.ID 
                WHERE u.username = ? 
                ORDER BY v.created_at DESC 
                LIMIT ? OFFSET ?`, 
                [username, safeLimit, offset]
            );
        } else {
            // Query for ALL videos + their respective owners' info
            [rows] = await pool.query(
                `SELECT v.*, u.username, u.ID AS owner_id 
                FROM videos v
                JOIN users u ON v.user_id = u.ID
                ORDER BY v.created_at DESC 
                LIMIT ? OFFSET ?`,
                [safeLimit, offset]
            );
        }

        if (!rows || rows.length === 0) {
            return { success: false, error: "No more videos found.", data: [] };
        }

        if(process.env.R2_PUBLIC_SUBDOMAIN) {
            rows.forEach(row => {
                if (row.file_path) {
                    row.file_path = `${process.env.R2_PUBLIC_SUBDOMAIN}${row.file_path}`;
                }
            });
        }

        return { success: true, data: rows };

    } catch (error) {
        console.error("Database Read Error:", error);
        return { success: false, error: "Failed to fetch videos." };
    }
}

export async function deleteVideoAction(prevState, formData) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect(`/login`);
    }

    try {
        const userId = session.user.id || session.user.ID;
        const videoId = formData.get('vID');

        if (!videoId) {
        return { success: false, error: 'No Video ID found' };
        }

        // 1. Get the file path before deleting the row
        const [videoData] = await pool.execute(
        'SELECT file_path FROM videos WHERE ID=? AND user_id=?', 
        [videoId, userId]
        );

        if (videoData.length > 0) {
        const fullPath = videoData[0].file_path;

        // 2. Extract the R2 Key
        // If path is "/videos/12.mp4", we need "videos/12.mp4"
        const r2Key = fullPath.replace(`${process.env.R2_PUBLIC_DOMAIN}/`, "").replace(/^\//, "");

        // 3. Delete from Cloudflare R2
        try {
            await r2.send(new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: r2Key,
            }));
            console.log(`Deleted from R2: ${r2Key}`);
        } catch (err) {
            // log this but continue so the DB doesn't stay out of sync
            console.error("R2 deletion failed:", err);
        }

        // 4. Delete the row from Database
        await pool.execute('DELETE FROM videos WHERE ID=? AND user_id=?', [videoId, userId]);
        }

        revalidatePath('/');
        revalidatePath(`/profile/${session.user.name}`);
        return { success: true, message: `Video successfully deleted.` };

    } catch (error) {
        console.error("Delete Error:", error);
        return { success: false, error: "Failed to delete video." };
    }
}

