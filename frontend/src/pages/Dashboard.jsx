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
  const [games, setGames] = useState([]);
  useEffect(() => {
    const condition = userProfile?.config?.condition;
    console.log('User Condition:', condition);
    setGames(getGamesForCondition(condition));
  }, [userProfile]);

  const isKids = ageGroup === 'kid';

  return (
    <div className="min-h-screen overflow-x-hidden bg-white font-sans selection:bg-purple-500/30 antialiased">
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 md:pt-40 md:pb-32">
        {/* Premium Greeting Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={`mb-8 sm:mb-12 ${isKids ? 'text-center' : 'text-left'}`}
        >
          <div className={`flex flex-col ${isKids ? 'items-center' : 'items-start justify-between'} gap-4 sm:gap-6`}>
            <div>
              <h1 className={`text-2xl sm:text-3xl md:text-4xl font-black ${isKids ? 'text-yellow-600 font-nunito' : 'text-gray-900'} mb-2`}
                style={{
                  textShadow: isKids
                    ? '0 4px 12px rgba(251, 191, 36, 0.4), 0 2px 4px rgba(0,0,0,0.1)'
                    : '0 4px 24px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                {isKids 
                  ? `Hello, ${userProfile?.name?.split(' ')[0] || 'Superstar'}! 🌟`
                  : `Welcome back, ${userProfile?.name || 'there'}`
                }
              </h1>
              <p className={`text-lg sm:text-xl ${isKids ? 'text-gray-700 font-nunito' : 'text-gray-600'} font-medium`}
                style={{
                  textShadow: isKids ? '0 2px 6px rgba(251, 191, 36, 0.3)' : '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                {isKids 
                  ? 'Ready for today\'s eye adventure? 🎯'
                  : `Continue your vision therapy journey • ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`
                }
              </p>
            </div>
            
            {/* Stats Cards */}
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 ${isKids ? 'w-full max-w-md' : 'w-auto'}`}>
              <div className={`p-3 sm:p-4 rounded-xl ${isKids ? 'bg-yellow-100 border-2 border-yellow-300' : 'bg-gray-50 border border-gray-200'}`}>
                <div className={`text-xs sm:text-sm ${isKids ? 'text-yellow-700 font-nunito font-bold' : 'text-gray-500 font-medium'} mb-1`}>
                  {isKids ? 'Level' : 'Condition'}
                </div>
                <div className={`text-lg sm:text-xl font-bold ${isKids ? 'text-yellow-800 font-nunito' : 'text-gray-900'}`}>
                  {isKids ? '🏆 Hero' : (userProfile?.config?.condition || 'Not set')}
                </div>
              </div>
              <div className={`p-3 sm:p-4 rounded-xl ${isKids ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-50 border border-gray-200'}`}>
                <div className={`text-xs sm:text-sm ${isKids ? 'text-blue-700 font-nunito font-bold' : 'text-gray-500 font-medium'} mb-1`}>
                  {isKids ? 'Power' : 'Difficulty'}
                </div>
                <div className={`text-lg sm:text-xl font-bold ${isKids ? 'text-blue-800 font-nunito' : 'text-gray-900'}`}>
                  {isKids ? '⚡ Super' : `${userProfile?.config?.difficulty || 5}/10`}
                </div>
              </div>
              <div className={`p-3 sm:p-4 rounded-xl ${isKids ? 'bg-green-100 border-2 border-green-300' : 'bg-gray-50 border border-gray-200'}`}>
                <div className={`text-xs sm:text-sm ${isKids ? 'text-green-700 font-nunito font-bold' : 'text-gray-500 font-medium'} mb-1`}>
                  {isKids ? 'Days' : 'Progress'}
                </div>
                <div className={`text-lg sm:text-xl font-bold ${isKids ? 'text-green-800 font-nunito' : 'text-gray-900'}`}>
                  {isKids ? '🌈 7' : '📊 Active'}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Games Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center max-w-5xl mx-auto px-4 sm:px-0"
        >
          <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-black tracking-tight leading-[1.05] mb-4 ${isKids ? 'font-nunito' : ''}`}
            style={{
              textShadow: isKids
                ? '0 4px 12px rgba(251, 191, 36, 0.4), 0 2px 4px rgba(0,0,0,0.1)'
                : '0 4px 24px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            {isKids ? '🎮 Your Therapy Games' : 'Your Therapy Games'}
          </h2>
        </motion.div>

        {/* Games Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto px-4 sm:px-0"
        >
          {games.map((game) => {
            const IconComponent = ICON_MAP[game.iconType] || Play;
            return (
              <motion.div
                key={game.id}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className={`p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-[2rem] bg-white/80 backdrop-blur-md border border-gray-200/60 shadow-sm hover:shadow-2xl transition-all duration-500 group ${
                  isKids ? 'border-4 border-yellow-300' : ''
                }`}
                style={{
                  boxShadow: isKids
                    ? '0 12px 40px rgba(251, 191, 36, 0.25), 0 6px 20px rgba(0,0,0,0.08)'
                    : '0 8px 32px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.08)',
                }}
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl ${
                    isKids
                      ? 'bg-gradient-to-br from-yellow-200 to-orange-300 group-hover:scale-110 shadow-md'
                      : 'bg-gradient-to-br from-purple-50 to-indigo-100 group-hover:scale-110 shadow-sm'
                  } flex items-center justify-center mb-4 sm:mb-6 lg:mb-8 transition-transform duration-300`}
                >
                  <IconComponent className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 ${
                    isKids ? 'text-yellow-600' : 'text-purple-600'
                  }`} strokeWidth={2} />
                </div>
                <h3 className={`text-lg sm:text-xl lg:text-2xl font-bold text-black mb-2 sm:mb-3 lg:mb-4 tracking-tight ${
                  isKids ? 'font-nunito' : ''
                }`}
                  style={{
                    textShadow: isKids
                      ? '0 2px 6px rgba(251, 191, 36, 0.3)'
                      : '0 2px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  {game.title}
                </h3>
                <p className={`text-sm sm:text-base lg:text-lg leading-relaxed mb-4 sm:mb-6 text-gray-600`}>
                  {game.description}
                </p>
                <Link
                  to={game.path}
                  className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition cursor-pointer ${
                    isKids
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-yellow-900 shadow-lg hover:shadow-xl'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                  }`}
                  style={{
                    boxShadow: isKids
                      ? '0 6px 20px rgba(251, 191, 36, 0.3)'
                      : '0 6px 20px rgba(147, 51, 234, 0.25)',
                  }}
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" /> Play
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
            <p className="text-gray-500 text-lg">No games available for your condition.</p>
          </motion.div>
        )}
      </main>

      <Chatbot />
    </div>
  );
}