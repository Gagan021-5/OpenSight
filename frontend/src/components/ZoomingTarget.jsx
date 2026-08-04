import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Focus, Play, Pause, Settings, Maximize, Minimize } from 'lucide-react';
import GameSummary from './GameSummary.jsx';
import { saveGameSession } from '../utils/scoreTracker.js';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  DYNAMIC FOCUS — Accommodative Rock Exercise
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  Glassless Mode — renders in full color, NO red/blue filters.
 *
 *  Clinical purpose:
 *  Targets dynamically zoom in/out simulating near↔far shifts.
 *  This forces the ciliary muscles to continuously flex and relax,
 *  training accommodative flexibility and relieving digital eye
 *  strain from prolonged screen use.
 *
 *  Mechanic:
 *  - A pulsing target oscillates between small (far) and large (near).
 *  - A sharpness ring around the target softens as the target shrinks.
 *  - User clicks/taps when the target reaches peak focus (largest size).
 *  - Correctly timed taps earn points; the oscillation speed increases
 *    as the score rises (adaptive difficulty).
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

const INTERNAL_WIDTH = 500;
const INTERNAL_HEIGHT = 500;
const MIN_RADIUS = 16;
const MAX_RADIUS = 60;
const FOCUS_ZONE = 0.85; // tap is "good" when oscillation phase > this (near peak)

// Vibrant full-color palette (no red/blue anaglyph)
const COLORS = {
  bg: '#0F172A',
  targetFill: '#4F46E5',       // Indigo-600
  targetGlow: '#818CF8',       // Indigo-400
  ringStroke: '#38BDF8',       // Sky-400
  focusFlash: '#EEF2FF',       // Indigo-50
  textPrimary: '#F8FAFC',
  textMuted: '#94A3B8',
  accentBtn: '#4F46E5',
};

