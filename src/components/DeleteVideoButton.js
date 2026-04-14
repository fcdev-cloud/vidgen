"use client";
import { useSession } from "next-auth/react";
import { useActionState, useEffect } from "react";
import { deleteVideoAction } from "@/lib/actions/video/actions";

export default function DeleteVideoButton({ videoId, videoOwnerId, onDeleted }) {
    const { data: session, status } = useSession();
    const [state, formAction, isPending] = useActionState(deleteVideoAction, null);

    // Identify the user
    const currentUserId = session?.user?.ID;
    
    // Tell the feed to delete the video locally on success
    useEffect(() => {
        if (state?.success) {
            onDeleted(videoId);
        }
    }, [state, videoId, onDeleted]);

    // If the IDs don't match, don't show the button at all
    if (!currentUserId || currentUserId !== videoOwnerId) {
        return null;
    }

    // Wait for session to load (prevents button flickering)
    if (status === "loading") return null;

    return (
      
        <form action={formAction} className="delete-video-button">
            <input type="hidden" name="vID" value={String(videoId)} />
            <button 
                disabled={isPending} 
                type="submit" 
                onClick={(e) => !confirm("Nuke this masterpiece?") && e.preventDefault()}
                className="button"
            >
                <span>&times;</span>
            </button>
            {state?.error && <p className="text-xs">{state.error}</p>}
        </form>
    );
}