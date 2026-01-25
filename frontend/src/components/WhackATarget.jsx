import React, { useState, useEffect, useRef } from 'react';
import { Target, Play, Pause, AlertCircle, Settings, Maximize, Minimize, RotateCcw } from 'lucide-react';
import useTherapyColors from '../hooks/useTherapyColors.js';
import { useGlobal } from '../context/GlobalContext.jsx';

const INTERNAL_WIDTH = 400;
const INTERNAL_HEIGHT = 400;
const R = 24;
const SPAWN_INTERVAL = 900;
const FADE_MS = 600;

export default function WhackATarget({ onGameEnd }) {
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
    lastSpawnRef.current = Date.now();
    setGameState('PLAYING');
  };

  const hit = (id) => {
    setTargets(t => t.filter(x => x.id !== id));
    setScore(s => s + 10);
  };

  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const spawn = () => {
      const x = R + Math.random() * (INTERNAL_WIDTH - 2 * R);
      const y = R + Math.random() * (INTERNAL_HEIGHT - 2 * R);
      setTargets(t => [...t, { id: Date.now() + Math.random(), x, y, at: Date.now() }]);
      lastSpawnRef.current = Date.now();
    };
    const iv = setInterval(() => {
      if (Date.now() - lastSpawnRef.current >= SPAWN_INTERVAL) spawn();
    }, 300);
    return () => clearInterval(iv);
  }, [gameState]);

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
      if (gameState === 'PLAYING') rAfRef.current = requestAnimationFrame(loop);
    };
    rAfRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rAfRef.current);
  }, [targets, colors, isBoth, gameState]);

  useEffect(() => {
    const onMouse = (e) => {
      if (gameState !== 'PLAYING') return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const scaleX = INTERNAL_WIDTH / rect.width;
      const scaleY = INTERNAL_HEIGHT / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;
      for (const t of targets) {
        if (Math.hypot(mx - t.x, my - t.y) <= R * 1.5) { hit(t.id); return; }
      }
    };
    const c = canvasRef.current;
    if(c) c.addEventListener('mousedown', onMouse);
    return () => c?.removeEventListener('mousedown', onMouse);
  }, [gameState, targets]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 font-sans text-white p-4">
      {!isFullScreen && (
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-8 h-8" style={{ color: getSolidColor() }} />
          <h1 className="text-3xl font-bold tracking-tighter">
            <span style={{ color: getSolidColor() }}>WHACK</span> TARGET
          </h1>
        </div>
      )}

      {/* RESPONSIVE LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full max-w-6xl">
        <div ref={containerRef} className={`relative w-full lg:flex-1 bg-neutral-950 flex items-center justify-center transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50' : 'border-4 border-neutral-800 rounded-lg shadow-2xl aspect-square lg:h-[600px] lg:w-auto'}`}>
          <button onClick={toggleFullScreen} className="absolute top-4 right-4 p-2 bg-gray-800/50 hover:bg-gray-700 rounded-full text-white z-50 transition">
            {isFullScreen ? <Minimize size={24} /> : <Maximize size={24} />}
          </button>
          <canvas ref={canvasRef} width={INTERNAL_WIDTH} height={INTERNAL_HEIGHT} className={`block shadow-2xl ${isFullScreen ? 'max-h-screen max-w-full object-contain' : 'w-full h-full object-contain'}`} style={{ backgroundColor: '#000' }} />
          
          {gameState !== 'PLAYING' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-40 backdrop-blur-sm">
              <button onClick={startGame} className="flex items-center gap-2 px-8 py-4 text-white font-bold rounded-full text-xl shadow-lg transition hover:scale-105" style={{ backgroundColor: getSolidColor() }}><Play fill="currentColor" /> {gameState === 'START' ? 'START' : 'RESTART'}</button>
            </div>
          )}
          <div className="absolute top-4 left-4 text-white font-mono font-bold text-xl drop-shadow-md z-30">SCORE: {score}</div>
        </div>

        {!isFullScreen && (
          <div className="w-full lg:w-80 bg-neutral-800 p-6 rounded-xl border border-neutral-700 h-auto flex flex-col">
            <div className="flex items-center gap-2 mb-6 text-gray-400 uppercase text-xs font-bold tracking-widest"><Settings size={14} /> Therapy Config</div>
            <div className="space-y-8 flex-1">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: getSolidColor() }}>Target Opacity</label>
                <input type="range" min="0.1" max="1.0" step="0.1" value={intensity} onChange={(e) => setIntensity(parseFloat(e.target.value))} className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer" style={{ accentColor: getSolidColor() }} />
              </div>
              <div className="bg-black/30 p-4 rounded text-sm text-gray-400 space-y-2"><p>Tap targets quickly!</p></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}