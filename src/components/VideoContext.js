"use client";
import { createContext, useContext, useState, useCallback } from "react";

const VideoContext = createContext();

export function VideoProvider({ children }) {
    //Video Feed Version
  const [refreshKey, setRefreshKey] = useState(0);
  
  //Memoize refresh Feed
  const refreshFeed = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <VideoContext.Provider value={{ refreshKey, refreshFeed }}>
      {children}
    </VideoContext.Provider>
  );
}

export const useVideoFeedContext = () => useContext(VideoContext);