import { useState, useEffect, useRef } from 'react';
import { Eye, Settings, Play, Pause, AlertCircle } from 'lucide-react';
import useTherapyColors from '../hooks/useTherapyColors.js';
import { useGlobal } from '../context/GlobalContext.jsx';

const CANVAS_SIZE = 400;
const SCALE = 20;
const SPEED = 150;

export default function DichopticSnake({ onGameEnd, isFullScreen }) {
  const canvasRef = useRef(null);
  const { weakEye } = useGlobal();
  const [foodIntensity, setFoodIntensity] = useState(1.0);
  const colorsFull = useTherapyColors(weakEye, 1);
  const colorsFood = useTherapyColors(weakEye, foodIntensity);

  const [gameState, setGameState] = useState('START');
  const [score, setScore] = useState(0);
  const [snake, setSnake] = useState([[10, 10]]);
  const [food, setFood] = useState([15, 15]);
  const [direction, setDirection] = useState([0, -1]);
  const startTimeRef = useRef(null);

  const startGame = () => {
    setSnake([[10, 10]]);
    setFood([Math.floor(Math.random() * (CANVAS_SIZE / SCALE)), Math.floor(Math.random() * (CANVAS_SIZE / SCALE))]);
    setDirection([0, -1]);
    setScore(0);
    startTimeRef.current = Date.now();
    setGameState('PLAYING');
  };

  const endGame = () => {
    setGameState('GAMEOVER');
    if (onGameEnd && startTimeRef.current) {
      const duration = (Date.now() - startTimeRef.current) / 1000;
      onGameEnd(score, duration);
    }
  };

  useEffect(() => {
    const h = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setGameState((p) => (p === 'PLAYING' ? 'PAUSED' : p === 'PAUSED' ? 'PLAYING' : p));
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
        const max = CANVAS_SIZE / SCALE;
        if (head[0] < 0 || head[0] >= max || head[1] < 0 || head[1] >= max) { endGame(); return prev; }
        for (const s of prev) { if (head[0] === s[0] && head[1] === s[1]) { endGame(); return prev; } }
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

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = colorsFull.background;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    ctx.fillStyle = colorsFull.target;
    snake.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
    ctx.fillStyle = colorsFood.target;
    ctx.fillRect(food[0], food[1], 1, 1);
    ctx.strokeStyle = colorsFull.lock;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 0.1;
    ctx.strokeRect(0, 0, CANVAS_SIZE / SCALE, CANVAS_SIZE / SCALE);
    ctx.globalAlpha = 1;
  }, [snake, food, colorsFull, colorsFood]);

  const overlay = (
    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10">
      {gameState === 'GAMEOVER' && (
        <div className="text-center mb-4">
          <AlertCircle className="mx-auto w-12 h-12 mb-2 opacity-80" style={{ color: colorsFull.target }} />
          <h2 className="text-2xl font-black">GAME OVER</h2>
          <p className="text-lg text-slate-300">Score: {score}</p>
        </div>
      )}
      {gameState === 'PAUSED' && (
        <div className="text-center mb-4">
          <Pause className="mx-auto w-12 h-12 mb-2" style={{ color: colorsFull.lock }} />
          <h2 className="text-2xl font-black">PAUSED</h2>
        </div>
      )}
      <button
        onClick={() => (gameState === 'PAUSED' ? setGameState('PLAYING') : startGame())}
        className="flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-lg"
        style={{ backgroundColor: colorsFull.target, color: '#fff' }}
      >
        <Play fill="currentColor" /> {gameState === 'START' ? 'Start' : gameState === 'PAUSED' ? 'Resume' : 'Restart'}
      </button>
    </div>
  );

  if (isFullScreen) {
    return (
      <div className="h-full w-full flex items-center justify-center relative">
        <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="max-h-full max-w-full" style={{ objectFit: 'contain', backgroundColor: '#121212' }} />
        {gameState !== 'PLAYING' && overlay}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-900 overflow-hidden">
      {/* Layer 1: Game Canvas - Full Screen Background */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative flex items-center justify-center bg-slate-950 rounded-xl border border-white/10 overflow-hidden w-full h-full max-w-5xl max-h-[85vh]">
          <canvas 
            ref={canvasRef} 
            width={CANVAS_SIZE} 
            height={CANVAS_SIZE} 
            className="max-w-full max-h-full shadow-2xl rounded-xl object-contain"
            style={{ aspectRatio: '1/1', backgroundColor: '#121212' }}
          />
          {gameState !== 'PLAYING' && overlay}
        </div>
      </div>

      {/* Layer 2: Header Info - Glass HUD Top Left */}
      <div className="absolute top-4 left-4 z-20 max-w-sm p-4 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/10 text-white shadow-lg pointer-events-none">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2" style={{ color: colorsFull.target }}>
          <Eye className="w-5 h-5 sm:w-6 sm:h-6" /> Snake
        </h1>
        <p className="text-sm text-gray-300 mt-1 hidden sm:block">
          Target color = weak eye. Use red/blue glasses.
        </p>
      </div>

      {/* Layer 2: Controls Panel - Glass HUD Top Right */}
      <div className="absolute top-4 right-4 z-20">
        {/* Mobile: Collapsible Button */}
        <div className="md:hidden">
          <button className="p-3 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 text-white hover:bg-slate-800/80 transition">
            <Settings size={20} />
          </button>
        </div>

        {/* Desktop: Full Controls Panel */}
        <div className="hidden md:block w-72 bg-slate-900/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-lg">
          <div className="flex items-center gap-2 text-white font-semibold border-b border-white/20 pb-2">
            <Settings size={16} /> Controls
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Food visibility</label>
            <input type="range" min="0.1" max="1" step="0.1" value={foodIntensity} onChange={(e) => setFoodIntensity(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
            <span className="text-xs text-gray-400">{Math.round(foodIntensity * 100)}%</span>
          </div>
          <p className="text-gray-300 text-sm">Score: <span className="text-white font-mono">{score}</span></p>
          <p className="text-gray-400 text-xs">SPACE: Pause</p>
        </div>
      </div>
    </div>
  );
}
