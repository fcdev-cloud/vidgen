import '@/styles/video-meta.scss';

function VideoMeta({video}) {
    console.log(video);
    return (
        <div className="video-meta">
            <div className="video-meta__owner-data">
                <span>Posted by {video.username}</span>
            </div>
            <div className="video-meta__prompt">
                {video.prompt}
            </div>
        </div>
    );
}

export default VideoMeta;