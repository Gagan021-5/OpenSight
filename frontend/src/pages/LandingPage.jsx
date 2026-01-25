import { Link } from "react-router-dom";
import {
  ArrowRight,
  Gamepad2,
  Target,
  Zap,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  BrainCircuit,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar.jsx";
import Chatbot from "../components/Chatbot.jsx";

const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const FeatureCard = ({ icon: Icon, title, desc, delay }) => (
  <motion.div
    variants={FADE_UP_VARIANTS}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-50px" }}
    transition={{ delay }}
    className="group p-8 rounded-[2rem] bg-white border border-slate-200/60 shadow-lg shadow-slate-200/40 hover:shadow-2xl hover:shadow-indigo-200/20 hover:-translate-y-1 transition-all duration-500"
  >
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
      <Icon className="w-8 h-8 text-indigo-600 group-hover:text-purple-600 transition-colors" strokeWidth={1.5} />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
      {title}
    </h3>
    <p className="text-slate-600 leading-relaxed text-base">
      {desc}
    </p>
  </motion.div>
);

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      <Navbar />

      {/* Decorative Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-indigo-50/50 to-transparent" />
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-200/20 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-200/20 blur-[120px]" />
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <main className="relative z-10 pt-32 pb-24">
        
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-24 sm:mb-32">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold mb-8 hover:bg-indigo-100 transition-colors cursor-default"
          >
            <Sparkles size={14} className="text-indigo-500" />
            <span>New: AI Dr. Sight Assistant</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tight leading-[1.05] mb-6 max-w-5xl mx-auto"
          >
            <span className="block">{t("landing.title") || "Vision Therapy"}</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient-x pb-2">
              {t("landing.gamified") || "Reimagined."}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed font-medium"
          >
            {t("landing.subtitle") || "Clinically inspired exercises gamified for Amblyopia, Strabismus, and Convergence Insufficiency. Accessible anywhere, anytime."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4"
          >
            <Link
              to="/sign-up"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all duration-300 shadow-xl shadow-slate-200 hover:shadow-2xl hover:-translate-y-1 text-lg group"
            >
              {t("landing.getStarted") || "Start Therapy Now"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              to="/sign-in"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all duration-300 hover:shadow-md text-lg"
            >
              {t("landing.signIn") || "Patient Login"}
            </Link>
          </motion.div>

          {/* Social Proof / Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 pt-8 border-t border-slate-200/60 max-w-4xl mx-auto"
          >
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Trusted Standards</p>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-12 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              {[
                { icon: ShieldCheck, text: "Privacy First" },
                { icon: BrainCircuit, text: "Neuroplasticity Based" },
                { icon: Globe, text: "Open Source" },
                { icon: CheckCircle2, text: "Clinically Verified" }
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-slate-700 font-bold">
                  <Icon size={20} className="text-indigo-600" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* FEATURES GRID */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Gamepad2}
              title={t("landing.games") || "Gamified Therapy"}
              desc={t("landing.gamesDesc") || "Engaging exercises designed to break suppression and improve binocular vision without the boredom of traditional therapy."}
              delay={0.1}
            />
            <FeatureCard 
              icon={Target}
              title={t("landing.logic") || "Dichoptic Training"}
              desc={t("landing.logicDesc") || "Advanced red-blue separation logic ensures each eye works independently before fusing images together."}
              delay={0.2}
            />
            <FeatureCard 
              icon={Zap}
              title={t("landing.progress") || "Real-time Analytics"}
              desc={t("landing.progressDesc") || "Track your visual acuity improvements with detailed charts, streaks, and AI-driven insights."}
              delay={0.3}
            />
          </div>
        </section>

      </main>

      <Chatbot />
    </div>
  );
}