"use client";

import React, { useEffect, useRef, useState } from "react";

const VideoPlayer = ({ m3u8Url }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const uiRef = useRef(null);
  const [fallbackPlayer, setFallbackPlayer] = useState(false);
  const [isPlayerLoaded, setIsPlayerLoaded] = useState(false);

  useEffect(() => {
    // Load Shaka Player only once
    if (!isPlayerLoaded) {
      loadShakaPlayer();
    } else if (m3u8Url && playerRef.current) {
      // If player is loaded and URL changes, load new source
      initializeStream(m3u8Url);
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [m3u8Url, isPlayerLoaded]);

  const loadShakaPlayer = async () => {
    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.7.6/shaka-player.ui.min.js");
      loadCSS("https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.7.6/controls.min.css");
      setIsPlayerLoaded(true);
      await initPlayer();
    } catch (error) {
      console.error("Error loading Shaka Player:", error);
      setFallbackPlayer(true);
    }
  };

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

  const initializeStream = async (streamUrl) => {
    try {
      if (playerRef.current) {
        await playerRef.current.load(streamUrl);
        console.log('New stream loaded successfully');
      }
    } catch (error) {
      console.error('Error loading stream:', error);
      setFallbackPlayer(true);
    }
  };

  const initPlayer = async () => {
    try {
      const shaka = window.shaka;
      shaka.polyfill.installAll();

      if (shaka.Player.isBrowserSupported()) {
        playerRef.current = new shaka.Player(videoRef.current);
        uiRef.current = new shaka.ui.Overlay(
          playerRef.current,
          containerRef.current,
          videoRef.current
        );

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

        playerRef.current.getNetworkingEngine().registerRequestFilter((type, request) => {
          request.allowCrossSiteCredentials = false;
          if (request.headers) {
            delete request.headers['Origin'];
            delete request.headers['Referer'];
          }
        });

        playerRef.current.addEventListener('error', (event) => {
          console.error('Error code', event.detail.code, 'object', event.detail);
          if (event.detail.code === 1001 || event.detail.code === 1002) {
            setFallbackPlayer(true);
          }
        });

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

        if (m3u8Url) {
          await initializeStream(m3u8Url);
        }

      } else {
        console.error('Browser not supported!');
        setFallbackPlayer(true);
      }
    } catch (error) {
      console.error('Error initializing player:', error);
      setFallbackPlayer(true);
    }
  };

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
