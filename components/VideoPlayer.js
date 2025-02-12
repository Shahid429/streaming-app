"use client";

import React, { useEffect, useRef } from "react";

const VideoPlayer = ({ m3u8Url }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const loadShaka = async () => {
      try {
        // Load Shaka Player script and CSS
        await Promise.all([
          loadScript("https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.7.6/shaka-player.ui.min.js"),
          loadCSS("https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.7.6/controls.min.css")
        ]);

        const shaka = window.shaka;
        shaka.polyfill.installAll();

        if (shaka.Player.isBrowserSupported()) {
          const player = new shaka.Player(videoRef.current);
          const ui = new shaka.ui.Overlay(player, containerRef.current, videoRef.current);

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

          player.getNetworkingEngine().registerRequestFilter(function(type, request) {
            request.allowCrossSiteCredentials = false;
            if (request.headers) {
              delete request.headers['Origin'];
              delete request.headers['Referer'];
            }
          });

          player.addEventListener('error', function(event) {
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

          return () => {
            player.destroy();
          };
        }
      } catch (error) {
        console.error('Error initializing player:', error);
      }
    };

    loadShaka();
  }, [m3u8Url]);

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = "anonymous";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const loadCSS = (href) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  };

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
