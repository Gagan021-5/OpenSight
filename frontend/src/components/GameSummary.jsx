import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, TrendingUp, Target, RotateCcw, Home, Star, Zap } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext.jsx';
import { getGameHistory } from '../utils/scoreTracker.js';

const GameSummary = ({ 
  isOpen, 
  onClose, 
  gameId, 
  gameTitle, 
  score, 
  duration, 
  onRestart,
  onBackToDashboard 
}) => {
  const { ageGroup } = useGlobal();
  const isKids = ageGroup === 'kid';
  const [history, setHistory] = useState(null);
  const [isNewBest, setIsNewBest] = useState(false);

  useEffect(() => {
    if (gameId && score !== undefined) {
      const gameHistory = getGameHistory(gameId);
      setHistory(gameHistory);
      setIsNewBest(!gameHistory || score > gameHistory.bestScore);
    }
  }, [gameId, score]);

  // Format duration to human-readable format
  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Generate warm encouraging messages
  const generateWarmMessage = () => {
    if (!history) {
      return isKids 
        ? "Great first try! You're amazing! 🌟" 
        : "Excellent start! Keep up the momentum!";
    }

    const improvement = score - history.lastScore;
    const improvementPercent = history.lastScore > 0 ? (improvement / history.lastScore) * 100 : 0;

    if (isNewBest) {
      return isKids 
        ? "🏆 NEW RECORD! You're a superstar!" 
        : "🏆 New Personal Best! Outstanding performance!";
    }

    if (improvement > 0) {
      return isKids 
        ? "You're getting stronger! 💪" 
        : "Great improvement! Your hard work is paying off!";
    }

    if (improvement === 0) {
      return isKids 
        ? "Amazing focus today! 🎯" 
        : "Consistent effort! That's the key to progress.";
    }

    return isKids 
      ? "Every try makes you better! 🌈" 
      : "Keep pushing! Every session builds strength.";
  };

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.3,
        when: "beforeChildren"
      }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const contentVariants = {
    hidden: { 
      scale: 0.8, 
      y: 50,
      opacity: 0 
    },
    visible: { 
      scale: 1, 
      y: 0,
      opacity: 1,
      transition: { 
        type: "spring",
        damping: 25,
        stiffness: 300,
        mass: 0.8
      }
    },
    exit: { 
      scale: 0.9, 
      y: 20,
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const statCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    })
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Summary Card */}
        <motion.div
          variants={contentVariants}
          className={`relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden ${
            isKids 
              ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200' 
              : 'bg-gradient-to-br from-slate-900 to-indigo-900 border border-slate-700'
          }`}
        >
          {/* Header */}
          <div className={`relative p-6 pb-4 ${
            isKids 
              ? 'bg-gradient-to-r from-yellow-400 to-orange-400' 
              : 'bg-gradient-to-r from-indigo-600 to-purple-600'
          }`}>
            {/* New Best Badge */}
            {isNewBest && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring",
                  damping: 15,
                  stiffness: 300,
                  delay: 0.3
                }}
                className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"
              >
                <Trophy size={14} />
                NEW BEST!
              </motion.div>
            )}

            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  damping: 20,
                  stiffness: 300,
                  delay: 0.2
                }}
                className={`w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center ${
                  isKids 
                    ? 'bg-white/20 backdrop-blur-sm' 
                    : 'bg-white/10 backdrop-blur-sm'
                }`}
              >
                <Target size={32} className="text-white" />
              </motion.div>
              
              <h2 className={`text-2xl font-black mb-2 ${
                isKids ? 'text-yellow-900' : 'text-white'
              }`}>
                {gameTitle}
              </h2>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`text-sm font-medium ${
                  isKids ? 'text-yellow-800' : 'text-white/90'
                }`}
              >
                {generateWarmMessage()}
              </motion.p>
            </div>
          </div>

          {/* Stats */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Current Score */}
              <motion.div
                custom={0}
                variants={statCardVariants}
                initial="hidden"
                animate="visible"
                className={`p-4 rounded-2xl text-center ${
                  isKids 
                    ? 'bg-yellow-100 border border-yellow-200' 
                    : 'bg-white/10 backdrop-blur-sm border border-white/20'
                }`}
              >
                <div className={`flex items-center justify-center mb-2 ${
                  isKids ? 'text-yellow-600' : 'text-indigo-300'
                }`}>
                  <Star size={20} />
                </div>
                <div className={`text-2xl font-black ${
                  isKids ? 'text-yellow-900' : 'text-white'
                }`}>
                  {score}
                </div>
                <div className={`text-xs font-medium ${
                  isKids ? 'text-yellow-700' : 'text-white/70'
                }`}>
                  Current Score
                </div>
              </motion.div>

              {/* Previous Best */}
              <motion.div
                custom={1}
                variants={statCardVariants}
                initial="hidden"
                animate="visible"
                className={`p-4 rounded-2xl text-center ${
                  isKids 
                    ? 'bg-orange-100 border border-orange-200' 
                    : 'bg-white/10 backdrop-blur-sm border border-white/20'
                }`}
              >
                <div className={`flex items-center justify-center mb-2 ${
                  isKids ? 'text-orange-600' : 'text-purple-300'
                }`}>
                  <Trophy size={20} />
                </div>
                <div className={`text-2xl font-black ${
                  isKids ? 'text-orange-900' : 'text-white'
                }`}>
                  {history?.bestScore || 0}
                </div>
                <div className={`text-xs font-medium ${
                  isKids ? 'text-orange-700' : 'text-white/70'
                }`}>
                  Previous Best
                </div>
              </motion.div>

              {/* Time Spent */}
              <motion.div
                custom={2}
                variants={statCardVariants}
                initial="hidden"
                animate="visible"
                className={`col-span-2 p-4 rounded-2xl text-center ${
                  isKids 
                    ? 'bg-green-100 border border-green-200' 
                    : 'bg-white/10 backdrop-blur-sm border border-white/20'
                }`}
              >
                <div className={`flex items-center justify-center mb-2 ${
                  isKids ? 'text-green-600' : 'text-emerald-300'
                }`}>
                  <Clock size={20} />
                </div>
                <div className={`text-2xl font-black ${
                  isKids ? 'text-green-900' : 'text-white'
                }`}>
                  {formatDuration(duration)}
                </div>
                <div className={`text-xs font-medium ${
                  isKids ? 'text-green-700' : 'text-white/70'
                }`}>
                  Time Spent
                </div>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <motion.div
              custom={3}
              variants={statCardVariants}
              initial="hidden"
              animate="visible"
              className="flex gap-3 pt-4"
            >
              <button
                onClick={onRestart}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold transition-all transform active:scale-95 ${
                  isKids
                    ? 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900 shadow-lg shadow-yellow-200/50'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30'
                }`}
              >
                <RotateCcw size={18} />
                Play Again
              </button>
              
              <button
                onClick={onBackToDashboard}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold transition-all transform active:scale-95 ${
                  isKids
                    ? 'bg-orange-400 hover:bg-orange-500 text-orange-900 shadow-lg shadow-orange-200/50'
                    : 'bg-slate-700 hover:bg-slate-600 text-white shadow-lg shadow-slate-500/30'
                }`}
              >
                <Home size={18} />
                Dashboard
              </button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GameSummary;
