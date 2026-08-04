import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Crosshair, Play, Pause, Settings, Maximize, Minimize } from 'lucide-react';
import GameSummary from './GameSummary.jsx';
import { saveGameSession } from '../utils/scoreTracker.js';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  SACCADIC PRECISION — Rapid Eye Movement Training
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  Glassless Mode — renders in full color, NO red/blue filters.
 *
 *  Clinical purpose:
 *  Targets spawn briefly at grid-snapped positions across the
 *  visual field, forcing the eyes to make rapid, accurate saccadic
 *  jumps. This improves gaze switching speed, fixation accuracy,
 *  and overall oculomotor coordination.
 *
 *  Mechanics:
 *  - Targets appear at random grid positions with a short lifespan.
 *  - Each target fades in then expires — click/tap before it vanishes.
 *  - Missed targets are tracked alongside score.
 *  - Target size shrinks as score increases (adaptive difficulty).
 *  - Targets use a rotating vibrant color palette (no red/blue).
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

const INTERNAL_WIDTH = 500;
const INTERNAL_HEIGHT = 500;

// Grid: 6x6 cells
const GRID_COLS = 6;
const GRID_ROWS = 6;
const CELL_W = INTERNAL_WIDTH / GRID_COLS;
const CELL_H = INTERNAL_HEIGHT / GRID_ROWS;

const BASE_RADIUS = 22;
const SPAWN_INTERVAL_MS = 1100;
const TARGET_LIFESPAN_MS = 1400; // time before target expires

const COLORS = {
  bg: '#0F172A',
  textPrimary: '#F8FAFC',
  textMuted: '#94A3B8',
  gridLine: 'rgba(148, 163, 184, 0.06)',
};

// Curated vibrant palette — no red or blue anaglyph colors
const TARGET_COLORS = [
  '#F59E0B', // Amber-500
  '#F43F5E', // Rose-500
  '#0EA5E9', // Sky-500
  '#8B5CF6', // Violet-500
  '#10B981', // Emerald-500
  '#EC4899', // Pink-500
  '#06B6D4', // Cyan-500
  '#F97316', // Orange-500
];

