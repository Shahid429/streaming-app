"use client";

import React, { useEffect, useRef } from "react";

const VideoPlayer = ({ m3u8Url }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const uiRef = useRef(null);

  useEffect(() => {
    // Load Shaka Player library
    const loadShakaPlayer = async () => {
      try {
        // Load Shaka Player script
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.7.6/shaka-player.ui.min.js");
        // Load Shaka Player CSS
        loadCSS("https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.7.6/controls.min.css");
        
        // Initialize player
        await initPlayer();
      } catch (error) {
        console.error("Error loading Shaka Player:", error);
      }
    };

    loadShakaPlayer();

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
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

  const initPlayer = async () => {
    try {
      const shaka = window.shaka;
      shaka.polyfill.installAll();

      if (shaka.Player.isBrowserSupported()) {
        // Create player instance
        playerRef.current = new shaka.Player(videoRef.current);
        uiRef.current = new shaka.ui.Overlay(
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
          // Fallback to iframe player if needed
          if (event.detail.code === 1001 || event.detail.code === 1002) {
            setFallbackPlayer(true);
          }
        });

        // Configure UI
        uiRef.current.configure({
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

        // Load content
        await playerRef.current.load(m3u8Url);
        console.log('Player initialized successfully');

      } else {
        console.error('Browser not supported!');
      }
    } catch (error) {
      console.error('Error initializing player:', error);
    }
  };

  const [fallbackPlayer, setFallbackPlayer] = React.useState(false);

  if (fallbackPlayer) {
    return (
      <div className="iframe-container" style={{ width: "100%", height: "100%" }}>
        <iframe
          src={`https://www.hlsplayer.net/embed?type=m3u8&src=${encodeURIComponent(
            m3u8Url
          )}`}
          width="100%"
          height="500px"
          frameBorder="0"
          allowFullScreen
          title="HLS Player"
          style={{
            border: "none",
            display: "block",
          }}
        ></iframe>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      data-shaka-player-container
      style={{ width: "100%", height: "500px" }}
    >
      <video 
        ref={videoRef}
        data-shaka-player
        autoPlay
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default VideoPlayer;
