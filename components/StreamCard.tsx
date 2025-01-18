import { Fan, Play, Users, Signal } from "lucide-react";
import { motion } from "framer-motion";

type Stream = {
  id: string;
  name: string;
  quality: string;
  viewers: number;
  icon: "fan" | "play";
  category: string;
};

type Theme = "light" | "dark";

export const StreamCard: React.FC<{
  stream: Stream;
  onClick: (id: string) => void;
  theme: Theme;
}> = ({ stream, onClick, theme }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      className={`relative p-6 rounded-2xl border transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700 hover:border-blue-500"
          : "bg-white border-gray-200 hover:border-blue-400"
      } shadow-lg`}
    >
      <button onClick={() => onClick(stream.id)} className="relative z-10 w-full">
        <div className="relative space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className={`p-2 rounded-lg transition-colors ${
                  theme === "dark" ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-600"
                }`}
              >
                {stream.icon === "fan" ? <Fan className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </motion.div>
              <div className="flex flex-col">
                <span className={`font-semibold text-lg ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {stream.name}
                </span>
                <span className="text-sm text-gray-400 capitalize">{stream.category}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <Signal className="w-4 h-4 text-blue-400" />
              <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                {stream.quality}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">{stream.viewers}k</span>
            </div>
          </div>
        </div>
      </button>
    </motion.div>
  );
};