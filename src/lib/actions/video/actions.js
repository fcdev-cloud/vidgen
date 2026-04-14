"use server";
import pool from '@/lib/db';
import { fal } from "@fal-ai/client";
import path from 'path';
import fs from 'fs/promises';
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import { redirect } from "next/navigation";

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
        console.log(result_ai);
        const videoUrl = result_ai.data.video.url;
        const fileName = `${newVideoId}.mp4`;
        const absolutePath = path.join(process.cwd(), 'public', 'videos', fileName);
        const relativePath = `/videos/${fileName}`;

        // Create directory if it doesn't exist
        await fs.mkdir(path.dirname(absolutePath), { recursive: true });

        // 4. Download Video
        const response = await fetch(videoUrl);
        const buffer = Buffer.from(await response.arrayBuffer());
        await fs.writeFile(absolutePath, buffer);

        // 5. Final DB Update
        await pool.execute(
            'UPDATE videos SET file_path = ?, status = ? WHERE id = ?',
            [relativePath, 'completed', newVideoId]
        );

        revalidatePath('/');
        revalidatePath(`/profile/${session.user.name}`);
        return { success: true };

    } catch (error) {
        console.error("fal.ai Error:", error);
        
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
            [rows] = await pool.execute(
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
            [rows] = await pool.execute(
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

        return { success: true, data: rows };

    } catch (error) {
        console.error("Database Read Error:", error);
        return { success: false, error: "Failed to fetch videos." };
    }
}

export async function deleteVideoAction(prevState, formData) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        redirect(`/login`);
    }

    try {
        const userId = session.user.id || session.user.ID;
        const videoId = formData.get('vID');

        if (!videoId) {
            return { success: false, error: 'No Video ID found' };
        }

        // Execute DELETE with ownership check
        const [videoData] = await pool.execute('SELECT file_path FROM videos WHERE ID=? AND user_id=?', [videoId, userId]);

        if (videoData.length > 0) {
            const cleanPath = videoData[0].file_path.replace(/^\//, ''); // Removes leading slash if it exists
            const absolutePath = path.join(process.cwd(), 'public', cleanPath);
            
            // Delete the row
            await pool.execute('DELETE FROM videos WHERE ID=? AND user_id=?', [videoId, userId]);

            // Delete the physical file
            try {
                await fs.unlink(absolutePath);
            } catch (err) {
                console.error("File deletion failed, but DB row is gone:", err);
            }
        }

        // Revalidate so the video disappears from the UI immediately
        revalidatePath('/');
        revalidatePath(`/profile/${session.user.name}`);

        return { success: true, message: `Video successfully deleted.` };

    } catch (error) {
        console.error("Delete Error:", error);
        return { success: false, error: "Failed to delete video." };
    }
}

