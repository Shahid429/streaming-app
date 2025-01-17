"use client";

import { useState, useEffect } from "react";
import { Search, Moon, Sun } from "lucide-react";
import { StreamCard } from "../components/StreamCard";
import VideoPlayer from "../components/VideoPlayer";
import { fetchM3u8Links } from "../utils/m3u8LinksLoader";
import { motion, AnimatePresence } from "framer-motion";

type Stream = {
  id: string;
  name: string;
  quality: string;
  viewers: number;
  icon: "fan" | "play";
  category: string;
};

type Theme = "light" | "dark";

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [m3u8Url, setM3u8Url] = useState("");
  const [loading, setLoading] = useState(true);
  const [m3u8Links, setM3u8Links] = useState<{ [key: string]: string }>({});
  const [theme, setTheme] = useState<Theme>("dark");
  const [selectedCategory, setSelectedCategory] = useState("all");

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
    { id: "fancode", name: "Fancode Stream", quality: "4K Ultra HD", viewers: 125, icon: "fan", category: "sports" },
    { id: "jio", name: "Jio Stream", quality: "1080p HD", viewers: 89, icon: "play", category: "entertainment" },
    { id: "astro", name: "Astro 60Fps", quality: "60 FPS HD", viewers: 234, icon: "play", category: "sports" },
    { id: "willow", name: "Willow 4k", quality: "4K HDR", viewers: 156, icon: "play", category: "sports" },
  ];

  const categories = ["all", ...new Set(streams.map(stream => stream.category))];

  const filteredStreams = streams.filter((stream) =>
    stream.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedCategory === "all" || stream.category === selectedCategory)
  );

  const handleStreamClick = (streamId: string) => {
    window.location.href = `?path=${streamId}`;
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Stream Viewer
          </h1>
          <button onClick={toggleTheme} className="p-2 rounded-lg bg-gray-800 text-gray-200 hover:bg-gray-700">
            {theme === "dark" ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </div>

        {m3u8Url && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {loading ? (
              <div className="w-full h-96 bg-gray-800 rounded-lg animate-pulse" />
            ) : (
              <VideoPlayer m3u8Url={m3u8Url} />
            )}
          </motion.div>
        )}

        <div className="relative max-w-md mx-auto mb-8">
          <input
            type="text"
            placeholder="Search streams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-4 py-3 pl-12 rounded-lg border transition-all focus:outline-none ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700 text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        <div className="flex gap-4 mb-8 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg capitalize transition-all ${
                selectedCategory === category
                  ? "bg-blue-500 text-white"
                  : theme === "dark"
                  ? "bg-gray-800 text-gray-300"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <AnimatePresence>
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredStreams.map((stream) => (
              <StreamCard
                key={stream.id}
                stream={stream}
                onClick={handleStreamClick}
                theme={theme}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredStreams.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
              No streams found matching your search.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
