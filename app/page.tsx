'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Match {
  match_id: string;
  event_name: string;
  team_1: string;
  team_2: string;
  title: string;
  status: string;
  adfree_url: string;
  src: string;
}

const API_URL = 'https://raw.githubusercontent.com/drmlive/fancode-live-events/main/fancode.json';
const PLAYER_URL = 'https://shz.al/mHYz/Player.html?dtv=';

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        const sortedMatches = data.matches.sort((a: Match, b: Match) => {
          if (a.status.toLowerCase() === 'live' && b.status.toLowerCase() !== 'live') return -1;
          if (a.status.toLowerCase() !== 'live' && b.status.toLowerCase() === 'live') return 1;
          return 0;
        });
        setMatches(sortedMatches);
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const handleWatchClick = (adfreeUrl: string) => {
    window.location.href = `${PLAYER_URL}${adfreeUrl}`;
  };

  const handleTelegramClick = () => {
    if (confirm("Join Our Telegram Channel @livecrichdofficial")) {
      window.location.href = "https://telegram.me/livecrichdofficial";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-center text-orange-500 mb-8">
          Fancode Matches
        </h1>

        <button
          onClick={handleTelegramClick}
          className="block mx-auto mb-8 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-full transition-all duration-300"
        >
          Join Telegram
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {matches.map((match) => (
            <motion.div
              key={match.match_id}
              className="backdrop-blur-md bg-white/10 rounded-xl p-6 hover:shadow-xl transition"
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <img
                src={match.src}
                alt={match.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-bold mb-2">{match.title}</h3>
              <p className="text-gray-300 mb-2">{`${match.team_1} vs ${match.team_2}`}</p>
              <p
                className={`text-sm mb-4 ${
                  match.status.toLowerCase() === 'live'
                    ? 'text-yellow-400 animate-pulse'
                    : 'text-gray-400'
                }`}
              >
                {match.status}
              </p>
              <button
                onClick={() => handleWatchClick(match.adfree_url)}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Watch Now
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </main>
  );
}
