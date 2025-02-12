"use client";

import React, { useEffect, useRef } from "react";
import Script from 'next/script';

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

          player.getNetworkingEngine().registerRequestFilter(function(type: any, request: any) {
            request.allowCrossSiteCredentials = false;
            if (request.headers) {
              delete request.headers['Origin'];
              delete request.headers['Referer'];
            }
          });

          player.addEventListener('error', function(event: any) {
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
        } else {
          console.error('Browser not supported!');
        }
      } catch (error) {
        console.error('Error initializing player:', error);
      }
    };

    // Initialize when script is loaded
    if (typeof window !== 'undefined' && (window as any).shaka) {
      initPlayer();
    }

    // Cleanup on unmount
    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [m3u8Url]);

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.7.6/shaka-player.ui.min.js"
        crossOrigin="anonymous"
        onLoad={() => console.log('Shaka Player loaded')}
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.7.6/controls.min.css"
        crossOrigin="anonymous"
      />
      <div 
        ref={containerRef}
        data-shaka-player-container
        style={{ 
          width: "100%", 
          height: "500px",
          backgroundColor: "black",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
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
      <style jsx global>{`
        .shaka-video-container {
          width: 100% !important;
          height: 100% !important;
        }
        .shaka-spinner-container {
          display: none;
        }
      `}</style>
    </>
  );
};

export default VideoPlayer;
