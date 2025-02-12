"use client";

import React, { useEffect, useRef } from "react";

const VideoPlayer = ({ m3u8Url }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    const initPlayer = async () => {
      try {
        // Load Shaka Player library if not loaded
        if (!window.shaka) {
          const script = document.createElement('script');
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.3.5/shaka-player.ui.min.js";
          script.async = true;
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });

          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = "https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.3.5/controls.min.css";
          document.head.appendChild(link);
        }

        // Install shaka polyfills
        window.shaka.polyfill.installAll();

        // Check browser support
        if (window.shaka.Player.isBrowserSupported()) {
          // Create a Player instance
          playerRef.current = new window.shaka.Player(videoRef.current);

          // Create UI
          const ui = new window.shaka.ui.Overlay(
            playerRef.current,
            containerRef.current,
            videoRef.current
          );

          // Configure player
          playerRef.current.configure({
            streaming: {
              bufferingGoal: 60,
              rebufferingGoal: 30,
              bufferBehind: 30
            }
          });

          // Configure UI
          ui.configure({
            addBigPlayButton: true,
            controlPanelElements: [
              'play_pause',
              'time_and_duration',
              'spacer',
              'mute',
              'volume',
              'quality',
              'fullscreen',
            ]
          });

          // Handle network requests
          playerRef.current.getNetworkingEngine().registerRequestFilter((type, request) => {
            request.allowCrossSiteCredentials = false;
            if (request.headers) {
              delete request.headers['Origin'];
              delete request.headers['Referer'];
            }
          });

          // Load the manifest
          await playerRef.current.load(m3u8Url);
          console.log('Manifest loaded');
          
          // Start playback
          videoRef.current.play();
        }
      } catch (error) {
        console.error('Error loading player:', error);
      }
    };

    initPlayer();

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [m3u8Url]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div 
        ref={containerRef}
        className="video-container"
        style={{ 
          width: "100%", 
          height: "500px",
          maxHeight: "100vh",
          backgroundColor: "#000"
        }}
      >
        <video 
          ref={videoRef}
          style={{
            width: "100%",
            height: "100%"
          }}
          autoPlay
          data-shaka-player
          poster=""
        />
      </div>
      <style jsx global>{`
        .video-container {
          position: relative;
          width: 100%;
          height: 100%;
        }
        video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .shaka-video-container {
          width: 100% !important;
          height: 100% !important;
        }
        .shaka-controls-container {
          width: 100% !important;
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
