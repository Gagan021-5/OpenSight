import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Gamepad2,
  Target,
  Zap,
  Sparkles,
  Play,
  Activity,
  Trophy,
  CalendarDays,
  ArrowUpRight,
  Eye,
  Timer
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useGlobal } from "../context/GlobalContext.jsx";
import { getGamesForCondition } from "../config/gameRegistry.js";
import Chatbot from "../components/Chatbot.jsx";
import useDailyStreak from "../hooks/useDailyStreak.js";

// --- Configuration & Helpers ---

const ICON_MAP = {
  Gamepad2,
  Target,
  Zap,
  Sparkles,
  Play,
};

const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } },
  },
};

// --- Sub-Components ---

const StatCard = ({ icon: Icon, label, value, isKids, colorTheme }) => {
  // Explicit styling map to ensure high contrast on all devices
  const THEME_STYLES = {
    yellow: {
      bg: "bg-amber-100/90",
      border: "border-4 border-amber-300",
      textMain: "text-amber-950 font-nunito font-black",
      textSub: "text-amber-800 font-nunito font-bold",
      iconBg: "bg-amber-400 border-2 border-yellow-200",
      iconColor: "text-amber-950"
    },
    blue: {
      bg: "bg-sky-100/90",
      border: "border-4 border-sky-300",
      textMain: "text-sky-950 font-nunito font-black",
      textSub: "text-sky-800 font-nunito font-bold",
      iconBg: "bg-sky-400 border-2 border-sky-200",
      iconColor: "text-sky-950"
    },
    green: {
      bg: "bg-emerald-100/90",
      border: "border-4 border-emerald-300",
      textMain: "text-emerald-950 font-nunito font-black",
      textSub: "text-emerald-800 font-nunito font-bold",
      iconBg: "bg-emerald-400 border-2 border-emerald-200",
      iconColor: "text-emerald-950"
    },
    slate: { // Adult Default
      bg: "bg-white/60 backdrop-blur-xl",
      border: "border border-slate-200/60",
      textMain: "text-slate-900 font-bold",
      textSub: "text-slate-500 font-bold",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600"
    }
  };

  const theme = isKids ? THEME_STYLES[colorTheme] || THEME_STYLES.yellow : THEME_STYLES.slate;

  return (
    <motion.div
      variants={ANIMATION_VARIANTS.item}
      className={`relative overflow-hidden p-5 transition-all duration-300 ${
        isKids ? 'rounded-3xl shadow-lg shadow-amber-100/60 hover:scale-105' : 'rounded-2xl'
      } ${theme.bg} ${theme.border}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs uppercase tracking-wider mb-1 ${theme.textSub}`}>
            {label}
          </p>
          <h3 className={`text-2xl sm:text-3xl tracking-tight ${theme.textMain}`}>
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-2xl ${theme.iconBg} ${theme.iconColor} shadow-md`}>
          <Icon size={26} strokeWidth={isKids ? 3 : 2} />
        </div>
      </div>
    </motion.div>
  );
};

const GameCard = ({ game, isKids }) => {
  const IconComponent = ICON_MAP[game.iconType] || Play;
  const isGlassless = game.requiresGlasses === false;
  
  return (
    <motion.div
      variants={ANIMATION_VARIANTS.item}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`group relative flex flex-col h-full overflow-hidden transition-all duration-500 ${
        isKids
          ? "bg-white border-4 border-amber-200/90 rounded-[2.5rem] shadow-xl shadow-amber-100/60 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-200/80"
          : "bg-white/80 border-white/60 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 backdrop-blur-md rounded-[2rem] border"
      }`}
    >
      {/* Card Header Background */}
      <div className={`absolute inset-x-0 top-0 h-32 transition-opacity duration-500 ${
        isKids 
          ? "bg-gradient-to-b from-amber-100/80 via-yellow-50/50 to-transparent opacity-80 group-hover:opacity-100" 
          : "bg-gradient-to-b from-indigo-100 to-transparent opacity-20 group-hover:opacity-30"
      }`} />

      <div className="relative p-8 flex flex-col h-full z-10">
        {/* Mode Badge */}
        {isKids ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4 w-fit bg-amber-100 text-amber-900 border border-amber-300 font-nunito shadow-sm">
            <span>⭐ Super Quest</span>
          </div>
        ) : (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-4 w-fit ${
            isGlassless
              ? "bg-slate-100 text-slate-700 border border-slate-200"
              : "bg-indigo-50 text-indigo-700 border border-indigo-200"
          }`}>
            {isGlassless ? (
              <><Eye size={12} /> Glassless</>
            ) : (
              <><Sparkles size={12} /> Dichoptic · Glasses Required</>
            )}
          </div>
        )}

        {/* Icon Container */}
        <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${
          isKids
            ? "bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 text-amber-950 shadow-amber-200/80 border-2 border-yellow-200"
            : "bg-gradient-to-br from-slate-800 to-indigo-950 text-white"
        }`}>
          <IconComponent size={34} strokeWidth={isKids ? 2.5 : 2} />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className={`text-2xl font-bold mb-3 ${isKids ? "text-slate-900 font-nunito font-black text-2xl" : "text-slate-900 tracking-tight"}`}>
            {game.title}
          </h3>
          <p className={`text-base leading-relaxed mb-6 ${isKids ? "text-slate-600 font-nunito font-semibold" : "text-slate-500"}`}>
            {game.description}
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          <Link
            to={game.path}
            className={`w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all duration-300 group-hover:gap-3 ${
              isKids
                ? "bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-amber-950 font-nunito font-black text-lg shadow-lg shadow-amber-200 border-2 border-yellow-300"
                : "bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200"
            }`}
          >
            <span>{isKids ? "Play Mission 🚀" : "Play Now"}</span>
            {!isKids && <ArrowUpRight size={20} strokeWidth={3} />}
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main Component ---

export default function Dashboard() {
  const { t } = useTranslation();
  const { userProfile, ageGroup } = useGlobal();
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const streak = useDailyStreak();
  
  useEffect(() => {
    const condition = userProfile?.config?.condition;
    setGames(getGamesForCondition(condition));
  }, [userProfile]);

  const isKids = ageGroup === 'kid';

  // Dynamic Styles based on mode
  const bgStyle = isKids 
    ? "bg-[#FFF8E7] selection:bg-yellow-200" // Use a solid cream color for kids background
    : "bg-slate-50 selection:bg-indigo-100";

  return (
    <div className={`min-h-screen w-full relative overflow-x-hidden ${bgStyle}`}>
      
      {/* Ambient Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-40 mix-blend-multiply animate-blob ${
          isKids ? "bg-yellow-200" : "bg-blue-200"
        }`} />
        <div className={`absolute top-[10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-40 mix-blend-multiply animate-blob animation-delay-2000 ${
          isKids ? "bg-orange-200" : "bg-purple-200"
        }`} />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-24 md:pt-36">
        
        {/* Header Section */}
        <motion.div 
          initial="hidden"
          animate="show"
          variants={ANIMATION_VARIANTS.container}
          className="grid lg:grid-cols-[1.2fr,1fr] gap-12 mb-20 items-end"
        >
          {/* Greeting */}
          <div className="space-y-4">
            <motion.div variants={ANIMATION_VARIANTS.item}>
              <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-2 ${
                isKids ? "bg-white text-yellow-700 shadow-sm border border-yellow-100" : "bg-white text-slate-500 border border-slate-200"
              }`}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </motion.div>
            
            <motion.h1 
              variants={ANIMATION_VARIANTS.item}
              className={`text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1] ${
                isKids ? "text-slate-900 font-nunito" : "text-slate-900"
              }`}
            >
              {isKids ? (
                <>
                  Hi, <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500 inline-block transform hover:scale-105 transition-transform cursor-default">{userProfile?.name?.split(' ')[0] || 'Hero'}!</span> 🚀
                </>
              ) : (
                <>
                  Hi, <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-indigo-600">
                    {userProfile?.name?.split(' ')[0] || 'There'}!
                  </span>
                </>
              )}
            </motion.h1>

            <motion.p 
              variants={ANIMATION_VARIANTS.item}
              className={`text-lg sm:text-xl max-w-lg ${isKids ? "text-slate-600 font-nunito font-semibold" : "text-slate-500 font-medium"}`}
            >
              {isKids 
                ? "Your eyes are ready for an adventure! Pick a game below to charge up your super vision."
                : "Your therapy progress is looking stable. Continue your daily regimen to maintain optimal visual acuity."
              }
            </motion.p>
          </div>

          {/* Stats Grid - Now Stacked Vertically on Mobile, Grid on Desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            <StatCard 
              icon={Activity} 
              label={isKids ? "Your Mission" : "Condition"} 
              value={isKids ? "Vision Quest" : (userProfile?.config?.condition || "N/A")}
              colorTheme="yellow"
              isKids={isKids}
            />
            <StatCard 
              icon={Zap} 
              label={isKids ? "Super Power" : "Difficulty"} 
              value={isKids ? "Level 5" : `${userProfile?.config?.difficulty || 5}/10`}
              colorTheme="blue"
              isKids={isKids}
            />
            <StatCard 
              icon={isKids ? Trophy : CalendarDays} 
              label={isKids ? "Streak" : "Adherence"} 
              value={isKids ? `${streak} Days!` : `${streak} Day Streak`}
              colorTheme="green"
              isKids={isKids}
            />
          </div>
        </motion.div>

        {/* Divider */}
        <motion.div 
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-12"
        />

        {/* ── Quick De-Strain Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-12"
        >
          <button
            onClick={() => navigate('/destrain')}
            className={`w-full group relative overflow-hidden rounded-3xl border transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 text-left ${
              isKids
                ? "bg-gradient-to-r from-yellow-400 to-orange-500 border-yellow-300 shadow-xl shadow-yellow-200/40 hover:shadow-yellow-300/50"
                : "bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-indigo-800/40 shadow-xl shadow-slate-900/10 hover:shadow-indigo-900/20"
            }`}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-[-20%] right-[-10%] w-64 h-64 rounded-full bg-white/30 blur-3xl" />
              <div className="absolute bottom-[-20%] left-[-5%] w-48 h-48 rounded-full bg-white/20 blur-2xl" />
            </div>

            <div className="relative flex items-center gap-6 p-6 sm:p-8">
              <div className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3 ${
                isKids ? "bg-white/30 backdrop-blur-sm" : "bg-indigo-500/20 border border-indigo-400/30 backdrop-blur-sm"
              }`}>
                <Eye className="w-8 h-8 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`text-xl sm:text-2xl font-black text-white ${isKids ? 'font-nunito' : 'tracking-tight'}`}>
                    {isKids ? '🚀 Quick Eye Power-Up!' : 'Quick 5-Min Eye De-Strain'}
                  </h3>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-[10px] font-semibold text-white/90 uppercase tracking-wider">
                    <Timer size={10} /> 5 min
                  </span>
                </div>
                <p className={`text-white/80 text-sm sm:text-base ${isKids ? 'font-nunito' : ''}`}>
                  {isKids
                    ? 'A quick mission to recharge your super vision — no glasses needed!'
                    : 'Accommodative focus + saccadic precision — relieve digital eye strain instantly. No glasses needed.'
                  }
                </p>
              </div>

              <ArrowUpRight className="shrink-0 w-6 h-6 text-white/70 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </div>
          </button>
        </motion.div>

        {/* Games Section */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-8">
            <Gamepad2 className={isKids ? "text-yellow-500" : "text-slate-900"} size={28} />
            <h2 className={`text-3xl font-black ${isKids ? "text-slate-900 font-nunito" : "text-slate-900"}`}>
              {isKids ? "Choose Your Game" : "Prescribed Exercises"}
            </h2>
          </div>

          <motion.div 
            variants={ANIMATION_VARIANTS.container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {games.length > 0 ? (
              games.map((game) => (
                <GameCard key={game.id} game={game} isKids={isKids} />
              ))
            ) : (
              <motion.div variants={ANIMATION_VARIANTS.item} className="col-span-full py-20 text-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50/50">
                <p className="text-slate-500 text-lg font-medium">No therapeutic modules currently assigned.</p>
              </motion.div>
            )}
          </motion.div>
        </div>

      </main>

      <Chatbot />
    </div>
  );
}