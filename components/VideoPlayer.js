import React from 'react';

const VideoPlayer = ({ m3u8Url }) => {
  const iframeSrc = `https://www.hlsplayer.net/embed?type=m3u8&src=${encodeURIComponent(m3u8Url)}`;

  return (
    <div className="video-container">
      <iframe
        src={iframeSrc}
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
        title="Video Player"
      />
    </div>
  );
};

export default VideoPlayer;
