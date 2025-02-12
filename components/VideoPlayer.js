"use client"; // Mark this file as a client component

import React, { useEffect, useRef, useState } from "react";

const VideoPlayer = ({ m3u8Url }) => {
  const videoRef = useRef(null);
  const [Hls, setHls] = useState(null);
  const [errorOccurred, setErrorOccurred] = useState(false);

  useEffect(() => {
    // Dynamically import Hls.js on the client-side
    if (typeof window !== "undefined") {
      import("hls.js").then((module) => {
        setHls(() => module.default); // Set Hls as a function
      });
    }
  }, []);

  useEffect(() => {
    if (Hls && m3u8Url && !errorOccurred) {
      const hls = new Hls(); // Instantiate Hls with 'new'
      hls.loadSource(m3u8Url);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("Manifest parsed, the video can now be played!");
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error("HLS.js error:", data);
          setErrorOccurred(true); // Mark error occurred
        }
      });

      return () => {
        hls.destroy();
      };
    }
  }, [Hls, m3u8Url, errorOccurred]);

  if (errorOccurred) {
    // Automatically redirect to HLSPlayer iframe on playback error
    return (
      <div className="iframe-container" style={{ width: "100%", height: "100%" }}>
        <iframe
          src={`https://www.hlsplayer.net/embed?type=m3u8&src=${encodeURIComponent(
            m3u8Url
          )}`}
          width="100%"
          height="500px"
          frameBorder="0"
          allowFullScreen
          title="HLS Player"
          style={{
            border: "none",
            display: "block",
          }}
        ></iframe>
      </div>
    );
  }

  return (
    <div className="video-container">
      <video ref={videoRef} controls width="100%" height="500px" />
    </div>
  );
};

export default VideoPlayer;
