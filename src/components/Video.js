"use client";
import '@/styles/video.scss';
import { useEffect, useRef } from 'react';

// We now accept props instead of fetching inside
function Video({ src, controls= true, isActive, onPlay }) {
    const videoRef = useRef(null);

    // If this video is no longer the "active" one, pause it
    useEffect(() => {
        if (!isActive && videoRef.current) {
        videoRef.current.pause();
        }
    }, [isActive]);

    return (
        <div className="video">
            <div className="video__container">
                <video 
                controls={controls}
                ref={videoRef}
                onPlay={onPlay}
                playsInline
                preload="auto"
                >
                    <source src={src} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    );
}

export default Video;