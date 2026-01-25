import React, { useState, useEffect, useRef } from 'react';
import { Lightbulb, Play, Pause, AlertCircle, Settings, Maximize, Minimize, RotateCcw } from 'lucide-react';
import useTherapyColors from '../hooks/useTherapyColors.js';
import { useGlobal } from '../context/GlobalContext.jsx';

const INTERNAL_WIDTH = 400;
const INTERNAL_HEIGHT = 400;
const R = 20;
const BAR_W = 12;
const SPAWN_INTERVAL = 800;

export default function Lighthouse({ onGameEnd }) {
  const { weakEye, condition } = useGlobal();
  const isNeglect = condition === 'neglect';
  const [intensity, setIntensity] = useState(1.0);
  const colors = useTherapyColors(weakEye, intensity);
  const getSolidColor = () => weakEye === 'left' ? '#FF0000' : '#0000FF';

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [gameState, setGameState] = useState('START');
  const [score, setScore] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [targets, setTargets] = useState([]);
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
      const leftBias = isNeglect ? 0.8 : 0.5;
      const onLeft = Math.random() < leftBias;
      const x = onLeft
        ? R + Math.random() * (INTERNAL_WIDTH / 2 - 2 * R)
        : INTERNAL_WIDTH / 2 + R + Math.random() * (INTERNAL_WIDTH / 2 - 2 * R);
      const y = R + Math.random() * (INTERNAL_HEIGHT - 2 * R);
      setTargets(t => [...t, { id: Date.now() + Math.random(), x, y }]);
      lastSpawnRef.current = Date.now();
    };
    const iv = setInterval(() => {
      if (Date.now() - lastSpawnRef.current >= SPAWN_INTERVAL) spawn();
    }, 250);
    return () => clearInterval(iv);
  }, [gameState, isNeglect]);

  useEffect(() => {
    const draw = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
      
      // Flashing Bar (Strong Eye Attention - e.g. for Neglect)
      if (isNeglect && Math.sin(Date.now() / 200) > 0) {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, BAR_W, INTERNAL_HEIGHT);
      }

      // Targets (Weak Eye Color) - Faded based on intensity, no border
      targetsRef.current.forEach(({ x, y }) => {
        ctx.fillStyle = colors.target;
        ctx.beginPath();
        ctx.arc(x, y, R, 0, Math.PI * 2);
        ctx.fill();
      });
    };
    let rAf;
    const loop = () => { draw(); rAf = requestAnimationFrame(loop); };
    loop();
    return () => cancelAnimationFrame(rAf);
  }, [gameState, isNeglect, colors]);

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
          <Lightbulb className="w-8 h-8" style={{ color: getSolidColor() }} />
          <h1 className="text-3xl font-bold tracking-tighter">
            <span style={{ color: getSolidColor() }}>LIGHT</span> HOUSE <span className="text-blue-500 text-sm opacity-50 hidden sm:inline">(NEGLECT)</span>
          </h1>
        </div>
      )}

      {/* RESPONSIVE LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full max-w-6xl">
        
        {/* Game Area */}
        <div ref={containerRef} className={`relative w-full lg:flex-1 bg-neutral-950 flex items-center justify-center transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50' : 'border-4 border-neutral-800 rounded-lg shadow-2xl aspect-square lg:h-[600px] lg:w-auto'}`}>
          <button onClick={toggleFullScreen} className="absolute top-4 right-4 p-2 bg-gray-800/50 hover:bg-gray-700 rounded-full text-white z-50 transition">
            {isFullScreen ? <Minimize size={24} /> : <Maximize size={24} />}
          </button>
          <canvas ref={canvasRef} width={INTERNAL_WIDTH} height={INTERNAL_HEIGHT} className={`block shadow-2xl ${isFullScreen ? 'max-h-screen max-w-full object-contain' : 'w-full h-full object-contain'}`} style={{ backgroundColor: '#000' }} />
          
          {gameState !== 'PLAYING' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-40 backdrop-blur-sm">
              {gameState === 'GAMEOVER' && <div className="text-center mb-6"><AlertCircle className="mx-auto w-16 h-16 mb-2" style={{ color: getSolidColor() }} /><h2 className="text-4xl font-black">FINISHED</h2><p className="text-xl">Score: {score}</p></div>}
              {gameState === 'PAUSED' && <div className="text-center mb-6"><Pause className="mx-auto w-16 h-16 mb-2 text-blue-500" /><h2 className="text-4xl font-black">PAUSED</h2></div>}
              <button onClick={startGame} className="flex items-center gap-2 px-8 py-4 text-white font-bold rounded-full text-xl shadow-lg transition hover:scale-105" style={{ backgroundColor: getSolidColor() }}><Play fill="currentColor" /> {gameState === 'START' ? 'START' : 'RESTART'}</button>
            </div>
          )}
          <div className="absolute top-4 left-4 text-white font-mono font-bold text-xl drop-shadow-md z-30">SCORE: {score}</div>
        </div>

        {/* Sidebar */}
        {!isFullScreen && (
          <div className="w-full lg:w-80 bg-neutral-800 p-6 rounded-xl border border-neutral-700 h-auto flex flex-col">
            <div className="flex items-center gap-2 mb-6 text-gray-400 uppercase text-xs font-bold tracking-widest"><Settings size={14} /> Therapy Config</div>
            <div className="space-y-8 flex-1">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: getSolidColor() }}>Target Opacity</label>
                <input type="range" min="0.1" max="1.0" step="0.1" value={intensity} onChange={(e) => setIntensity(parseFloat(e.target.value))} className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer" style={{ accentColor: getSolidColor() }} />
                <div className="flex justify-between text-xs text-gray-500 mt-2"><span>Ghost</span><span>Solid</span></div>
              </div>
              <div className="bg-black/30 p-4 rounded text-sm text-gray-400 space-y-2">
                <p>Scan the dark area to find and tap targets.</p>
                {isNeglect && <p className="text-red-400 text-xs mt-2 font-bold">Watch for the flashing bar!</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}