"use client";

import React, { useEffect, useRef } from "react";

const VideoPlayer = ({ m3u8Url }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    const loadShakaPlayer = async () => {
      if (!window.shaka) {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/shaka-player/3.2.0/shaka-player.compiled.debug.js";
        script.async = true;
        document.head.appendChild(script);

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/shaka-player/3.2.0/controls.min.css";
        document.head.appendChild(link);

        await new Promise((resolve) => script.onload = resolve);
      }
    };

    const initPlayer = async () => {
      try {
        await loadShakaPlayer();

        // Make sure shaka is loaded
        if (!window.shaka) {
          throw new Error('Shaka player not loaded');
        }

        // Install polyfills
        window.shaka.polyfill.installAll();

        // Check browser support
        if (!window.shaka.Player.isBrowserSupported()) {
          throw new Error('Browser not supported');
        }

        // Create player instance
        if (playerRef.current) {
          await playerRef.current.destroy();
        }

        // Create and initialize player
        playerRef.current = new window.shaka.Player(videoRef.current);

        // Configure player
        playerRef.current.configure({
          streaming: {
            useNativeHlsOnSafari: true,
            lowLatencyMode: true,
            rebufferingGoal: 2,
            bufferingGoal: 10,
            bufferBehind: 30,
            retryParameters: {
              timeout: 0,
              maxAttempts: Infinity,
              baseDelay: 100,
              backoffFactor: 1.5,
              fuzzFactor: 0.5
            }
          },
          manifest: {
            retryParameters: {
              timeout: 0,
              maxAttempts: Infinity,
              baseDelay: 100,
              backoffFactor: 1.5,
              fuzzFactor: 0.5
            },
            dash: {
              ignoreMinBufferTime: true,
              autoCorrectDrift: true
            }
          },
          preferredAudioLanguage: 'en',
          abr: {
            enabled: true,
            defaultBandwidthEstimate: 1000000
          }
        });

        // Add request filter for CORS
        playerRef.current.getNetworkingEngine().registerRequestFilter((type, request) => {
          // Modify request
          request.allowCrossSiteCredentials = false;
          request.headers = {
            ...request.headers,
            'Origin': window.location.origin,
            'Referer': window.location.origin,
            'Access-Control-Allow-Origin': '*'
          };
        });

        // Add response filter
        playerRef.current.getNetworkingEngine().registerResponseFilter((type, response) => {
          // Modify response if needed
          if (response.headers) {
            response.headers['access-control-allow-origin'] = '*';
          }
        });

        // Error handling
        playerRef.current.addEventListener('error', (event) => {
          console.error('Player error:', event.detail);
        });

        // Load content
        try {
          await playerRef.current.load(m3u8Url);
          console.log('Content loaded successfully');

          // Initialize UI
          const ui = new window.shaka.ui.Overlay(
            playerRef.current,
            containerRef.current,
            videoRef.current
          );

          ui.configure({
            addBigPlayButton: true,
            seekBarColors: {
              base: 'rgba(255, 255, 255, 0.3)',
              buffered: 'rgba(255, 255, 255, 0.54)',
              played: 'rgb(255, 255, 255)'
            },
            controlPanelElements: [
              'play_pause',
              'time_and_duration',
              'spacer',
              'mute',
              'volume',
              'fullscreen'
            ]
          });

          // Start playback
          await videoRef.current.play();
        } catch (error) {
          console.error('Error loading content:', error);
        }
      } catch (error) {
        console.error('Error initializing player:', error);
      }
    };

    if (m3u8Url) {
      initPlayer();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [m3u8Url]);

  return (
    <div className="relative w-full h-0 pb-[56.25%] bg-black">
      <div 
        ref={containerRef}
        className="absolute top-0 left-0 w-full h-full"
        data-shaka-player-container
      >
        <video 
          ref={videoRef}
          className="w-full h-full"
          data-shaka-player
          playsInline
          autoPlay
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
        video {
          position: absolute !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
        }
        .shaka-controls-container {
          position: absolute !important;
          width: 100% !important;
        }
        .shaka-controls-container[shown="true"] {
          background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%) !important;
        }
        .shaka-range-element {
          height: 4px !important;
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
