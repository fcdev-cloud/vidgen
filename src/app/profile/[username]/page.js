import '@/styles/profile.scss';
import Prompt from '@/components/Prompt';
import VideoFeed from '@/components/VideoFeed';
import pool from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';

export default async function profilePage({params}) {
    // Get username from the URL
    const { username } = await params;
    const session = await getServerSession(authOptions);

    // Check if username exist in database
    const [rows] = await pool.execute(
        'SELECT username FROM users WHERE username = ?', 
        [username]
    );

    // Redirect to 404 page if user doesnt exist.
    if (rows.length === 0) {
        notFound(); // This triggers global not-found.js page
    }
    let loggedInName = session?.user?.name;
    if(!loggedInName) {
        loggedInName = username;
    }
    const profileUser = rows[0];
    const isOwner = session?.user?.name.toLowerCase() === profileUser.username.toLowerCase();

    loggedInName = profileUser.username;
    return(
        <div className="profile-page">
            <div className="profile-page__container">
                <div className="profile-page__header">
                    {isOwner && (
                        <h1>Welcome {loggedInName}</h1>
                    )}
                    {!isOwner && (
                        <h1>{username}'s Profile</h1>
                    )}
                </div>
                {isOwner && (
                    <div className="profile-page__sidebar">
                        <Prompt />
                    </div>
                )}
                <div className="profile-page__content">
                    <VideoFeed 
                    username={loggedInName}
                    />
                </div>
            </div>
        </div>
    );
}