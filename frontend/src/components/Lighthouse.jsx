import React, { useState, useEffect, useRef } from 'react';
import { Lightbulb, Play, Pause, Settings, Maximize, Minimize } from 'lucide-react';
import GameSummary from './GameSummary.jsx';
import { saveGameSession } from '../utils/scoreTracker.js';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  LIGHTHOUSE — Spatial Peripheral Scanning & Awareness
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  Glassless Mode — renders in full color, NO red/blue anaglyph filters.
 *
 *  Clinical purpose:
 *  Trains spatial attention, visual search efficiency, and
 *  peripheral field awareness. Targets pop up across the screen
 *  with subtle edge cues guiding spatial scanning.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

const INTERNAL_WIDTH = 400;
const INTERNAL_HEIGHT = 400;
const R = 20;
const BAR_W = 8;
const SPAWN_INTERVAL = 850;

export default function Lighthouse({ onGameEnd, requiresGlasses }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [gameState, setGameState] = useState('START');
  const [score, setScore] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [targets, setTargets] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [targetOpacity, setTargetOpacity] = useState(1.0);

  // Timing & pause refs
  const startTimeRef = useRef(null);
  const totalPausedTimeRef = useRef(0);
  const pauseStartRef = useRef(null);
  const lastSpawnRef = useRef(0);

  const targetsRef = useRef([]);
  targetsRef.current = targets;

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
    setTargets([]);
    totalPausedTimeRef.current = 0;
    startTimeRef.current = Date.now();
    lastSpawnRef.current = Date.now();
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

  const hit = (id) => {
    setTargets(t => t.filter(x => x.id !== id));
    setScore(s => s + 10);
  };

  const endGame = () => {
    const finalDuration = startTimeRef.current 
      ? Math.floor((Date.now() - startTimeRef.current - totalPausedTimeRef.current) / 1000) 
      : 0;

    saveGameSession('lighthouse', score, finalDuration);
    if (onGameEnd) onGameEnd(score, finalDuration);
    setGameState('GAMEOVER');
    setShowSummary(true);
  };

  // Game Logic: Spawning
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const iv = setInterval(() => {
      if (Date.now() - lastSpawnRef.current >= SPAWN_INTERVAL) {
        const x = R + Math.random() * (INTERNAL_WIDTH - 2 * R);
        const y = R + Math.random() * (INTERNAL_HEIGHT - 2 * R);
        
        setTargets(t => [...t, { id: Date.now() + Math.random(), x, y, spawnedAt: Date.now() }]);
        lastSpawnRef.current = Date.now();
      }
    }, 250);
    return () => clearInterval(iv);
  }, [gameState]);

  // Game Loop: Drawing
  useEffect(() => {
    let rAf;
    const draw = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      const now = Date.now();

      // Deep dark canvas background
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

      // Subtle background grid
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 40; i < INTERNAL_WIDTH; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, INTERNAL_HEIGHT); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(INTERNAL_WIDTH, i); ctx.stroke();
      }

      // Cyan/Teal Flashing Edge Indicator for Peripheral Cueing
      if (Math.sin(now / 250) > 0) {
        ctx.fillStyle = 'rgba(6, 182, 212, 0.7)';
        ctx.fillRect(0, 0, BAR_W, INTERNAL_HEIGHT);
      }

      // Draw Targets (Cyan/Teal Gradient with adjustable opacity)
      targetsRef.current.forEach(({ x, y, spawnedAt }) => {
        const age = now - spawnedAt;
        const pulse = Math.sin(age / 150) * 0.15 + 0.85;

        // Target Glow
        const glow = ctx.createRadialGradient(x, y, R * 0.2, x, y, R * 2);
        glow.addColorStop(0, `rgba(6, 182, 212, ${0.4 * targetOpacity})`);
        glow.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, R * 2, 0, Math.PI * 2);
        ctx.fill();

        // Main Target Body
        const grad = ctx.createRadialGradient(x - R * 0.3, y - R * 0.3, 0, x, y, R);
        grad.addColorStop(0, '#38BDF8');
        grad.addColorStop(0.7, '#06B6D4');
        grad.addColorStop(1, '#0891B2');

        ctx.globalAlpha = targetOpacity * pulse;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, R, 0, Math.PI * 2);
        ctx.fill();

        // Center dot
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      rAf = requestAnimationFrame(draw);
    };

    loop();
    function loop() {
      draw();
    }

    return () => cancelAnimationFrame(rAf);
  }, [gameState, targetOpacity]);

  // Handle Spacebar for Pause
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 font-sans text-white p-4">
      {!isFullScreen && (
        <div className="flex items-center gap-3 mb-6 text-center">
          <Lightbulb className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-bold tracking-tight uppercase">Lighthouse Search</h1>
          <span className="px-2.5 py-0.5 text-xs font-semibold bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30">
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

          <canvas
            ref={canvasRef}
            width={INTERNAL_WIDTH}
            height={INTERNAL_HEIGHT}
            className="w-full h-full object-contain cursor-crosshair"
            onMouseDown={(e) => {
              if (gameState !== 'PLAYING') return;
              const rect = canvasRef.current.getBoundingClientRect();
              const scale = INTERNAL_WIDTH / rect.width;
              const mx = (e.clientX - rect.left) * scale;
              const my = (e.clientY - rect.top) * scale;
              targets.forEach(t => {
                if (Math.hypot(mx - t.x, my - t.y) <= R * 1.5) hit(t.id);
              });
            }}
          />

          {gameState !== 'PLAYING' && !showSummary && (
            <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center z-40 backdrop-blur-sm">
              <h2 className="text-4xl font-black mb-2 uppercase tracking-tight">{gameState === 'PAUSED' ? 'Paused' : 'Lighthouse Search'}</h2>
              <p className="text-slate-400 text-sm mb-6 max-w-xs text-center font-medium">
                Scan the dark field to locate and tap targets as they appear.
              </p>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => gameState === 'START' ? startGame() : setGameState('PLAYING')}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full text-xl shadow-lg shadow-indigo-500/30 transition hover:scale-105"
                >
                  <Play fill="currentColor" /> {gameState === 'START' ? 'START MISSION' : 'CONTINUE'}
                </button>
                {gameState !== 'START' && (
                  <button onClick={endGame} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-sm font-bold border border-slate-700">
                    Finish Session
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="absolute top-4 left-4 text-white font-mono font-bold text-xl drop-shadow-md z-30 pointer-events-none">
            SCORE: {score}
          </div>
        </div>

        {/* SIDEBAR */}
        {!isFullScreen && (
          <div className="w-full lg:w-80 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 h-auto flex flex-col">
            <div className="flex items-center gap-2 mb-6 text-cyan-400 uppercase text-xs font-bold tracking-wider">
              <Settings size={14} /> Configuration
            </div>
            <div className="space-y-6 flex-1">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Target Opacity</label>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.1"
                  value={targetOpacity}
                  onChange={(e) => setTargetOpacity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>Ghost</span>
                  <span>Solid</span>
                </div>
              </div>
              <div className="bg-slate-950/80 p-4 rounded-xl text-xs text-slate-400 border border-slate-800 space-y-2">
                <p className="font-semibold text-slate-200">How to Play</p>
                <p>Scan the dark area to find and tap targets.</p>
                <p className="text-cyan-400 font-medium">Watch for flashing cues on the edge to train peripheral scanning!</p>
                <p className="text-slate-500 pt-3 border-t border-slate-800/80 italic">Press SPACE to pause at any time.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <GameSummary
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        gameId="lighthouse"
        gameTitle="LIGHTHOUSE SEARCH"
        score={score}
        duration={startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current - totalPausedTimeRef.current) / 1000) : 0}
        onRestart={startGame}
        onBackToDashboard={() => window.location.href = '/dashboard'}
      />
    </div>
  );
}