"use client";

import React, { useEffect, useRef } from "react";
import Head from 'next/head';

const VideoPlayer = ({ m3u8Url }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    let shakaLoaded = false;

    const loadShakaPlayer = () => {
      return new Promise((resolve, reject) => {
        if (window.shaka) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.7.6/shaka-player.ui.min.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = (error) => reject(error);
        document.head.appendChild(script);

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.7.6/controls.min.css";
        document.head.appendChild(link);
      });
    };

    const initPlayer = async () => {
      try {
        await loadShakaPlayer();
        
        if (!shakaLoaded) {
          window.shaka.polyfill.installAll();
          shakaLoaded = true;
        }

        if (window.shaka.Player.isBrowserSupported() && videoRef.current && containerRef.current) {
          if (playerRef.current) {
            playerRef.current.destroy();
          }

          playerRef.current = new window.shaka.Player(videoRef.current);
          const ui = new window.shaka.ui.Overlay(
            playerRef.current,
            containerRef.current,
            videoRef.current
          );

          playerRef.current.configure({
            streaming: {
              bufferingGoal: 60,
              rebufferingGoal: 30,
              bufferBehind: 30
            },
            manifest: {
              dash: {
                ignoreSuggestedPresentationDelay: true
              }
            }
          });

          playerRef.current.getNetworkingEngine().registerRequestFilter((type, request) => {
            request.allowCrossSiteCredentials = false;
            if (request.headers) {
              delete request.headers['Origin'];
              delete request.headers['Referer'];
            }
          });

          try {
            await playerRef.current.load(m3u8Url);
            console.log('Stream loaded successfully');

            ui.configure({
              addBigPlayButton: true,
              controlPanelElements: [
                'play_pause',
                'time_and_duration',
                'spacer',
                'mute',
                'volume',
                'fullscreen'
              ]
            });
          } catch (error) {
            console.error('Error loading stream:', error);
          }
        }
      } catch (error) {
        console.error('Error initializing player:', error);
      }
    };

    initPlayer();

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [m3u8Url]);

  return (
    <>
      <Head>
        <meta name="referrer" content="no-referrer" />
      </Head>
      <div 
        ref={containerRef}
        data-shaka-player-container
        style={{ 
          width: "100%", 
          height: "500px",
          backgroundColor: "black"
        }}
      >
        <video 
          ref={videoRef}
          data-shaka-player
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
