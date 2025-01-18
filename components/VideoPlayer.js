import React from "react";
import ReactPlayer from "react-player";

const VideoPlayer = ({ m3u8Url }) => {
  // Fallback URL for the HLSPlayer iframe
  const fallbackIframeUrl = `https://www.hlsplayer.net/embed?type=m3u8&src=${encodeURIComponent(m3u8Url)}`;

  const handleVideoError = () => {
    // Open the HLSPlayer iframe in a new tab
    window.open(fallbackIframeUrl, "_blank");
  };

  return (
    <div className="video-container" style={{ width: "100%", height: "100%" }}>
      <ReactPlayer
        url={m3u8Url}
        controls={true}
        width="100%"
        height="100%"
        playing={true}
        onError={handleVideoError} // Handle video errors
        config={{
          file: {
            attributes: {
              crossOrigin: "anonymous", // Necessary for cross-origin requests
            },
          },
        }}
      />
    </div>
  );
};

export default VideoPlayer;