export default function WhackATarget({ onGameEnd, requiresGlasses }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [gameState, setGameState] = useState('START');
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Timing refs
  const startTimeRef = useRef(null);
  const totalPausedTimeRef = useRef(0);
  const pauseStartRef = useRef(null);
  const rAfRef = useRef(null);
  const targetsRef = useRef([]); // mutable target array for the render loop
  const lastSpawnRef = useRef(0);
  const colorIdxRef = useRef(0);
  const scoreRef = useRef(0); // mirror for use inside animation loop

  // Adaptive radius — shrinks with score
  const getRadius = useCallback(() => {
    const shrink = Math.min(scoreRef.current / 300, 0.4); // max 40% shrink
    return BASE_RADIUS * (1 - shrink);
  }, []);

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
    setMisses(0);
    scoreRef.current = 0;
    targetsRef.current = [];
    totalPausedTimeRef.current = 0;
    startTimeRef.current = Date.now();
    lastSpawnRef.current = Date.now();
    colorIdxRef.current = 0;
    setShowSummary(false);
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

  const endGame = useCallback((finalScore) => {
    const s = finalScore ?? scoreRef.current;
    const duration = startTimeRef.current
      ? Math.floor((Date.now() - startTimeRef.current - totalPausedTimeRef.current) / 1000)
      : 0;

    saveGameSession('whack-target', s, duration);
    if (onGameEnd) onGameEnd(s, duration);
    setGameState('GAMEOVER');
    setShowSummary(true);
  }, [onGameEnd]);

  // Auto-end at 150 points
  useEffect(() => {
    if (gameState === 'PLAYING' && score >= 150) {
      endGame(score);
    }
  }, [score, gameState, endGame]);

  // ── Main game loop: spawn + draw ──
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      cancelAnimationFrame(rAfRef.current);
      return;
    }

    const draw = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      const now = Date.now();

      // ── Spawn logic ──
      if (now - lastSpawnRef.current >= SPAWN_INTERVAL_MS) {
        // Grid-snapped position
        const col = Math.floor(Math.random() * GRID_COLS);
        const row = Math.floor(Math.random() * GRID_ROWS);
        const x = col * CELL_W + CELL_W / 2;
        const y = row * CELL_H + CELL_H / 2;

        const color = TARGET_COLORS[colorIdxRef.current % TARGET_COLORS.length];
        colorIdxRef.current++;

        targetsRef.current.push({
          id: now + Math.random(),
          x, y, color,
          spawnedAt: now,
        });
        lastSpawnRef.current = now;
      }

      // ── Expire old targets ──
      const expired = targetsRef.current.filter(t => now - t.spawnedAt > TARGET_LIFESPAN_MS);
      if (expired.length > 0) {
        setMisses(m => m + expired.length);
      }
      targetsRef.current = targetsRef.current.filter(t => now - t.spawnedAt <= TARGET_LIFESPAN_MS);

      // ── Draw ──
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

      // Subtle grid
      ctx.strokeStyle = COLORS.gridLine;
      ctx.lineWidth = 1;
      for (let c = 1; c < GRID_COLS; c++) {
        ctx.beginPath(); ctx.moveTo(c * CELL_W, 0); ctx.lineTo(c * CELL_W, INTERNAL_HEIGHT); ctx.stroke();
      }
      for (let r = 1; r < GRID_ROWS; r++) {
        ctx.beginPath(); ctx.moveTo(0, r * CELL_H); ctx.lineTo(INTERNAL_WIDTH, r * CELL_H); ctx.stroke();
      }

      const R = getRadius();

      targetsRef.current.forEach(({ x, y, color, spawnedAt }) => {
        const age = now - spawnedAt;
        const lifeRatio = age / TARGET_LIFESPAN_MS; // 0→1

        // Fade in for first 150ms, then fade out in last 30%
        let alpha = 1;
        if (age < 150) {
          alpha = age / 150;
        } else if (lifeRatio > 0.7) {
          alpha = 1 - ((lifeRatio - 0.7) / 0.3);
        }

        // Scale: pops in, then shrinks slightly as it expires
        const scale = age < 100 ? (age / 100) * 1.15 : 1 - (lifeRatio * 0.15);
        const drawR = R * Math.max(0.5, scale);

        // Glow
        ctx.globalAlpha = alpha * 0.25;
        const glow = ctx.createRadialGradient(x, y, drawR * 0.5, x, y, drawR * 2.5);
        glow.addColorStop(0, color);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, drawR * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Main circle
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, drawR, 0, Math.PI * 2);
        ctx.fill();

        // Inner dot
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.arc(x, y, Math.max(2, drawR * 0.2), 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
      });

      rAfRef.current = requestAnimationFrame(draw);
    };

    rAfRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rAfRef.current);
  }, [gameState, getRadius]);

  // ── Mouse / touch interaction ──
  useEffect(() => {
    const onInput = (e) => {
      if (gameState !== 'PLAYING') return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const scaleX = INTERNAL_WIDTH / rect.width;
      const scaleY = INTERNAL_HEIGHT / rect.height;
      const mx = (clientX - rect.left) * scaleX;
      const my = (clientY - rect.top) * scaleY;

      const R = getRadius();
      let hitAny = false;

      targetsRef.current = targetsRef.current.filter(t => {
        if (Math.hypot(mx - t.x, my - t.y) <= R * 1.6) {
          hitAny = true;
          return false; // remove hit target
        }
        return true;
      });

      if (hitAny) {
        const newScore = scoreRef.current + 10;
        scoreRef.current = newScore;
        setScore(newScore);
      }
    };

    const c = canvasRef.current;
    if (c) {
      c.addEventListener('mousedown', onInput);
      c.addEventListener('touchstart', onInput, { passive: true });
    }
    return () => {
      c?.removeEventListener('mousedown', onInput);
      c?.removeEventListener('touchstart', onInput);
    };
  }, [gameState, getRadius]);

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handlePause();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [gameState]);

  const accuracy = score + misses * 10 > 0
    ? Math.round((score / (score + misses * 10)) * 100)
    : 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 font-sans text-white p-4">
      {!isFullScreen && (
        <div className="flex items-center gap-3 mb-6">
          <Crosshair className="w-8 h-8 text-indigo-400" />
          <h1 className="text-3xl font-bold tracking-tight uppercase">Saccadic Precision</h1>
          <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
            GLASSLESS
          </span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full max-w-6xl">
        {/* GAME CONTAINER */}
        <div ref={containerRef} className="relative w-full lg:flex-1 bg-slate-950 flex items-center justify-center border-4 border-slate-800 rounded-2xl shadow-2xl aspect-square overflow-hidden">
          <button onClick={toggleFullScreen} className="absolute top-4 right-4 p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full z-50">
            {isFullScreen ? <Minimize size={24} /> : <Maximize size={24} />}
          </button>

          <canvas ref={canvasRef} width={INTERNAL_WIDTH} height={INTERNAL_HEIGHT} className="block w-full h-full object-contain cursor-crosshair" />

          {gameState !== 'PLAYING' && !showSummary && (
            <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center z-40 backdrop-blur-sm">
              <h2 className="text-4xl font-black mb-2 uppercase tracking-tight">{gameState === 'PAUSED' ? 'Paused' : 'Saccadic Precision'}</h2>
              <p className="text-slate-400 text-sm mb-6 max-w-xs text-center font-medium">
                Targets flash across a grid — tap them before they vanish to train your saccadic eye jumps.
              </p>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => gameState === 'START' ? startGame() : setGameState('PLAYING')}
                  className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full text-xl shadow-lg shadow-indigo-500/30 transition hover:scale-105"
                >
                  <Play fill="currentColor" /> {gameState === 'START' ? 'START' : 'CONTINUE'}
                </button>
                {gameState !== 'START' && (
                  <button onClick={() => endGame()} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-sm font-bold border border-slate-700">
                    Finish Session
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="absolute top-4 left-4 text-white font-mono font-bold text-xl drop-shadow-md z-30">
            SCORE: {score}
            <span className="text-xs text-slate-400 block mt-1">
              Missed: {misses} · Accuracy: {accuracy}%
            </span>
          </div>
        </div>

        {/* SIDEBAR */}
        {!isFullScreen && (
          <div className="w-full lg:w-80 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 h-auto flex flex-col">
            <div className="flex items-center gap-2 mb-6 text-indigo-400 uppercase text-xs font-bold tracking-wider">
              <Settings size={14} /> How It Works
            </div>
            <div className="space-y-4 flex-1 text-sm text-slate-300">
              <p>Colorful targets appear briefly across a <strong className="text-indigo-400">6×6 grid</strong>.</p>
              <p><strong className="text-white">Click or tap</strong> them before they fade. Your accuracy and reaction speed are tracked.</p>
              <p className="text-indigo-400 font-semibold">Targets get smaller as your score increases.</p>
              <div className="bg-slate-950/80 p-4 rounded-xl text-xs text-slate-400 border border-slate-800 space-y-1">
                <p className="font-semibold text-slate-200">Clinical Purpose</p>
                <p>This exercise trains <em>saccadic eye movements</em> — the rapid, ballistic jumps your eyes make when switching fixation between objects. Improved saccadic accuracy helps with reading speed, sports vision, and reducing digital eye fatigue.</p>
              </div>
              <div className="bg-slate-950/40 p-3 rounded-lg text-xs text-slate-500 border border-slate-800/80">
                Press SPACE to pause.
              </div>
            </div>
          </div>
        )}
      </div>

      <GameSummary
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        gameId="whack-target"
        gameTitle="SACCADIC PRECISION"
        score={score}
        duration={startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current - totalPausedTimeRef.current) / 1000) : 0}
        onRestart={startGame}
        onBackToDashboard={() => window.location.href = '/dashboard'}
      />
    </div>
  );
}