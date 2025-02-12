"use client";

import React, { useEffect, useRef } from "react";

interface VideoPlayerProps {
  m3u8Url: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ m3u8Url }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let player: any = null;

    const initPlayer = async () => {
      try {
        // @ts-ignore
        window.shaka.polyfill.installAll();
        // @ts-ignore
        if (window.shaka.Player.isBrowserSupported() && videoRef.current && containerRef.current) {
          // @ts-ignore
          player = new window.shaka.Player(videoRef.current);
          // @ts-ignore
          const ui = new window.shaka.ui.Overlay(
            player,
            containerRef.current,
            videoRef.current
          );

          player.configure({
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

          player.getNetworkingEngine().registerRequestFilter((type: any, request: any) => {
            request.allowCrossSiteCredentials = false;
            if (request.headers) {
              delete request.headers['Origin'];
              delete request.headers['Referer'];
            }
          });

          player.addEventListener('error', (event: any) => {
            console.error('Error code', event.detail.code, 'object', event.detail);
          });

          await player.load(m3u8Url);

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

          console.log('Player initialized successfully');
        }
      } catch (error) {
        console.error('Error initializing player:', error);
      }
    };

    // Load Shaka Player scripts and CSS
    const loadShakaPlayer = async () => {
      if (!document.querySelector('script[src*="shaka-player"]')) {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.7.6/shaka-player.ui.min.js";
        script.crossOrigin = "anonymous";
        document.head.appendChild(script);

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.7.6/controls.min.css";
        link.crossOrigin = "anonymous";
        document.head.appendChild(link);

        script.onload = () => {
          initPlayer();
        };
      } else {
        initPlayer();
      }
    };

    loadShakaPlayer();

    // Cleanup
    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [m3u8Url]);

  return (
    <div 
      ref={containerRef}
      data-shaka-player-container
      style={{ 
        width: "100%", 
        height: "100%",
        backgroundColor: "black" 
      }}
    >
      <video 
        ref={videoRef}
        data-shaka-player
        autoPlay
        style={{ 
          width: "100%", 
          height: "100%" 
        }}
      />
    </div>
  );
};

export default VideoPlayer;
