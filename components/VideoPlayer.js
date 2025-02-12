"use client";

import React, { useEffect } from 'react';
import Script from 'next/script';

interface VideoPlayerProps {
  m3u8Url: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ m3u8Url }) => {
  useEffect(() => {
    // CORS handling
    const originalFetch = window.fetch;
    window.fetch = function(url: string, options: RequestInit = {}) {
      if (url.includes('dai.google.com')) {
        options.mode = 'cors';
        options.credentials = 'omit';
        if (!options.headers) {
          options.headers = {};
        }
        delete (options.headers as any)['Origin'];
        delete (options.headers as any)['Referer'];
      }
      return originalFetch(url, options);
    };

    const initPlayer = async () => {
      try {
        // @ts-ignore
        window.shaka.polyfill.installAll();

        // @ts-ignore
        if (window.shaka.Player.isBrowserSupported()) {
          const video = document.getElementById('video') as HTMLVideoElement;
          const videoContainer = document.querySelector('[data-shaka-player-container]');
          
          // @ts-ignore
          const player = new window.shaka.Player(video);
          // @ts-ignore
          const ui = new window.shaka.ui.Overlay(player, videoContainer, video);

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

    // Initialize when Shaka is loaded
    const handleShakaLoaded = () => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPlayer);
      } else {
        initPlayer();
      }
    };

    // Call initialization when component mounts
    if (typeof window !== 'undefined' && (window as any).shaka) {
      handleShakaLoaded();
    }
  }, [m3u8Url]);

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.7.6/shaka-player.ui.min.js"
        crossOrigin="anonymous"
        onLoad={() => {
          console.log('Shaka Player loaded');
          // Initialize player when script is loaded
          if (typeof window !== 'undefined') {
            const event = new Event('shakaLoaded');
            window.dispatchEvent(event);
          }
        }}
      />
      <Script
        src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js"
        defer
      />
      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          overflow: hidden;
        }

        #player-container {
          height: 100%;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: black;
        }

        .shaka-video-container {
          height: 100%;
          width: 100%;
        }

        video {
          height: 100%;
          width: 100%;
        }

        .shaka-spinner-container {
          display: none;
        }
      `}</style>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.7.6/controls.min.css"
        crossOrigin="anonymous"
      />
      <div id="player-container">
        <div data-shaka-player-container className="shaka-video-container">
          <video autoPlay data-shaka-player id="video" poster="#" />
        </div>
      </div>
    </>
  );
};

export default VideoPlayer;
