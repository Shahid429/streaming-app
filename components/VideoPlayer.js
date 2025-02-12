"use client";

import React, { useEffect, useRef } from "react";

const VideoPlayer = ({ m3u8Url }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    let shakaScript = null;
    let styleSheet = null;

    const initPlayer = async () => {
      try {
        // Load Shaka Player if not already loaded
        if (!window.shaka) {
          shakaScript = document.createElement('script');
          shakaScript.src = "https://cdnjs.cloudflare.com/ajax/libs/shaka-player/3.3.1/shaka-player.compiled.js";
          shakaScript.async = true;
          document.head.appendChild(shakaScript);

          styleSheet = document.createElement('link');
          styleSheet.rel = 'stylesheet';
          styleSheet.href = "https://cdnjs.cloudflare.com/ajax/libs/shaka-player/3.3.1/controls.min.css";
          document.head.appendChild(styleSheet);

          await new Promise((resolve) => {
            shakaScript.onload = resolve;
          });
        }

        // Initialize Shaka Player
        window.shaka.polyfill.installAll();

        if (window.shaka.Player.isBrowserSupported() && videoRef.current && containerRef.current) {
          // Destroy existing player if any
          if (playerRef.current) {
            playerRef.current.destroy();
            playerRef.current = null;
          }

          // Create new player
          playerRef.current = new window.shaka.Player(videoRef.current);

          // Configure player
          playerRef.current.configure({
            streaming: {
              bufferingGoal: 30,
              rebufferingGoal: 15,
              bufferBehind: 30,
              retryParameters: {
                timeout: 30000,
                maxAttempts: 5,
                baseDelay: 1000,
                backoffFactor: 2,
                fuzzFactor: 0.5
              },
              smallGapLimit: 0.5,
              jumpLargeGaps: true
            },
            manifest: {
              retryParameters: {
                timeout: 30000,
                maxAttempts: 5,
                baseDelay: 1000,
                backoffFactor: 2,
                fuzzFactor: 0.5
              }
            }
          });

          // Add network filters
          playerRef.current.getNetworkingEngine().registerRequestFilter((type, request) => {
            request.allowCrossSiteCredentials = false;
            request.headers = {
              ...request.headers,
              'Origin': null,
              'Referer': null
            };
          });

          // Error handling
          playerRef.current.addEventListener('error', (error) => {
            console.error('Player error:', error);
          });

          // Load content
          try {
            await playerRef.current.load(m3u8Url);
            console.log('Content loaded successfully');

            // Initialize UI after content is loaded
            const ui = new window.shaka.ui.Overlay(
              playerRef.current,
              containerRef.current,
              videoRef.current
            );

            ui.configure({
              addBigPlayButton: true,
              controlPanelElements: [
                'play_pause',
                'time_and_duration',
                'spacer',
                'mute',
                'volume',
                'fullscreen'
              ],
              overflowMenuButtons: [
                'quality',
                'language',
                'picture_in_picture'
              ]
            });
          } catch (error) {
            console.error('Error loading content:', error);
          }
        }
      } catch (error) {
        console.error('Error initializing player:', error);
      }
    };

    if (m3u8Url) {
      initPlayer();
    }

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
    <div className="relative w-full pt-[56.25%] bg-black rounded-lg overflow-hidden">
      <div 
        ref={containerRef}
        className="absolute top-0 left-0 w-full h-full"
        data-shaka-player-container
      >
        <video 
          ref={videoRef}
          className="w-full h-full"
          data-shaka-player
          autoPlay
          playsInline
        />
      </div>
      <style jsx global>{`
        .shaka-video-container {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
        }
        .shaka-video-container video {
          position: absolute !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
        }
        .shaka-controls-container {
          position: absolute !important;
          width: 100% !important;
          height: 100% !important;
        }
        .shaka-controls-container[shown="true"] {
          background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%) !important;
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
