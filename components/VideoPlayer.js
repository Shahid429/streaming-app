import React from 'react';
import ReactPlayer from 'react-player';

const VideoPlayer = ({ m3u8Url }) => {
  return (
    <div className="video-container">
      <ReactPlayer
        url={m3u8Url}
        controls={true}
        width="100%"
        height="100%"
        playing={true}
        config={{
          file: {
            attributes: {
              crossOrigin: 'anonymous', // Necessary for cross-origin requests
            },
          },
        }}
      />
    </div>
  );
};

export default VideoPlayer;
