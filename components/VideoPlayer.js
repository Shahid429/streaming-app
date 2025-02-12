"use client";

import React, { useEffect, useRef } from "react";

const VideoPlayer = ({ m3u8Url }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    let shakaInstance = null;

    const loadShakaPlayer = async () => {
      // Add script if not already present
      if (!document.querySelector('script[src*="shaka-player"]')) {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.3.5/shaka-player.ui.min.js";
        script.async = true;
        document.head.appendChild(script);

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.3.5/controls.min.css";
        document.head.appendChild(link);

        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }
    };

    const initPlayer = async () => {
      try {
        await loadShakaPlayer();

        // Wait for Shaka to be available
        if (!window.shaka) {
          console.log('Waiting for Shaka to load...');
          return;
        }

        console.log('Initializing Shaka Player...');

        // Install polyfills
        window.shaka.polyfill.installAll();

        if (window.shaka.Player.isBrowserSupported() && videoRef.current && containerRef.current) {
          // Destroy existing player if any
          if (playerRef.current) {
            playerRef.current.destroy();
          }

          // Create player instance
          playerRef.current = new window.shaka.Player(videoRef.current);
          shakaInstance = playerRef.current;

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
              bufferBehind: 30,
              retryParameters: {
                timeout: 0,
                maxAttempts: 5,
                baseDelay: 1000,
                backoffFactor: 2,
                fuzzFactor: 0.5
              }
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

          console.log('Loading content:', m3u8Url);
          
          // Load the content
          try {
            await playerRef.current.load(m3u8Url);
            console.log('Content loaded successfully');
            videoRef.current.play();
          } catch (error) {
            console.error('Error loading content:', error);
          }
        } else {
          console.error('Browser not supported or refs not available');
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
      if (shakaInstance) {
        shakaInstance.destroy();
      }
    };
  }, [m3u8Url]);

  return (
    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
      <div 
        ref={containerRef}
        data-shaka-player-container
        className="w-full h-full"
      >
        <video 
          ref={videoRef}
          data-shaka-player
          className="w-full h-full"
          autoPlay
          playsInline
        />
      </div>
      <style jsx global>{`
        .shaka-video-container {
          width: 100% !important;
          height: 100% !important;
        }
        video {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain;
        }
        .shaka-controls-container {
          width: 100% !important;
        }
        .shaka-overflow-menu {
          min-width: 200px;
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
