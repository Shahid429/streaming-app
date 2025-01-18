"use client"; // Mark this file as a client component

import { useEffect, useRef, useState } from "react";

const VideoPlayer = ({ m3u8Url, fallbackUrl }) => {
  const videoRef = useRef(null);
  const [Hls, setHls] = useState(null);
  const [error, setError] = useState(false);
  const [useIframePlayer, setUseIframePlayer] = useState(false);

  useEffect(() => {
    // Dynamically import Hls.js on the client-side
    if (typeof window !== "undefined") {
      import("hls.js")
        .then((module) => {
          setHls(() => module.default); // Set Hls as a function
        })
        .catch(() => setError(true)); // Handle dynamic import errors
    }
  }, []);

  useEffect(() => {
    if (Hls && m3u8Url && !useIframePlayer) {
      const hls = new Hls(); // Instantiate Hls
      hls.loadSource(m3u8Url);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        console.log("Manifest parsed, the video can now be played!");
      });

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal) {
          console.error("HLS.js error:", data);
          setError(true); // Set error state if HLS.js fails
        }
      });

      return () => {
        hls.destroy();
      };
    }
  }, [Hls, m3u8Url, useIframePlayer]);

  const handleFallback = () => {
    setUseIframePlayer(true);
  };

  if (error || useIframePlayer) {
    // Render fallback iframe player
    return (
      <div>
        <h4>Error loading the main player. Switching to fallback...</h4>
        <iframe
          src={`https://www.hlsplayer.net/embed?type=m3u8&src=${fallbackUrl || m3u8Url}`}
          width="100%"
          height="500px"
          frameBorder="0"
          allowFullScreen
          title="HLS Fallback Player"
          style={{ border: "none", display: "block" }}
        ></iframe>
        {!useIframePlayer && (
          <button onClick={handleFallback} style={{ marginTop: "10px" }}>
            Use Fallback Player
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="video-container">
      <video ref={videoRef} controls style={{ width: "100%" }} />
      {error && (
        <button onClick={handleFallback} style={{ marginTop: "10px" }}>
          Use Fallback Player
        </button>
      )}
    </div>
  );
};

export default VideoPlayer;
