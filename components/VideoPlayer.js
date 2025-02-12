"use client";

import React, { useEffect, useRef } from "react";

const VideoPlayer = ({ m3u8Url }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const uiRef = useRef(null);

  useEffect(() => {
    let shakaScript = null;
    let styleSheet = null;

    const loadShakaPlayer = () => {
      return new Promise((resolve, reject) => {
        // Load script
        shakaScript = document.createElement('script');
        shakaScript.src = "https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.3.5/shaka-player.ui.min.js";
        shakaScript.async = true;
        shakaScript.onload = resolve;
        shakaScript.onerror = reject;
        document.head.appendChild(shakaScript);

        // Load stylesheet
        styleSheet = document.createElement('link');
        styleSheet.rel = 'stylesheet';
        styleSheet.href = "https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.3.5/controls.min.css";
        document.head.appendChild(styleSheet);
      });
    };

    const initPlayer = async () => {
      if (!window.shaka) {
        await loadShakaPlayer();
      }

      try {
        window.shaka.polyfill.installAll();

        if (window.shaka.Player.isBrowserSupported() && videoRef.current && containerRef.current) {
          // Destroy existing player if it exists
          if (playerRef.current) {
            playerRef.current.destroy();
          }

          // Create player
          playerRef.current = new window.shaka.Player(videoRef.current);

          // Create UI
          const video = videoRef.current;
          const container = containerRef.current;
          const ui = new window.shaka.ui.Overlay(
            playerRef.current,
            container,
            video
          );
          uiRef.current = ui;

          // Configure player
          playerRef.current.configure({
            streaming: {
              bufferingGoal: 60,
              rebufferingGoal: 30,
              bufferBehind: 30,
              retryParameters: {
                timeout: 0,
                maxAttempts: 5,
                baseDelay: 1000,
                backoffFactor: 2,
                fuzzFactor: 0.5
              }
            },
            manifest: {
              retryParameters: {
                timeout: 0,
                maxAttempts: 5,
                baseDelay: 1000,
                backoffFactor: 2,
                fuzzFactor: 0.5
              }
            },
            abr: {
              enabled: true,
              defaultBandwidthEstimate: 1000000,
              switchInterval: 1
            }
          });

          // Configure UI
          ui.configure({
            addBigPlayButton: true,
            addSeekBar: true,
            controlPanelElements: [
              'play_pause',
              'time_and_duration',
              'spacer',
              'mute',
              'volume',
              'quality',
              'fullscreen',
            ],
            overflowMenuButtons: [
              'quality',
              'captions',
              'language',
              'picture_in_picture'
            ]
          });

          // Add network filters
          playerRef.current.getNetworkingEngine().registerRequestFilter((type, request) => {
            request.allowCrossSiteCredentials = false;
            if (request.headers) {
              delete request.headers['Origin'];
              delete request.headers['Referer'];
            }
          });

          // Error handling
          playerRef.current.addEventListener('error', (event) => {
            console.error('Player error:', event.detail);
          });

          // Load content
          await playerRef.current.load(m3u8Url);
          console.log('Stream loaded successfully');

        } else {
          console.error('Browser not supported!');
        }
      } catch (error) {
        console.error('Error initializing player:', error);
      }
    };

    initPlayer();

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      if (shakaScript && shakaScript.parentNode) {
        shakaScript.parentNode.removeChild(shakaScript);
      }
      if (styleSheet && styleSheet.parentNode) {
        styleSheet.parentNode.removeChild(styleSheet);
      }
    };
  }, [m3u8Url]);

  return (
    <div 
      ref={containerRef}
      data-shaka-player-container
      style={{ 
        width: "100%", 
        height: "500px",
        backgroundColor: "black",
        position: "relative"
      }}
    >
      <video 
        ref={videoRef}
        data-shaka-player
        style={{ 
          width: "100%", 
          height: "100%"
        }}
      />
      <style jsx global>{`
        .shaka-video-container {
          width: 100% !important;
          height: 100% !important;
        }
        .shaka-video-container video {
          width: 100% !important;
          height: 100% !important;
        }
        .shaka-spinner-container {
          display: none;
        }
        .shaka-controls-container {
          width: 100% !important;
        }
        .shaka-controls-container[shown="true"] {
          background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 100%);
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