export default function ZoomingTarget({ onGameEnd, requiresGlasses }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [gameState, setGameState] = useState('START');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'good'|'miss', ts }

  // Timing refs
  const startTimeRef = useRef(null);
  const totalPausedTimeRef = useRef(0);
  const pauseStartRef = useRef(null);
  const rAfRef = useRef(null);
  const phaseRef = useRef(0); // 0..1 oscillation phase

  // Adaptive speed — cycles per second, increases with score
  const getSpeed = useCallback(() => {
    return 0.45 + Math.min(score / 200, 0.55); // 0.45 → 1.0 Hz
  }, [score]);

  const toggleFullScreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullScreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    const h = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  const startGame = () => {
    setScore(0);
    setStreak(0);
    totalPausedTimeRef.current = 0;
    startTimeRef.current = Date.now();
    phaseRef.current = 0;
    setShowSummary(false);
    setFeedback(null);
    setGameState('PLAYING');
  };

  const handlePause = () => {
    setGameState(prev => {
      if (prev === 'PLAYING') {
        pauseStartRef.current = Date.now();
        return 'PAUSED';
      }
      if (prev === 'PAUSED') {
        if (pauseStartRef.current) {
          totalPausedTimeRef.current += (Date.now() - pauseStartRef.current);
        }
        return 'PLAYING';
      }
      return prev;
    });
  };

  const endGame = useCallback(() => {
    const finalDuration = startTimeRef.current
      ? Math.floor((Date.now() - startTimeRef.current - totalPausedTimeRef.current) / 1000)
      : 0;

    saveGameSession('zooming-target', score, finalDuration);
    if (onGameEnd) onGameEnd(score, finalDuration);
    setGameState('GAMEOVER');
    setShowSummary(true);
  }, [score, onGameEnd]);

  // Auto-end at 150 points
  useEffect(() => {
    if (gameState === 'PLAYING' && score >= 150) {
      endGame();
    }
  }, [score, gameState, endGame]);

  // ── Tap / Click handler ──
  const handleTap = useCallback(() => {
    if (gameState !== 'PLAYING') return;

    // Check if we're in the "focus zone" (target near peak size)
    const phase = phaseRef.current;
    const sineVal = (Math.sin(phase * Math.PI * 2 - Math.PI / 2) + 1) / 2; // 0..1

    if (sineVal >= FOCUS_ZONE) {
      // Good tap — target is near peak
      const bonus = streak >= 3 ? 15 : 10;
      setScore(s => s + bonus);
      setStreak(s => s + 1);
      setFeedback({ type: 'good', ts: Date.now() });
    } else {
      // Mistimed tap
      setStreak(0);
      setFeedback({ type: 'miss', ts: Date.now() });
    }
  }, [gameState, streak]);

  // ── Main render loop ──
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      cancelAnimationFrame(rAfRef.current);
      return;
    }

    let lastTime = performance.now();

    const draw = (now) => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;

      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Advance phase
      const speed = getSpeed();
      phaseRef.current = (phaseRef.current + dt * speed) % 1;
      const sineVal = (Math.sin(phaseRef.current * Math.PI * 2 - Math.PI / 2) + 1) / 2;

      const cx = INTERNAL_WIDTH / 2;
      const cy = INTERNAL_HEIGHT / 2;
      const radius = MIN_RADIUS + sineVal * (MAX_RADIUS - MIN_RADIUS);

      // ── Background ──
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

      // Subtle grid lines for depth reference
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
      ctx.lineWidth = 1;
      for (let i = 50; i < INTERNAL_WIDTH; i += 50) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, INTERNAL_HEIGHT); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(INTERNAL_WIDTH, i); ctx.stroke();
      }

      // ── Outer ring (sharpness indicator) ──
      // Blurs as target shrinks (low sineVal), sharp when large
      const ringRadius = radius + 20 + (1 - sineVal) * 15;
      const ringAlpha = 0.15 + sineVal * 0.45;
      ctx.strokeStyle = `rgba(56, 189, 248, ${ringAlpha})`;
      ctx.lineWidth = 2 + sineVal * 2;
      ctx.setLineDash([4 + sineVal * 8, 6 - sineVal * 4]);
      ctx.beginPath();
      ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // ── Target glow ──
      const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 2.5);
      glowGrad.addColorStop(0, `rgba(99, 102, 241, ${0.2 * sineVal})`);
      glowGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // ── Main target ──
      const targetGrad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, 0, cx, cy, radius);
      targetGrad.addColorStop(0, '#818CF8');
      targetGrad.addColorStop(0.7, '#6366F1');
      targetGrad.addColorStop(1, '#4338CA');
      ctx.fillStyle = targetGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner dot (focus point)
      ctx.fillStyle = COLORS.focusFlash;
      ctx.globalAlpha = 0.7 + sineVal * 0.3;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(3, radius * 0.15), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // ── Focus zone indicator bar (bottom) ──
      const barWidth = INTERNAL_WIDTH - 80;
      const barX = 40;
      const barY = INTERNAL_HEIGHT - 30;
      // Track
      ctx.fillStyle = 'rgba(148, 163, 184, 0.1)';
      ctx.fillRect(barX, barY, barWidth, 6);
      // Filled portion
      const fillColor = sineVal >= FOCUS_ZONE ? '#6366F1' : '#475569';
      ctx.fillStyle = fillColor;
      ctx.fillRect(barX, barY, barWidth * sineVal, 6);
      // Focus zone marker
      ctx.fillStyle = 'rgba(99, 102, 241, 0.3)';
      ctx.fillRect(barX + barWidth * FOCUS_ZONE, barY - 2, barWidth * (1 - FOCUS_ZONE), 10);

      // Label
      ctx.fillStyle = sineVal >= FOCUS_ZONE ? '#818CF8' : COLORS.textMuted;
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(sineVal >= FOCUS_ZONE ? 'TAP NOW' : 'Wait for focus...', cx, barY - 8);

      // ── Feedback flash ──
      if (feedback) {
        const age = Date.now() - feedback.ts;
        if (age < 400) {
          ctx.globalAlpha = 1 - age / 400;
          ctx.fillStyle = feedback.type === 'good' ? '#818CF8' : '#EF4444';
          ctx.font = 'bold 28px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(feedback.type === 'good' ? '+10' : 'MISS', cx, cy - radius - 25);
          ctx.globalAlpha = 1;
        }
      }

      rAfRef.current = requestAnimationFrame(draw);
    };

    rAfRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rAfRef.current);
  }, [gameState, getSpeed, feedback]);

  // Canvas click handler
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.addEventListener('mousedown', handleTap);
    c.addEventListener('touchstart', handleTap);
    return () => {
      c.removeEventListener('mousedown', handleTap);
      c.removeEventListener('touchstart', handleTap);
    };
  }, [handleTap]);

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'PLAYING' || gameState === 'PAUSED') handlePause();
        return;
      }
      if (e.code === 'Enter' && gameState === 'PLAYING') {
        handleTap();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [gameState, handleTap]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 font-sans text-white p-4">
      {!isFullScreen && (
        <div className="flex items-center gap-3 mb-6">
          <Focus className="w-8 h-8 text-indigo-400" />
          <h1 className="text-3xl font-bold tracking-tight uppercase">
            Dynamic Focus
          </h1>
          <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
            GLASSLESS
          </span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full max-w-6xl">

        {/* Game Area */}
        <div ref={containerRef} className="relative w-full lg:flex-1 bg-slate-950 flex items-center justify-center border-4 border-slate-800 rounded-2xl shadow-2xl aspect-square overflow-hidden">
          <button onClick={toggleFullScreen} className="absolute top-4 right-4 p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full z-50">
            {isFullScreen ? <Minimize size={24} /> : <Maximize size={24} />}
          </button>

          <canvas ref={canvasRef} width={INTERNAL_WIDTH} height={INTERNAL_HEIGHT} className="block w-full h-full object-contain cursor-pointer" />

          {gameState !== 'PLAYING' && !showSummary && (
            <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center z-40 backdrop-blur-sm">
              <h2 className="text-4xl font-black mb-2 uppercase tracking-tight">{gameState === 'PAUSED' ? 'Paused' : 'Dynamic Focus'}</h2>
              <p className="text-slate-400 text-sm mb-6 max-w-xs text-center font-medium">
                Flex your ciliary muscles — tap when the target reaches peak size.
              </p>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => gameState === 'START' ? startGame() : setGameState('PLAYING')}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full text-xl shadow-lg shadow-indigo-500/30 transition hover:scale-105"
                >
                  <Play fill="currentColor" /> {gameState === 'START' ? 'START' : 'CONTINUE'}
                </button>
                {gameState !== 'START' && (
                  <button onClick={endGame} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-sm font-bold border border-slate-700">
                    Finish Session
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="absolute top-4 left-4 text-white font-mono font-bold text-xl drop-shadow-md z-30">
            SCORE: {score}
            {streak >= 3 && <span className="text-xs text-indigo-400 block mt-1">{streak}x Streak</span>}
          </div>
        </div>

        {/* Sidebar */}
        {!isFullScreen && (
          <div className="w-full lg:w-80 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 h-auto flex flex-col">
            <div className="flex items-center gap-2 mb-6 text-indigo-400 uppercase text-xs font-bold tracking-wider">
              <Settings size={14} /> How It Works
            </div>
            <div className="space-y-4 flex-1 text-sm text-slate-300">
              <p>A target <strong className="text-indigo-400">pulses in and out</strong>, simulating near and far focus shifts.</p>
              <p><strong className="text-white">Tap or click</strong> when the target reaches its largest size (the "focus zone").</p>
              <p className="text-indigo-400 font-semibold">Land 3+ taps in a row for streak bonuses.</p>
              <div className="bg-slate-950/80 p-4 rounded-xl text-xs text-slate-400 border border-slate-800 space-y-1">
                <p className="font-semibold text-slate-200">Clinical Purpose</p>
                <p>This exercise trains <em>accommodative flexibility</em> — the ability of your ciliary muscles to shift focus between near and far distances. Regular practice can relieve eye strain from prolonged screen use.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <GameSummary
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        gameId="zooming-target"
        gameTitle="DYNAMIC FOCUS"
        score={score}
        duration={startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current - totalPausedTimeRef.current) / 1000) : 0}
        onRestart={startGame}
        onBackToDashboard={() => window.location.href = '/dashboard'}
      />
    </div>
  );
}