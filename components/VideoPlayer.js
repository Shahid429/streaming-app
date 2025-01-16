"use client"; // Mark this file as a client component

import { useEffect, useRef, useState } from 'react';

const VideoPlayer = ({ m3u8Url }) => {
  const videoRef = useRef(null);
  const [Hls, setHls] = useState(null);

  useEffect(() => {
    // Dynamically import Hls.js on the client-side
    if (typeof window !== 'undefined') {
      import('hls.js').then((module) => {
        setHls(() => module.default); // Set Hls as a function
      });
    }
  }, []);

  useEffect(() => {
    if (Hls && m3u8Url) {
      const hls = new Hls(); // Instantiate Hls with 'new'
      hls.loadSource(m3u8Url);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        console.log('Manifest parsed, the video can now be played!');
      });

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal) {
          console.error('HLS.js error:', data);
        }
      });

      return () => {
        hls.destroy();
      };
    }
  }, [Hls, m3u8Url]);

  return (
    <div className="video-container">
      <video ref={videoRef} controls />
    </div>
  );
};

export default VideoPlayer;
