import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Sparkles, CheckCircle, ArrowRight, Clock, LogIn, UserPlus, Target, Zap } from 'lucide-react';
import ZoomingTarget from '../components/ZoomingTarget.jsx';
import WhackATarget from '../components/WhackATarget.jsx';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  QUICK 5-MIN EYE DE-STRAIN ROUTINE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  Clean, clinical light-mode teaser routine for eye strain relief.
 *
 *  Phase 1 (2.5 min): Dynamic Focus (ZoomingTarget)
 *  Phase 2 (2.5 min): Saccadic Precision (WhackATarget)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

const PHASE_DURATION_MS = 150_000; // 2.5 minutes per phase
const PHASES = [
  {
    id: 'focus',
    title: 'Dynamic Focus',
    subtitle: 'Accommodative Rock',
    description: 'Follow the pulsing target to flex your ciliary muscles.',
    color: '#4F46E5',
    icon: Target,
  },
  {
    id: 'saccadic',
    title: 'Saccadic Precision',
    subtitle: 'Rapid Eye Jumps',
    description: 'Tap flashing targets to train rapid saccadic eye movements.',
    color: '#6366F1',
    icon: Zap,
  },
];

export default function DestrainRoutine() {
  const [routineState, setRoutineState] = useState('INTRO'); // INTRO | PLAYING | TRANSITION | COMPLETE
  const [currentPhase, setCurrentPhase] = useState(0);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(PHASE_DURATION_MS);
  const [totalScore, setTotalScore] = useState(0);

  const timerRef = useRef(null);
  const phaseStartRef = useRef(null);
  const scoresRef = useRef([0, 0]);

  // ── Timer logic ──
  useEffect(() => {
    if (routineState !== 'PLAYING') return;

    phaseStartRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - phaseStartRef.current;
      const remaining = Math.max(0, PHASE_DURATION_MS - elapsed);
      setPhaseTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        if (currentPhase < PHASES.length - 1) {
          setRoutineState('TRANSITION');
        } else {
          setRoutineState('COMPLETE');
        }
      }
    }, 250);

    return () => clearInterval(timerRef.current);
  }, [routineState, currentPhase]);

  const startRoutine = () => {
    setCurrentPhase(0);
    setTotalScore(0);
    scoresRef.current = [0, 0];
    setPhaseTimeLeft(PHASE_DURATION_MS);
    setRoutineState('PLAYING');
  };

  const advancePhase = () => {
    setCurrentPhase(prev => prev + 1);
    setPhaseTimeLeft(PHASE_DURATION_MS);
    setRoutineState('PLAYING');
  };

  const handleGameEnd = useCallback((score) => {
    scoresRef.current[currentPhase] = score;
    setTotalScore(scoresRef.current.reduce((a, b) => a + b, 0));
  }, [currentPhase]);

  const formatTime = (ms) => {
    const totalSec = Math.ceil(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((currentPhase * PHASE_DURATION_MS) + (PHASE_DURATION_MS - phaseTimeLeft)) / (PHASES.length * PHASE_DURATION_MS) * 100;

  // ── INTRO SCREEN ──
  if (routineState === 'INTRO') {
    return (
      <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 flex items-center justify-center p-6 font-sans relative overflow-hidden">
        {/* Ambient background blur */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-200/40 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-200/30 blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-lg w-full bg-white/80 border border-slate-200/80 shadow-2xl shadow-slate-200/50 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-10 text-center relative z-10"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-200">
            <Eye className="w-8 h-8" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-3">
            Quick Eye <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-indigo-600">De-Strain</span>
          </h1>
          <p className="text-slate-500 text-base mb-8 max-w-sm mx-auto font-medium leading-relaxed">
            A 5-minute clinical exercise routine to relieve digital eye strain. No special equipment needed.
          </p>

          {/* Phase cards */}
          <div className="space-y-3 mb-8">
            {PHASES.map((phase) => {
              const PhaseIcon = phase.icon;
              return (
                <div
                  key={phase.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-left"
                >
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 shrink-0">
                    <PhaseIcon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 font-bold text-base tracking-tight">{phase.title}</p>
                    <p className="text-slate-500 text-xs truncate">{phase.description}</p>
                  </div>
                  <div className="text-slate-400 text-xs font-mono font-semibold shrink-0">2:30</div>
                </div>
              );
            })}
          </div>

          <button
            onClick={startRoutine}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-base rounded-2xl shadow-xl shadow-slate-200 transition-all hover:scale-[1.01] active:scale-95"
          >
            Start De-Strain Routine
          </button>

          <p className="text-slate-400 text-xs mt-4 font-medium">
            No equipment required · Works on any screen · Glassless mode
          </p>
        </motion.div>
      </div>
    );
  }

  // ── TRANSITION SCREEN (between phases) ──
  if (routineState === 'TRANSITION') {
    const nextPhase = PHASES[currentPhase + 1];
    const NextPhaseIcon = nextPhase?.icon || Target;
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-100/60 blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full bg-white/80 border border-slate-200/80 shadow-2xl shadow-slate-200/50 backdrop-blur-xl rounded-[2.5rem] p-8 text-center relative z-10"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Phase 1 Complete</h2>
          <p className="text-slate-500 text-sm mb-6 font-medium">Excellent focus work. Next phase:</p>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 text-left mb-6 flex items-center gap-4">
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 shrink-0">
              <NextPhaseIcon size={22} />
            </div>
            <div>
              <p className="text-slate-900 font-bold text-base tracking-tight">{nextPhase?.title}</p>
              <p className="text-slate-500 text-xs">{nextPhase?.description}</p>
            </div>
          </div>

          <button
            onClick={advancePhase}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-base rounded-2xl shadow-xl shadow-slate-200 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
          >
            Continue <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    );
  }

  // ── COMPLETE SCREEN ──
  if (routineState === 'COMPLETE') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-100/60 blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-white/80 border border-slate-200/80 shadow-2xl shadow-slate-200/50 backdrop-blur-xl rounded-[2.5rem] p-8 text-center relative z-10"
        >
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-200">
            <Sparkles className="w-8 h-8" />
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Routine Complete</h2>
          <p className="text-slate-500 text-sm mb-6 font-medium">Your 5-minute de-strain session is finished.</p>

          {/* 20-20-20 Rule */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 mb-6 text-left">
            <p className="text-slate-900 font-bold text-sm mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-600" /> Follow the 20-20-20 Rule
            </p>
            <ul className="space-y-2 text-slate-600 text-xs sm:text-sm font-medium">
              <li>• Look at something <strong className="text-slate-900">20 feet away</strong>.</li>
              <li>• Focus on it for <strong className="text-slate-900">20 seconds</strong>.</li>
              <li>• Relax and blink naturally.</li>
            </ul>
          </div>

          {/* CTA for unauthenticated users */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 mb-6">
            <p className="text-slate-900 font-bold text-sm mb-1">Track your progress over time</p>
            <p className="text-slate-500 text-xs mb-4">Sign up to log streaks, save scores, and access assigned exercises.</p>
            <div className="flex gap-3">
              <Link
                to="/sign-up"
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition text-sm shadow-md"
              >
                <UserPlus className="w-4 h-4" /> Sign Up
              </Link>
              <Link
                to="/sign-in"
                className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 transition text-sm"
              >
                <LogIn className="w-4 h-4" /> Sign In
              </Link>
            </div>
          </div>

          <button
            onClick={startRoutine}
            className="w-full py-3 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition text-sm"
          >
            Repeat Routine
          </button>
        </motion.div>
      </div>
    );
  }

  // ── PLAYING STATE ──
  const phase = PHASES[currentPhase];
  const CurrentPhaseIcon = phase.icon;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      {/* Top Progress Bar */}
      <div className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          {/* Phase label */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
              <CurrentPhaseIcon size={16} />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">{phase.title}</p>
              <p className="text-slate-400 text-xs">{phase.subtitle}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Timer */}
          <div className="flex items-center gap-1.5 text-slate-300 font-mono text-sm font-bold min-w-[60px]">
            <Clock className="w-3.5 h-3.5" />
            {formatTime(phaseTimeLeft)}
          </div>

          {/* Phase dots */}
          <div className="flex gap-1.5">
            {PHASES.map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i < currentPhase ? 'bg-indigo-400' :
                  i === currentPhase ? 'bg-white' :
                  'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Game area */}
      <div className="flex-1 flex items-center justify-center">
        {currentPhase === 0 ? (
          <ZoomingTarget onGameEnd={handleGameEnd} requiresGlasses={false} />
        ) : (
          <WhackATarget onGameEnd={handleGameEnd} requiresGlasses={false} />
        )}
      </div>
    </div>
  );
}
