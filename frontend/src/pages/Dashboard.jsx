import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Gamepad2,
  Target,
  Zap,
  Sparkles,
  CheckCircle2,
  Menu,
  X,
  Github,
  Play,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useGlobal } from "../context/GlobalContext";
import { getGamesForCondition } from "../config/gameRegistry";
import Chatbot from "../components/Chatbot";
import { useBackgroundAnimation } from "../hooks/useBackgroundAnimation";

// Icon map for dynamic rendering
const ICON_MAP = {
  Gamepad2,
  Target,
  Zap,
  Sparkles,
  Play,
};

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { userProfile, ageGroup } = useGlobal();
  const background = useBackgroundAnimation(ageGroup);
  const [games, setGames] = useState([]);

  useEffect(() => {
    const condition = userProfile?.config?.condition;
    console.log('User Condition:', condition);
    setGames(getGamesForCondition(condition));
  }, [userProfile]);

  const isKids = ageGroup === 'kid';

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans selection:bg-indigo-500/30">
      {background}

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 md:pt-40 md:pb-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-5xl mx-auto"
        >
          <h1 className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-slate-900 dark:text-white tracking-tight leading-[1.05] mb-4 ${isKids ? 'font-nunito' : ''}`}>
            {isKids ? '🎮 Your Therapy Games' : 'Your Therapy Dashboard'}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            {isKids
              ? 'Pick a game and train your eyes! 🚀'
              : `Condition: ${userProfile?.config?.condition || 'Not set'} | Difficulty: ${userProfile?.config?.difficulty || 5}/10`
            }
          </p>
        </motion.div>

        {/* Games Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto"
        >
          {games.map((game) => {
            const IconComponent = ICON_MAP[game.iconType] || Play;
            return (
              <motion.div
                key={game.id}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className={`p-8 sm:p-10 rounded-[2rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-indigo-900/10 transition-all duration-500 group ${
                  isKids ? 'border-4 border-yellow-300' : ''
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-2xl ${
                    isKids
                      ? 'bg-yellow-100 group-hover:scale-110'
                      : 'bg-indigo-50 dark:bg-indigo-900/20 group-hover:scale-110'
                  } flex items-center justify-center mb-8 transition-transform duration-300`}
                >
                  <IconComponent className={`w-8 h-8 ${isKids ? 'text-yellow-600' : 'text-indigo-600'}`} strokeWidth={2} />
                </div>
                <h3 className={`text-2xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight ${isKids ? 'font-nunito' : ''}`}>
                  {game.title}
                </h3>
                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  {game.description}
                </p>
                <Link
                  to={game.path}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition ${
                    isKids
                      ? 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  <Play className="w-5 h-5" /> Play
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Empty State */}
        {games.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-24"
          >
            <p className="text-slate-500 dark:text-slate-400 text-lg">No games available for your condition.</p>
          </motion.div>
        )}
      </main>

      <Chatbot />
    </div>
  );
}