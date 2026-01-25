import { useState, useEffect, useRef } from 'react';
import { Target, Play, Pause, AlertCircle } from 'lucide-react';
import useTherapyColors from '../hooks/useTherapyColors.js';
import { useGlobal } from '../context/GlobalContext.jsx';

/**
 * Tracking – "Whack-a-Target"
 * Targets appear randomly. If weakEye === 'both': high-contrast black on white only.
 */
const W = 400, H = 400;
const R = 24;
const SPAWN_INTERVAL = 900;
const FADE_MS = 600;

export default function WhackATarget({ onGameEnd, isFullScreen }) {
  const { weakEye } = useGlobal();
  const isBoth = weakEye === 'both';
  const colors = useTherapyColors(weakEye, 1);

  const [gameState, setGameState] = useState('START');
  const [score, setScore] = useState(0);
  const [targets, setTargets] = useState([]);
  const startTimeRef = useRef(null);
  const lastSpawnRef = useRef(0);
  const canvasRef = useRef(null);

  const startGame = () => {
    setScore(0);
    setTargets([]);
    lastSpawnRef.current = Date.now();
    startTimeRef.current = Date.now();
    setGameState('PLAYING');
  };

  const endGame = () => {
    setGameState('GAMEOVER');
    if (onGameEnd && startTimeRef.current) onGameEnd(score, (Date.now() - startTimeRef.current) / 1000);
  };

  const hit = (id) => {
    setTargets((t) => t.filter((x) => x.id !== id));
    setScore((s) => s + 10);
  };

  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const spawn = () => {
      const x = R + Math.random() * (W - 2 * R);
      const y = R + Math.random() * (H - 2 * R);
      setTargets((t) => [...t, { id: Date.now() + Math.random(), x, y, at: Date.now() }]);
      lastSpawnRef.current = Date.now();
    };
    const iv = setInterval(() => {
      if (Date.now() - lastSpawnRef.current >= SPAWN_INTERVAL) spawn();
    }, 300);
    return () => clearInterval(iv);
  }, [gameState]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = isBoth ? '#FFFFFF' : colors.background;
    ctx.fillRect(0, 0, W, H);
    const now = Date.now();
    targets.forEach(({ x, y, at }) => {
      const age = now - at;
      const alpha = age < FADE_MS ? age / FADE_MS : 1;
      if (isBoth) {
        ctx.fillStyle = `rgba(0,0,0,${alpha})`;
      } else {
        const base = colors.target;
        if (base.startsWith('rgba')) {
          const i = base.lastIndexOf(',');
          ctx.fillStyle = base.slice(0, i) + ',' + alpha + ')';
        } else {
          ctx.fillStyle = base;
        }
      }
      ctx.beginPath();
      ctx.arc(x, y, R, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [targets, colors, isBoth, gameState]);

  useEffect(() => {
    const onMouse = (e) => {
      if (gameState !== 'PLAYING') return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const scaleX = W / rect.width, scaleY = H / rect.height;
      const mx = (e.clientX - rect.left) * scaleX, my = (e.clientY - rect.top) * scaleY;
      for (const t of targets) {
        const d = Math.hypot(mx - t.x, my - t.y);
        if (d <= R) { hit(t.id); return; }
      }
    };
    const c = canvasRef.current;
    if (c) { c.addEventListener('click', onMouse); return () => c.removeEventListener('click', onMouse); }
  }, [gameState, targets]);

  useEffect(() => {
    const h = (e) => {
      if (e.code === 'Space') { e.preventDefault(); setGameState((p) => (p === 'PLAYING' ? 'PAUSED' : p === 'PAUSED' ? 'PLAYING' : p)); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  return (
    <div className="relative w-full h-full bg-gray-900 overflow-hidden">
      {/* Layer 1: Game Canvas - Full Screen Background */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative rounded-xl border border-white/10 overflow-hidden bg-slate-950 w-full h-full max-w-5xl max-h-[85vh]">
          <canvas ref={canvasRef} width={W} height={H} className="block w-full h-full cursor-crosshair object-contain" style={{ aspectRatio: '16/9', backgroundColor: '#121212' }} />
          <div className="absolute top-3 left-3 font-mono font-bold text-lg text-white bg-slate-900/60 backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl">Score: {score}</div>
          {gameState !== 'PLAYING' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
              {(gameState === 'GAMEOVER' || gameState === 'START') && (
                <div className="text-center mb-4">
                  {gameState === 'GAMEOVER' && <AlertCircle className="mx-auto w-12 h-12 mb-2" style={{ color: colors.target }} />}
                  <h2 className="text-2xl font-black">{gameState === 'START' ? 'Ready' : 'Done'}</h2>
                  <p className="text-slate-300">Score: {score}</p>
                </div>
              )}
              {gameState === 'PAUSED' && (
                <div className="text-center mb-4">
                  <Pause className="mx-auto w-12 h-12 mb-2" style={{ color: colors.lock }} />
                  <h2 className="text-2xl font-black">PAUSED</h2>
                </div>
              )}
              <button
                onClick={() => (gameState === 'PAUSED' ? setGameState('PLAYING') : startGame())}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-bold"
                style={{ backgroundColor: isBoth ? '#000' : colors.target, color: '#fff' }}
              >
                <Play fill="currentColor" /> {gameState === 'START' ? 'Start' : gameState === 'PAUSED' ? 'Resume' : 'Again'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Layer 2: Header Info - Glass HUD Top Left */}
      <div className="absolute top-4 left-4 z-20 max-w-sm p-4 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/10 text-white shadow-lg pointer-events-none">
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-6 h-6" style={{ color: isBoth ? '#000' : colors.target }} />
          <h1 className="text-xl sm:text-2xl font-bold">Whack-a-Target</h1>
        </div>
        <p className="text-sm text-gray-300 hidden sm:block">
          Saccades training • Fast eye movements
        </p>
      </div>

      {/* Layer 2: Controls Panel - Glass HUD Top Right */}
      <div className="absolute top-4 right-4 z-20">
        {/* Mobile: Settings Icon Button */}
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Score</span>
              <span className="text-white font-mono font-bold">{score}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Targets Hit</span>
              <span className="text-white font-mono font-bold">{targets.length}</span>
            </div>
            <p className="text-gray-400 text-xs">Click targets • Space: Pause</p>
            {isBoth && <p className="text-gray-400 text-xs">Fusion mode: black on white</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
