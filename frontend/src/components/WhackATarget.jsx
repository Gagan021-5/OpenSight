import React, { useState, useEffect, useRef } from 'react';
import { Target, Play, Pause, AlertCircle, Settings, Maximize, Minimize, RotateCcw } from 'lucide-react';
import useTherapyColors from '../hooks/useTherapyColors.js';
import { useGlobal } from '../context/GlobalContext.jsx';
import GameSummary from './GameSummary.jsx';
import { saveGameSession } from '../utils/scoreTracker.js';

const INTERNAL_WIDTH = 400;
const INTERNAL_HEIGHT = 400;
const R = 24;
const SPAWN_INTERVAL = 900;
const FADE_MS = 600;

export default function WhackATarget() {
  const { weakEye } = useGlobal();
  const isBoth = weakEye === 'both';
  const [intensity, setIntensity] = useState(1.0);
  const colors = useTherapyColors(weakEye, intensity);
  const getSolidColor = () => isBoth ? '#FFFFFF' : (weakEye === 'left' ? '#FF0000' : '#0000FF');

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [gameState, setGameState] = useState('START');
  const [score, setScore] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [targets, setTargets] = useState([]);
  const [showSummary, setShowSummary] = useState(false);

  // --- Accurate Timer & Pause Refs ---
  const startTimeRef = useRef(null);
  const totalPausedTimeRef = useRef(0);
  const pauseStartRef = useRef(null);
  const lastSpawnRef = useRef(0);
  const rAfRef = useRef(null);

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
    const newScore = score + 10;
    setScore(newScore);
    
    // Auto-end condition for therapy session
    if (newScore >= 100) {
      endGame(newScore);
    }
  };

  const endGame = (finalScore) => {
    const duration = startTimeRef.current 
      ? Math.floor((Date.now() - startTimeRef.current - totalPausedTimeRef.current) / 1000) 
      : 0;
    
    saveGameSession('whack-target', finalScore, duration);
    setGameState('GAMEOVER');
    setShowSummary(true);
  };

  // Target Spawning Logic
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const iv = setInterval(() => {
      if (Date.now() - lastSpawnRef.current >= SPAWN_INTERVAL) {
        const x = R + Math.random() * (INTERNAL_WIDTH - 2 * R);
        const y = R + Math.random() * (INTERNAL_HEIGHT - 2 * R);
        setTargets(t => [...t, { id: Date.now() + Math.random(), x, y, at: Date.now() }]);
        lastSpawnRef.current = Date.now();
      }
    }, 300);
    return () => clearInterval(iv);
  }, [gameState]);

  // Drawing Loop
  useEffect(() => {
    const draw = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
      
      const now = Date.now();
      targets.forEach(({ x, y, at }) => {
        const age = now - at;
        const alpha = age < FADE_MS ? age / FADE_MS : 1;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = isBoth ? '#FFFFFF' : colors.target; 
        ctx.beginPath();
        ctx.arc(x, y, R, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });
    };
    
    const loop = () => {
      draw();
      rAfRef.current = requestAnimationFrame(loop);
    };
    rAfRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rAfRef.current);
  }, [targets, colors, isBoth, gameState]);

  // Mouse Interaction
  useEffect(() => {
    const onMouse = (e) => {
      if (gameState !== 'PLAYING') return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const scaleX = INTERNAL_WIDTH / rect.width;
      const scaleY = INTERNAL_HEIGHT / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;
      
      // Use a slightly larger hit area for better UX on smaller targets
      targets.forEach(t => {
        if (Math.hypot(mx - t.x, my - t.y) <= R * 1.5) {
          hit(t.id);
        }
      });
    };
    const c = canvasRef.current;
    if(c) c.addEventListener('mousedown', onMouse);
    return () => c?.removeEventListener('mousedown', onMouse);
  }, [gameState, targets, score]);

  // Keyboard Shortcuts
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 font-sans text-white p-4">
      {!isFullScreen && (
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-8 h-8" style={{ color: getSolidColor() }} />
          <h1 className="text-3xl font-bold tracking-tighter uppercase">Whack Target</h1>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full max-w-6xl">
        {/* GAME CONTAINER */}
        <div ref={containerRef} className={`relative w-full lg:flex-1 bg-neutral-950 flex items-center justify-center border-4 border-neutral-800 rounded-lg shadow-2xl aspect-square overflow-hidden`}>
          <button onClick={toggleFullScreen} className="absolute top-4 right-4 p-2 bg-gray-800/50 hover:bg-gray-700 rounded-full z-50">
            {isFullScreen ? <Minimize size={24} /> : <Maximize size={24} />}
          </button>
          
          <canvas ref={canvasRef} width={INTERNAL_WIDTH} height={INTERNAL_HEIGHT} className="block w-full h-full object-contain cursor-crosshair" />
          
          {gameState !== 'PLAYING' && !showSummary && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-40 backdrop-blur-sm">
              <h2 className="text-4xl font-black mb-6 uppercase">{gameState === 'PAUSED' ? 'Paused' : 'Speed Mission'}</h2>
              <button 
                onClick={() => gameState === 'START' ? startGame() : setGameState('PLAYING')} 
                className="flex items-center gap-2 px-8 py-4 text-white font-bold rounded-full text-xl shadow-lg transition hover:scale-105"
                style={{ backgroundColor: getSolidColor() }}
              >
                <Play fill="currentColor" /> {gameState === 'START' ? 'START' : 'CONTINUE'}
              </button>
            </div>
          )}
          <div className="absolute top-4 left-4 text-white font-mono font-bold text-xl drop-shadow-md z-30">SCORE: {score}</div>
        </div>

        {/* SIDEBAR */}
        {!isFullScreen && (
          <div className="w-full lg:w-80 bg-neutral-800 p-6 rounded-xl border border-neutral-700 h-auto flex flex-col">
            <div className="flex items-center gap-2 mb-6 text-gray-400 uppercase text-xs font-bold tracking-widest"><Settings size={14} /> Config</div>
            <div className="space-y-8 flex-1">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: getSolidColor() }}>Target Opacity</label>
                <input type="range" min="0.1" max="1.0" step="0.1" value={intensity} onChange={(e) => setIntensity(parseFloat(e.target.value))} className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer" style={{ accentColor: getSolidColor() }} />
              </div>
              <div className="bg-black/30 p-4 rounded text-sm text-gray-400 space-y-2">
                <p>Tap the targets as they appear.</p>
                <p className="text-xs pt-4 border-t border-gray-700 italic">Press SPACE to pause.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <GameSummary
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        gameId="whack-target"
        gameTitle="WHACK TARGET"
        score={score}
        duration={startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current - totalPausedTimeRef.current) / 1000) : 0}
        onRestart={startGame}
        onBackToDashboard={() => window.location.href = '/dashboard'}
      />
    </div>
  );
}