import { Link } from "react-router-dom";
import {
  ArrowRight,
  Gamepad2,
  Target,
  Zap,
  Sparkles,
  CheckCircle2,
  Languages,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar.jsx";
import Chatbot from "../components/Chatbot.jsx";

export default function LandingPage() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const next = i18n.language === "hi" ? "en" : "hi";
    i18n.changeLanguage(next);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-white transition-colors duration-300 font-sans selection:bg-purple-500/30">
      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 1,
              delay: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 shadow-sm mb-12"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">
              New: AI Therapy Assistant
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              delay: 0.5,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-semibold text-black tracking-tight leading-[1.1] sm:leading-[1.05] mb-6 sm:mb-8 break-words"
            style={{
              textShadow: `
                0 1px 1px rgba(0,0,0,0.04),
                0 2px 2px rgba(0,0,0,0.06),
                0 4px 4px rgba(0,0,0,0.08),
                0 8px 8px rgba(0,0,0,0.06),
                0 16px 16px rgba(0,0,0,0.04),
                0 32px 32px rgba(0,0,0,0.02),
                0 0 1px rgba(255,255,255,0.9) inset,
                0 0 2px rgba(255,255,255,0.7) inset,
                0 0 4px rgba(255,255,255,0.5) inset
              `.replace(/\n/g, ' '),
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 25%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0.65) 75%, rgba(255,255,255,0.55) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'contrast(1.05) brightness(1.02)',
            }}
          >
            <span className="block" style={{
              WebkitTextFillColor: 'black',
              background: 'none',
              textShadow: `
                0 1px 1px rgba(0,0,0,0.03),
                0 2px 2px rgba(0,0,0,0.05),
                0 4px 4px rgba(0,0,0,0.07),
                0 8px 8px rgba(0,0,0,0.05),
                0 16px 16px rgba(0,0,0,0.03),
                0 0 1px rgba(255,255,255,0.95) inset,
                0 0 2px rgba(255,255,255,0.8) inset,
                0 0 4px rgba(255,255,255,0.6) inset
              `.replace(/\n/g, ' '),
              filter: 'contrast(1.03) brightness(1.01)',
            }}>{t("landing.title") || "Vision Therapy"}</span>
            <span
              className="block"
              style={{
                background: "linear-gradient(135deg, #9333ea 0%, #8b5cf6 12.5%, #6366f1 25%, #8b5cf6 37.5%, #9333ea 50%, #8b5cf6 62.5%, #6366f1 75%, #8b5cf6 87.5%, #9333ea 100%)",
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: `
                  0 1px 1px rgba(147, 51, 234, 0.2),
                  0 2px 2px rgba(147, 51, 234, 0.3),
                  0 4px 4px rgba(147, 51, 234, 0.25),
                  0 8px 8px rgba(147, 51, 234, 0.2),
                  0 16px 16px rgba(147, 51, 234, 0.15),
                  0 32px 32px rgba(147, 51, 234, 0.1),
                  0 0 1px rgba(255,255,255,0.95) inset,
                  0 0 2px rgba(255,255,255,0.8) inset,
                  0 0 4px rgba(255,255,255,0.6) inset,
                  0 0 30px rgba(147, 51, 234, 0.4),
                  0 0 60px rgba(147, 51, 234, 0.2)
                `.replace(/\n/g, ' '),
                filter: 'contrast(1.08) brightness(1.05) saturate(1.1)',
              }}
            >
              {t("landing.gamified") || "Reimagined."}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              delay: 0.7,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="text-lg sm:text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-12 sm:mb-16 leading-relaxed px-4 sm:px-0 font-medium"
            style={{
              textShadow: `
                0 1px 1px rgba(0,0,0,0.02),
                0 2px 2px rgba(0,0,0,0.03),
                0 4px 4px rgba(0,0,0,0.02),
                0 8px 8px rgba(0,0,0,0.01),
                0 0 1px rgba(255,255,255,0.8) inset,
                0 0 2px rgba(255,255,255,0.6) inset,
                0 0 4px rgba(255,255,255,0.4) inset
              `.replace(/\n/g, ' '),
              filter: 'brightness(1.03) contrast(1.04) saturate(1.02)',
            }}
          >
            {t("landing.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              delay: 0.9,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-4 sm:px-0"
          >
            <Link
              to="/sign-up"
              className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-base sm:text-lg cursor-pointer"
              style={{
                boxShadow:
                  "0 8px 24px rgba(147, 51, 234, 0.25), 0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              {t("landing.getStarted")}{" "}
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/sign-in"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent border border-gray-300 bg-transparent hover:bg-gray-50 transition-all duration-300 hover:shadow-md text-base sm:text-lg cursor-pointer"
              style={{
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              {t("landing.signIn")}
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-16 px-4 sm:px-0"
        >
          {[
            {
              icon: Gamepad2,
              title: t("landing.games"),
              desc: t("landing.gamesDesc"),
              color: "text-purple-600",
              bg: "bg-gradient-to-br from-purple-50 to-purple-100",
            },
            {
              icon: Target,
              title: t("landing.logic"),
              desc: t("landing.logicDesc"),
              color: "text-purple-600",
              bg: "bg-gradient-to-br from-purple-50 to-purple-100",
            },
            {
              icon: Zap,
              title: t("landing.progress"),
              desc: t("landing.progressDesc"),
              color: "text-purple-600",
              bg: "bg-gradient-to-br from-purple-50 to-purple-100",
            },
          ].map(({ icon: Icon, title, desc, color, bg }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                delay: i * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="p-8 rounded-3xl bg-white border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 group"
              style={{
                boxShadow:
                  "0 8px 32px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
              }}
              whileHover={{ y: -8 }}
            >
              <div
                className={`w-16 h-16 rounded-2xl ${bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm`}
              >
                <Icon className={`w-8 h-8 ${color}`} strokeWidth={2} />
              </div>
              <h3
                className="text-xl font-bold text-black mb-3"
                style={{ textShadow: "0 2px 4px rgba(0,0,0,0.04)" }}
              >
                {title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust/Badges Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 1,
            delay: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="mt-32 pt-16 border-t border-gray-200 text-center"
        >
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-12">
            Trusted by families worldwide
          </p>
          <div className="flex flex-wrap justify-center gap-x-16 gap-y-8 opacity-70 grayscale hover:grayscale-0 transition-all duration-700">
            {[
              "Clinically Verified",
              "Data Privacy First",
              "Accessibility Focused",
              "Open Source",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 text-gray-700 font-semibold text-lg"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
              >
                <CheckCircle2 className="w-6 h-6 text-purple-600" /> {item}
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      <Chatbot />
    </div>
  );
}
