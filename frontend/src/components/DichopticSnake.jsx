import React, { useState, useEffect, useRef } from 'react';
import { Eye, Settings, Play, Pause, AlertCircle, MoveDown, Maximize, Minimize, RotateCcw } from 'lucide-react';
import useTherapyColors from '../hooks/useTherapyColors.js';
import { useGlobal } from '../context/GlobalContext.jsx';

const INTERNAL_WIDTH = 400;
const INTERNAL_HEIGHT = 400;
const GRID_SIZE = 20;
const CELL_SIZE = INTERNAL_WIDTH / GRID_SIZE;
const SPEED = 150;

export default function DichopticSnake({ onGameEnd }) {
  const { weakEye } = useGlobal();
  const [intensity, setIntensity] = useState(1.0);
  const colors = useTherapyColors(weakEye, intensity);
  const getSolidColor = () => weakEye === 'left' ? '#FF0000' : '#0000FF';

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [gameState, setGameState] = useState('START');
  const [score, setScore] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [snake, setSnake] = useState([[10, 10]]);
  const [food, setFood] = useState([15, 15]);
  const [direction, setDirection] = useState([0, -1]);
  const startTimeRef = useRef(null);

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
    setSnake([[10, 10]]);
    setFood([Math.floor(Math.random() * (INTERNAL_WIDTH / GRID_SIZE)), Math.floor(Math.random() * (INTERNAL_HEIGHT / GRID_SIZE))]);
    setDirection([0, -1]);
    setScore(0);
    startTimeRef.current = Date.now();
    setGameState('PLAYING');
  };

  const resumeGame = () => setGameState('PLAYING');

  useEffect(() => {
    const h = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setGameState(p => p === 'PLAYING' ? 'PAUSED' : p === 'PAUSED' ? 'PLAYING' : p);
        return;
      }
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
      if (gameState !== 'PLAYING') return;
      switch (e.key) {
        case 'ArrowUp': if (direction[1] !== 1) setDirection([0, -1]); break;
        case 'ArrowDown': if (direction[1] !== -1) setDirection([0, 1]); break;
        case 'ArrowLeft': if (direction[0] !== 1) setDirection([-1, 0]); break;
        case 'ArrowRight': if (direction[0] !== -1) setDirection([1, 0]); break;
        default: break;
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [direction, gameState]);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const t = setInterval(() => {
      setSnake((prev) => {
        const head = [prev[0][0] + direction[0], prev[0][1] + direction[1]];
        const max = INTERNAL_WIDTH / GRID_SIZE;
        if (head[0] < 0 || head[0] >= max || head[1] < 0 || head[1] >= max) { setGameState('GAMEOVER'); return prev; }
        for (const s of prev) { if (head[0] === s[0] && head[1] === s[1]) { setGameState('GAMEOVER'); return prev; } }
        const next = [head, ...prev];
        if (head[0] === food[0] && head[1] === food[1]) {
          setScore((s) => s + 1);
          setFood([Math.floor(Math.random() * max), Math.floor(Math.random() * max)]);
        } else next.pop();
        return next;
      });
    }, SPEED);
    return () => clearInterval(t);
  }, [gameState, direction, food]);

  const draw = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
    
    // Snake (Solid)
    ctx.fillStyle = getSolidColor();
    snake.forEach(([x, y]) => {
      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
    });
    
    // Food (Faded)
    ctx.fillStyle = colors.target;
    ctx.fillRect(food[0] * CELL_SIZE, food[1] * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
    
    // Walls (Lock Color)
    ctx.strokeStyle = colors.lock;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameState === 'PLAYING') draw();
    }, SPEED);
    if(gameState !== 'PLAYING') draw(); // Static draw when paused/over
    return () => clearInterval(interval);
  }, [gameState, food, snake, colors]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 font-sans text-white p-4">
      {!isFullScreen && (
        <div className="flex items-center gap-3 mb-6">
          <Eye className="w-8 h-8" style={{ color: getSolidColor() }} />
          <h1 className="text-3xl font-bold tracking-tighter">
            <span style={{ color: getSolidColor() }}>RED</span> SNAKE <span className="text-blue-500 text-sm opacity-50 hidden sm:inline">(DICHOPTIC)</span>
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
              {gameState === 'GAMEOVER' && <div className="text-center mb-6"><AlertCircle className="mx-auto w-16 h-16 mb-2" style={{ color: getSolidColor() }} /><h2 className="text-4xl font-black">GAME OVER!</h2><p className="text-xl">Score: {score}</p></div>}
              {gameState === 'PAUSED' && <div className="text-center mb-6"><Pause className="mx-auto w-16 h-16 mb-2 text-blue-500" /><h2 className="text-4xl font-black">PAUSED</h2></div>}
              <button onClick={() => (gameState === 'GAMEOVER' || gameState === 'PAUSED') ? (gameState === 'PAUSED' ? resumeGame() : startGame()) : startGame()} className="flex items-center gap-2 px-8 py-4 text-white font-bold rounded-full text-xl shadow-lg transition hover:scale-105" style={{ backgroundColor: getSolidColor() }}><Play fill="currentColor" /> {gameState === 'START' ? 'START' : 'CONTINUE'}</button>
              {(gameState === 'GAMEOVER' || gameState === 'PAUSED') && <button onClick={startGame} className="mt-4 flex items-center gap-2 px-6 py-2 bg-neutral-700 hover:bg-neutral-600 text-gray-300 font-bold rounded-full text-sm"><RotateCcw size={16} /> Restart</button>}
            </div>
          )}
          <div className="absolute top-4 left-4 text-white font-mono font-bold text-xl drop-shadow-md z-30">SCORE: {score}</div>
        </div>

        {!isFullScreen && (
          <div className="w-full lg:w-80 bg-neutral-800 p-6 rounded-xl border border-neutral-700 h-auto lg:h-[600px] flex flex-col">
            <div className="flex items-center gap-2 mb-6 text-gray-400 uppercase text-xs font-bold tracking-widest"><Settings size={14} /> Therapy Config</div>
            <div className="space-y-8 flex-1">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: getSolidColor() }}>Food Opacity</label>
                <input type="range" min="0.1" max="1.0" step="0.1" value={intensity} onChange={(e) => setIntensity(parseFloat(e.target.value))} className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer" style={{ accentColor: getSolidColor() }} />
                <div className="flex justify-between text-xs text-gray-500 mt-2"><span>Ghost</span><span>Solid</span></div>
              </div>
              <div className="bg-black/30 p-4 rounded text-sm text-gray-400 space-y-2"><p>Arrow Keys to move.</p><p className="text-xs mt-4 pt-4 border-t border-gray-700"><span style={{ color: getSolidColor() }}>■ Snake</span>: Solid<br/><span style={{ color: colors.target }}>■ Food</span>: Faded</p></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}