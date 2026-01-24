import { useState, useEffect, useRef } from 'react';
import { Target, Play, Pause, AlertCircle } from 'lucide-react';
import useTherapyColors from '../hooks/useTherapyColors';
import { useGlobal } from '../context/GlobalContext';

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
    <div className="flex flex-col items-center min-h-screen bg-slate-900 text-white p-4">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Target className="w-6 h-6" style={{ color: isBoth ? '#000' : colors.target }} /> Whack-a-Target
        </h1>
        <p className="text-slate-400 text-sm">Tracking. Click targets. {isBoth && 'Fusion: black on white.'}</p>
      </div>
      <div className="flex gap-6 items-start">
        <div className="relative rounded-lg border-2 border-slate-700 overflow-hidden bg-slate-950">
          <canvas ref={canvasRef} width={W} height={H} className="block cursor-crosshair" />
          <div className="absolute top-2 left-2 font-mono">Score: {score}</div>
          {gameState !== 'PLAYING' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
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
        <div className="w-52 bg-slate-800 p-4 rounded-xl border border-slate-600 text-sm text-slate-400">
          <p>Click each target. They appear randomly.</p>
          {isBoth && <p>Fusion mode: black on white only.</p>}
          <p>SPACE: Pause.</p>
        </div>
      </div>
    </div>
  );
}
