"use client";

import React, { useEffect, useRef } from "react";
import Script from 'next/script';

const VideoPlayer = ({ m3u8Url }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    const loadShaka = async () => {
      if (!window.shaka) {
        console.log("Shaka is not loaded yet");
        return;
      }

      try {
        window.shaka.polyfill.installAll();

        if (window.shaka.Player.isBrowserSupported()) {
          // Destroy existing player if it exists
          if (playerRef.current) {
            playerRef.current.destroy();
          }

          // Create player instance
          playerRef.current = new window.shaka.Player(videoRef.current);
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
            },
            manifest: {
              retryParameters: {
                timeout: 0,
                maxAttempts: 5,
                baseDelay: 1000,
                backoffFactor: 2,
                fuzzFactor: 0.5
              },
              dash: {
                ignoreSuggestedPresentationDelay: true,
                clockSyncUri: ''
              }
            },
            abr: {
              enabled: true,
              defaultBandwidthEstimate: 1000000,
              switchInterval: 1
            }
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
            console.error('Error code', event.detail.code, 'object', event.detail);
          });

          try {
            // Load content
            await playerRef.current.load(m3u8Url);
            console.log('Stream loaded');

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
          } catch (error) {
            console.error('Error loading stream:', error);
          }
        } else {
          console.error('Browser not supported!');
        }
      } catch (error) {
        console.error('Error initializing player:', error);
      }
    };

    // Handle script load
    const handleShakaLoaded = () => {
      loadShaka();
    };

    if (window.shaka) {
      handleShakaLoaded();
    }

    // Clean up
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [m3u8Url]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.7.6/shaka-player.ui.min.js"
        strategy="beforeInteractive"
        onLoad={() => {
          console.log('Shaka Player loaded');
          if (window.shaka) {
            window.shaka.polyfill.installAll();
          }
        }}
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.7.6/controls.min.css"
      />
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
          autoPlay
          style={{ 
            width: "100%", 
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0
          }}
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
        }
        .shaka-spinner-container {
          display: none;
        }
        .shaka-controls-container {
          width: 100% !important;
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
