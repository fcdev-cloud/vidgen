"use client";
import '../styles/home.scss';
import VideoFeed from "./VideoFeed";
import Prompt from "./Prompt";
import { useVideoFeedContext } from './VideoContext';


function Home () {
    const { refreshFeed, refreshKey } = useVideoFeedContext();
    return (
        <div className="home">
            <h1>Video Feed</h1>
            <Prompt />
            <VideoFeed key={refreshKey} />
        </div>
    );
}
export default Home;