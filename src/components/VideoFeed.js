"use client";
import '@/styles/video-feed.scss';
import { useState, useEffect, useRef, useCallback } from 'react';
import { readVideosAction } from '@/lib/actions/video/actions'; 
import Video from '@/components/Video';
import VideoMeta from '@/components/VideoMeta';
import Link from 'next/link';
import DeleteVideoButton from './DeleteVideoButton';


function VideoFeed({username = null}) {
  const limit = 8;
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); 
  const loaderRef = useRef(null);
  const [activeVideoId, setActiveVideoId] = useState(null);
  
  const handleDeleteLocal = (deletedId) => {
    setVideos((prev) => prev.filter((v) => v.ID !== deletedId));
  };

  const loadMoreVideos = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    // Call the Server Action with the current page
    const result = await readVideosAction(page, limit, username);

    if (result.success && result.data.length > 0) {
      setVideos((prevVideos) => [...prevVideos, ...result.data]);
      setPage((prevPage) => prevPage + 1);

      // Check to see if fewer items than limit were received
      if (result.data.length < limit) {
        setHasMore(false);
      }
    } else {
      // Handle "No videos found" or errors
      setHasMore(false);
    }

    setIsLoading(false);
  }, [isLoading, page, hasMore]);

  

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreVideos();
        }
      },
      { rootMargin: '200px' }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loadMoreVideos]);

  return (
    <div className="video-feed">
      <div className="video-feed__container">
        <div className="video-feed__page">
          
          {videos.map((video) => (
            <div key={video.ID} className="video-card">
              <DeleteVideoButton 
                videoId={video.ID}
                videoOwnerId={video.user_id}
                onDeleted={handleDeleteLocal}
              />
              <Link  href={`/video/${video.ID}`}>
              <Video 
                id={video.ID} 
                title={video.title} 
                src={video.file_path} 
                isActive={activeVideoId === video.ID}
                onPlay={() => setActiveVideoId(video.ID)}
                controls={false}
              />
              </Link>
              <VideoMeta 
                video={video}
              />
            </div>
          ))}
        </div>

        <div ref={loaderRef} className="video-feed__loader">
          {isLoading && <p>Loading more videos...</p>}
          {!hasMore && videos.length > 0 && <p>End of the feed.</p>}
        </div>
      </div>
    </div>
  );
}

export default VideoFeed;