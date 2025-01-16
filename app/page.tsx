"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { StreamCard } from "../components/StreamCard"; // Import StreamCard component
import VideoPlayer from "../components/VideoPlayer";
import { fetchM3u8Links } from "../utils/m3u8LinksLoader"; // Import m3u8LinksLoader utility

type Stream = {
  id: string;
  name: string;
  quality: string;
  viewers: number;
  icon: "fan" | "play"; // Ensuring that the icon type is strictly "fan" or "play"
};

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [m3u8Url, setM3u8Url] = useState("");
  const [loading, setLoading] = useState(true);
  const [m3u8Links, setM3u8Links] = useState<{ [key: string]: string }>({});

  // Fetch m3u8 links when the component mounts
  useEffect(() => {
    const loadLinks = async () => {
      const links = await fetchM3u8Links();
      setM3u8Links(links);
      setLoading(false);
    };

    loadLinks();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const path = urlParams.get("path");

    if (path && m3u8Links[path]) {
      setM3u8Url(m3u8Links[path]);
    } else {
      setLoading(false);
    }
  }, [m3u8Links]);

  const streams: Stream[] = [
    { id: "fancode", name: "Fancode Stream", quality: "4K Ultra HD", viewers: 125, icon: "fan" },
    { id: "jio", name: "Jio Stream", quality: "1080p HD", viewers: 89, icon: "play" },
    { id: "astro", name: "Astro 60Fps", quality: "60 FPS HD", viewers: 234, icon: "play" },
    { id: "willow", name: "Willow 4k", quality: "4K HDR", viewers: 156, icon: "play" },
  ];

  const filteredStreams = streams.filter((stream) =>
    stream.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStreamClick = (streamId: string) => {
    window.location.href = `?path=${streamId}`;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {m3u8Url && (
          <div className="mb-8">
            {loading ? (
              <p className="text-gray-400 text-center">Loading video...</p>
            ) : (
              <VideoPlayer m3u8Url={m3u8Url} />
            )}
          </div>
        )}
        <div className="relative max-w-md mx-auto mb-12">
          <input
            type="text"
            placeholder="Search streams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredStreams.map((stream) => (
            <StreamCard key={stream.id} stream={stream} onClick={handleStreamClick} />
          ))}
        </div>
        {filteredStreams.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No streams found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
