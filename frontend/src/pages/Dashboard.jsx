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
  Github
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import Chatbot from "../components/Chatbot";
import { useBackgroundAnimation } from "../hooks/useBackgroundAnimation";

// Integrated Navbar Component
const ResponsiveNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          isScrolled
            ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-slate-200 dark:border-slate-800 py-3"
            : "bg-transparent border-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-indigo-600 p-2 rounded-xl text-white group-hover:scale-110 transition-transform duration-300">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                OpenSight
              </span>
            </Link>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/sign-in"
                className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/sign-up"
                className="px-5 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:bg-indigo-600 dark:hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-indigo-500/20"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-[60px] left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 md:hidden overflow-hidden"
          >
            <div className="p-4 flex flex-col gap-3">
              <Link
                to="/sign-in"
                className="w-full text-center py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link
                to="/sign-up"
                className="w-full text-center py-3 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/30"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Start Therapy
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default function LandingPage() {
  const { t } = useTranslation();
  const background = useBackgroundAnimation("adult");

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans selection:bg-indigo-500/30">
      {background}
      
      <ResponsiveNavbar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 md:pt-40 md:pb-32">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-5xl mx-auto"
        >
          {/* Badge: Open Source / Hackathon Project */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 dark:bg-slate-900/50 border border-indigo-100 dark:border-indigo-900/50 backdrop-blur-sm mb-8 shadow-sm"
          >
            <Github className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
              Free & Open Source Project
            </span>
          </motion.div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-slate-900 dark:text-white tracking-tight leading-[1.05] mb-8">
            {t("landing.title") || "Vision Therapy."}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-500 to-violet-600 bg-clip-text text-transparent pb-2 inline-block">
              {t("landing.gamified") || "Democratized."}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            {t("landing.subtitle") || "Clinically inspired eye exercises transformed into immersive browser games. 100% Free. No hardware required."}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-4 sm:px-0 mb-24">
            <Link
              to="/sign-up"
              className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all transform hover:-translate-y-1 text-lg"
            >
              Start Therapy Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/sign-in"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all hover:shadow-md text-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
            >
              Log In
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto"
        >
          {[
            {
              icon: Gamepad2,
              title: "Gamified Therapy",
              desc: "Engaging games designed to target specific vision conditions like Amblyopia and Strabismus.",
              color: "text-blue-500",
              bg: "bg-blue-50 dark:bg-blue-900/20",
            },
            {
              icon: Target,
              title: "Dichoptic Logic",
              desc: "Built using proven Red/Blue contrast methods to isolate and train the weak eye.",
              color: "text-rose-500",
              bg: "bg-rose-50 dark:bg-rose-900/20",
            },
            {
              icon: Zap,
              title: "Instant Access",
              desc: "No expensive VR headsets or subscriptions. Just grab 3D glasses and start playing.",
              color: "text-amber-500",
              bg: "bg-amber-50 dark:bg-amber-900/20",
            },
          ].map(({ icon: Icon, title, desc, color, bg }, i) => (
            <div
              key={i}
              className="p-8 sm:p-10 rounded-[2rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-indigo-900/10 transition-all duration-500 hover:-translate-y-2 group"
            >
              <div
                className={`w-16 h-16 rounded-2xl ${bg} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon className={`w-8 h-8 ${color}`} strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                {title}
              </h3>
              <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Trust/Mission Section */}
        <div className="mt-24 sm:mt-32 pt-16 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-10">
            A Free Initiative for Vision Health
          </p>
          <div className="flex flex-wrap justify-center gap-8 sm:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            {[
              "100% Free Forever",
              "Open Source Code",
              "Accessibility Focused",
              "No Ads or Tracking",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 text-lg text-slate-700 dark:text-slate-300 font-semibold"
              >
                <CheckCircle2 className="w-6 h-6 text-indigo-600" /> {item}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Chatbot />
    </div>
  );
}