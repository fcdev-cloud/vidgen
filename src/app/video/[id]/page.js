"use client";
import '@/styles/single-video.scss';
import { use } from "react";
import Video from '@/components/Video';
import VideoMeta from '@/components/VideoMeta';
import { readVideoAction } from '@/lib/actions/video/actions';
import { useState, useEffect } from 'react';

export default function SingleVideoPage({ params }) {
    const [videoData, setVideoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = use(params);

    useEffect(() => {
        async function fetchVideo() {
            setLoading(true);
            const result = await readVideoAction(id);
            if (result.success) {
                setVideoData(result.data);
            }
            setLoading(false);
        }
        fetchVideo();
    }, [id]);

    if (loading) {
        return (
            <div className="single-video">
                <div className="single-video__container">
                    <h1>Loading...</h1>
                </div>
            </div>
        );
    }
    
    if (!videoData) {
        return (
        <div className="single-video">
            <div className="single-video__container">
                <h1>Video not found</h1>
            </div>
        </div>
        );
    }

    return (
        <div className="single-video">
            
            <div className="single-video__container">
                <div className="single-video__video">
                    <Video 
                        title={videoData.title} 
                        src={videoData.file_path} 
                    />
                </div>
                <div className="single-video__sidebar">
                    <VideoMeta 
                    video={videoData}
                    />
                </div>
            </div>
        </div>
    );
}