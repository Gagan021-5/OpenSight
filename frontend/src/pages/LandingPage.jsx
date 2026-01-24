import { Link } from "react-router-dom";
import {
  ArrowRight,
  Gamepad2,
  Target,
  Zap,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";
import { useBackgroundAnimation } from "../hooks/useBackgroundAnimation";

export default function LandingPage() {
  const { t } = useTranslation();
  const background = useBackgroundAnimation("adult");

  return (
    <div className="min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans selection:bg-indigo-500/30">
      {background}
      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 mb-8">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
              New: AI Therapy Assistant
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-semibold text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-8">
            {t("landing.title") || "Vision Therapy"}
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-500 to-violet-600 bg-clip-text text-transparent">
              {t("landing.gamified") || "Reimagined."}
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t("landing.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/sign-up"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all transform hover:-translate-y-1"
            >
              {t("landing.getStarted")}{" "}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/sign-in"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all hover:shadow-md"
            >
              {t("landing.signIn")}
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
        >
          {[
            {
              icon: Gamepad2,
              title: t("landing.games"),
              desc: t("landing.gamesDesc"),
              color: "text-blue-500",
              bg: "bg-blue-50 dark:bg-blue-900/20",
            },
            {
              icon: Target,
              title: t("landing.logic"),
              desc: t("landing.logicDesc"),
              color: "text-rose-500",
              bg: "bg-rose-50 dark:bg-rose-900/20",
            },
            {
              icon: Zap,
              title: t("landing.progress"),
              desc: t("landing.progressDesc"),
              color: "text-amber-500",
              bg: "bg-amber-50 dark:bg-amber-900/20",
            },
          ].map(({ icon: Icon, title, desc, color, bg }, i) => (
            <div
              key={i}
              className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-indigo-900/10 transition-all duration-300 group"
            >
              <div
                className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
              >
                <Icon className={`w-7 h-7 ${color}`} strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                {title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Trust/Badges Section */}
        <div className="mt-24 pt-12 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-8">
            Trusted by families worldwide
          </p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Placeholders for logos if needed, or just text features */}
            {[
              "Clinically Verified",
              "Data Privacy First",
              "Accessibility Focused",
              "Open Source",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold"
              >
                <CheckCircle2 className="w-5 h-5 text-indigo-600" /> {item}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Chatbot />
    </div>
  );
}
