import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Sparkles, CheckCircle, ArrowRight, Clock, LogIn, UserPlus } from 'lucide-react';
import ZoomingTarget from '../components/ZoomingTarget.jsx';
import WhackATarget from '../components/WhackATarget.jsx';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  QUICK 5-MIN EYE DE-STRAIN ROUTINE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  Public route — accessible without login as a teaser feature.
 *
 *  Phase 1 (2.5 min): Dynamic Focus (ZoomingTarget)
 *  Phase 2 (2.5 min): Saccadic Precision (WhackATarget)
 *
 *  After completion, shows a summary with 20-20-20 rule reminder
 *  and a sign-up prompt for unauthenticated visitors.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

const PHASE_DURATION_MS = 150_000; // 2.5 minutes per phase
const PHASES = [
  {
    id: 'focus',
    title: 'Dynamic Focus',
    subtitle: 'Accommodative Rock',
    description: 'Follow the pulsing target to flex your ciliary muscles.',
    color: '#10B981',
    icon: '🎯',
  },
  {
    id: 'saccadic',
    title: 'Saccadic Precision',
    subtitle: 'Rapid Eye Jumps',
    description: 'Tap the flashing targets to train your saccadic eye movements.',
    color: '#8B5CF6',
    icon: '⚡',
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
        // Move to next phase or complete
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
      <div className="min-h-screen bg-[#0A0E17] flex items-center justify-center p-6 font-sans">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-lg w-full text-center"
        >
          {/* Glow backdrop */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
          </div>

          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
              <Eye className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3">
              Quick Eye <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">De-Strain</span>
            </h1>
            <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
              A 5-minute routine to relieve digital eye strain. No glasses needed — just your screen.
            </p>

            {/* Phase cards */}
            <div className="space-y-3 mb-8">
              {PHASES.map((phase, i) => (
                <div
                  key={phase.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-left"
                >
                  <div className="text-3xl">{phase.icon}</div>
                  <div className="flex-1">
                    <p className="text-white font-bold">{phase.title}</p>
                    <p className="text-slate-400 text-sm">{phase.description}</p>
                  </div>
                  <div className="text-slate-500 text-xs font-mono">2:30</div>
                </div>
              ))}
            </div>

            <button
              onClick={startRoutine}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold text-lg rounded-2xl shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-95"
            >
              Start De-Strain Routine
            </button>

            <p className="text-slate-600 text-xs mt-4">
              No equipment needed · Works on any screen · Glassless exercises
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── TRANSITION SCREEN (between phases) ──
  if (routineState === 'TRANSITION') {
    const nextPhase = PHASES[currentPhase + 1];
    return (
      <div className="min-h-screen bg-[#0A0E17] flex items-center justify-center p-6 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Phase 1 Complete!</h2>
          <p className="text-slate-400 mb-6">Great focus work. Take a breath — next up:</p>

          <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-left mb-6">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{nextPhase?.icon}</div>
              <div>
                <p className="text-white font-bold text-lg">{nextPhase?.title}</p>
                <p className="text-slate-400 text-sm">{nextPhase?.description}</p>
              </div>
            </div>
          </div>

          <button
            onClick={advancePhase}
            className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 text-white font-bold text-lg rounded-2xl shadow-xl shadow-violet-500/25 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
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
      <div className="min-h-screen bg-[#0A0E17] flex items-center justify-center p-6 font-sans">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-2xl">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-3xl font-black text-white mb-2">Eyes Refreshed! 🎉</h2>
          <p className="text-slate-400 mb-8">Your 5-minute de-strain routine is complete.</p>

          {/* 20-20-20 Rule */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 mb-6 text-left">
            <p className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" /> Follow the 20-20-20 Rule
            </p>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li>👀 Look at something <strong className="text-white">20 feet away</strong>.</li>
              <li>⏱️ Focus on it for <strong className="text-white">20 seconds</strong>.</li>
              <li>🧘 Relax and blink naturally.</li>
            </ul>
          </div>

          {/* CTA for unauthenticated users */}
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-5 mb-6">
            <p className="text-white font-bold mb-1">Track your progress over time</p>
            <p className="text-slate-400 text-sm mb-4">Sign up to log streaks, save scores, and unlock Amblyopia dichoptic therapy.</p>
            <div className="flex gap-3">
              <Link
                to="/sign-up"
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition text-sm"
              >
                <UserPlus className="w-4 h-4" /> Sign Up
              </Link>
              <Link
                to="/sign-in"
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition text-sm"
              >
                <LogIn className="w-4 h-4" /> Sign In
              </Link>
            </div>
          </div>

          <button
            onClick={startRoutine}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition border border-slate-700"
          >
            Repeat Routine
          </button>
        </motion.div>
      </div>
    );
  }

  // ── PLAYING STATE ──
  const phase = PHASES[currentPhase];

  return (
    <div className="min-h-screen bg-[#0A0E17] flex flex-col font-sans">
      {/* Top Progress Bar */}
      <div className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          {/* Phase label */}
          <div className="flex items-center gap-2">
            <span className="text-lg">{phase.icon}</span>
            <div>
              <p className="text-white font-bold text-sm leading-tight">{phase.title}</p>
              <p className="text-slate-500 text-xs">{phase.subtitle}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: phase.color }}
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
                  i < currentPhase ? 'bg-emerald-400' :
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
