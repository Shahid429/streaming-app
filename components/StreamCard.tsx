import { useState } from "react";
import { Fan, Play, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

type Stream = {
  id: string;
  name: string;
  quality: string;
  viewers: number;
  icon: "fan" | "play";
};

export const StreamCard: React.FC<{
  stream: Stream;
  onClick: (id: string) => void;
}> = ({ stream, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: isHovered ? 1.05 : 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative p-6 rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 hover:border-blue-500 shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={() => onClick(stream.id)}
        className="relative z-10 w-full group"
      >
        <div className="relative space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg ${
                  isHovered
                    ? "bg-blue-500 text-white"
                    : "bg-gray-800 text-gray-400"
                }`}
              >
                {stream.icon === "fan" ? (
                  <Fan className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </div>
              <span className="font-semibold text-lg text-white">
                {stream.name}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">{stream.viewers}k</span>
            </div>
          </div>
        </div>
      </button>
    </motion.div>
  );
};
