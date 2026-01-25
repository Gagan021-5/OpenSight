import React, { useState, useEffect, useRef } from 'react';
import { Lightbulb, Play, Pause, AlertCircle, Settings, Maximize, Minimize } from 'lucide-react';
import useTherapyColors from '../hooks/useTherapyColors.js';
import { useGlobal } from '../context/GlobalContext.jsx';
import GameSummary from './GameSummary.jsx';
import { saveGameSession } from '../utils/scoreTracker.js';

const INTERNAL_WIDTH = 400;
const INTERNAL_HEIGHT = 400;
const R = 20;
const BAR_W = 12;
const SPAWN_INTERVAL = 800;

export default function Lighthouse() {
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
  const [showSummary, setShowSummary] = useState(false);

  // --- Accurate Timer & Pause Refs ---
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
    setGameState('GAMEOVER');
    setShowSummary(true);
  };

  // Game Logic: Spawning
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const iv = setInterval(() => {
      if (Date.now() - lastSpawnRef.current >= SPAWN_INTERVAL) {
        const leftBias = isNeglect ? 0.8 : 0.5;
        const x = Math.random() < leftBias 
          ? R + Math.random() * (INTERNAL_WIDTH / 2 - 2 * R)
          : INTERNAL_WIDTH / 2 + R + Math.random() * (INTERNAL_WIDTH / 2 - 2 * R);
        const y = R + Math.random() * (INTERNAL_HEIGHT - 2 * R);
        
        setTargets(t => [...t, { id: Date.now() + Math.random(), x, y }]);
        lastSpawnRef.current = Date.now();
      }
    }, 250);
    return () => clearInterval(iv);
  }, [gameState, isNeglect]);

  // Game Loop: Drawing
  useEffect(() => {
    const draw = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
      
      // Flashing Bar (Strong Eye Attention - for Neglect therapy)
      if (isNeglect && Math.sin(Date.now() / 200) > 0) {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, BAR_W, INTERNAL_HEIGHT);
      }

      // Targets (Weak Eye Color with adjustable intensity)
      targetsRef.current.forEach(({ x, y }) => {
        ctx.fillStyle = colors.target;
        ctx.beginPath(); 
        ctx.arc(x, y, R, 0, Math.PI * 2); 
        ctx.fill();
      });
    };

    let rAf;
    const loop = () => { 
      draw(); 
      rAf = requestAnimationFrame(loop); 
    };
    loop();
    return () => cancelAnimationFrame(rAf);
  }, [gameState, isNeglect, colors]);

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 font-sans text-white p-4">
      {!isFullScreen && (
        <div className="flex items-center gap-3 mb-6 text-center">
          <Lightbulb className="w-8 h-8" style={{ color: getSolidColor() }} />
          <h1 className="text-3xl font-bold tracking-tighter uppercase">Lighthouse</h1>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full max-w-6xl">
        {/* GAME CONTAINER */}
        <div ref={containerRef} className={`relative w-full lg:flex-1 bg-neutral-950 flex items-center justify-center border-4 border-neutral-800 rounded-lg shadow-2xl aspect-square overflow-hidden`}>
          <button onClick={toggleFullScreen} className="absolute top-4 right-4 p-2 bg-gray-800/50 hover:bg-gray-700 rounded-full z-50">
            {isFullScreen ? <Minimize size={24} /> : <Maximize size={24} />}
          </button>
          
          <canvas 
            ref={canvasRef} 
            width={INTERNAL_WIDTH} height={INTERNAL_HEIGHT} 
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
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-40 backdrop-blur-sm">
              <h2 className="text-4xl font-black mb-6 uppercase">{gameState === 'PAUSED' ? 'Paused' : 'Scan Mission'}</h2>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => gameState === 'START' ? startGame() : setGameState('PLAYING')} 
                  className="flex items-center justify-center gap-2 px-8 py-4 text-white font-bold rounded-full text-xl shadow-lg transition hover:scale-105" 
                  style={{ backgroundColor: getSolidColor() }}
                >
                  <Play fill="currentColor" /> {gameState === 'START' ? 'START MISSION' : 'CONTINUE'}
                </button>
                {gameState !== 'START' && (
                  <button onClick={endGame} className="px-6 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-full text-sm font-bold">
                    Finish Session
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="absolute top-4 left-4 text-white font-mono font-bold text-xl drop-shadow-md z-30 pointer-events-none">SCORE: {score}</div>
        </div>

        {/* SIDEBAR */}
        {!isFullScreen && (
          <div className="w-full lg:w-80 bg-neutral-800 p-6 rounded-xl border border-neutral-700 h-auto flex flex-col">
            <div className="flex items-center gap-2 mb-6 text-gray-400 uppercase text-xs font-bold tracking-widest"><Settings size={14} /> Config</div>
            <div className="space-y-8 flex-1">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: getSolidColor() }}>Target Opacity</label>
                <input type="range" min="0.1" max="1.0" step="0.1" value={intensity} onChange={(e) => setIntensity(parseFloat(e.target.value))} className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer" style={{ accentColor: getSolidColor() }} />
                <div className="flex justify-between text-xs text-gray-500 mt-2"><span>Ghost</span><span>Solid</span></div>
              </div>
              <div className="bg-black/30 p-4 rounded text-sm text-gray-400 space-y-2">
                <p>Scan the dark area to find and tap targets.</p>
                {isNeglect && <p className="text-red-400 font-bold">Watch for the flashing bar on your blind side!</p>}
                <p className="text-xs pt-4 border-t border-gray-700 italic">Press SPACE to pause at any time.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <GameSummary
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        gameId="lighthouse"
        gameTitle="LIGHTHOUSE"
        score={score}
        duration={startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current - totalPausedTimeRef.current) / 1000) : 0}
        onRestart={startGame}
        onBackToDashboard={() => window.location.href = '/dashboard'}
      />
    </div>
  );
}