import { useState, useEffect, useRef } from 'react';
import { Crosshair, Play, Pause, AlertCircle, Settings } from 'lucide-react';
import useTherapyColors from '../hooks/useTherapyColors.js';
import { useGlobal } from '../context/GlobalContext.jsx';

/**
 * Convergence – "Zooming Target"
 * Red circle + Blue circle; user controls horizontal disparity with keys.
 * Goal: overlap → Purple fusion circle.
 */
const W = 400;
const H = 400;
const R = 40;
const STEP = 8;
const FUSION_THRESH = 12;

export default function ZoomingTarget({ onGameEnd, isFullScreen }) {
  const { weakEye } = useGlobal();
  const colors = useTherapyColors(weakEye, 1);

  const [gameState, setGameState] = useState('START');
  const [score, setScore] = useState(0);
  const [disp, setDisp] = useState(0); // horizontal disparity: negative = crossed, positive = uncrossed
  const [fused, setFused] = useState(false);
  const [fusionTime, setFusionTime] = useState(0); // Current fusion time in milliseconds
  const fuseStart = useRef(null);
  const startTimeRef = useRef(null);
  const canvasRef = useRef(null);

  const startGame = () => {
    setScore(0);
    setDisp(0);
    setFused(false);
    setFusionTime(0); // Reset fusion time
    fuseStart.current = null;
    startTimeRef.current = Date.now();
    setGameState('PLAYING');
  };

  const endGame = () => {
    setGameState('GAMEOVER');
    if (onGameEnd && startTimeRef.current) onGameEnd(score, (Date.now() - startTimeRef.current) / 1000);
  };

  // Red at center - disp/2, Blue at center + disp/2. When |disp| < FUSION_THRESH → fused (purple)
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      setFusionTime(0); // Reset fusion time when not playing
      return;
    }
    const inFusion = Math.abs(disp) < FUSION_THRESH;
    if (inFusion) {
      if (!fuseStart.current) fuseStart.current = Date.now();
      const currentTime = Date.now() - fuseStart.current;
      setFusionTime(currentTime); // Update fusion time in milliseconds
      const held = currentTime / 1000;
      if (held >= 1) {
        setScore((s) => s + 10);
        fuseStart.current = Date.now(); // Reset timer for next point
      }
    } else {
      fuseStart.current = null;
      setFusionTime(0); // Reset fusion time when not fused
    }
    setFused(inFusion);
  }, [gameState, disp]);

  useEffect(() => {
    const h = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setGameState((p) => (p === 'PLAYING' ? 'PAUSED' : p === 'PAUSED' ? 'PLAYING' : p));
        return;
      }
      if (gameState !== 'PLAYING') return;
      if (e.key === 'ArrowLeft') setDisp((d) => Math.max(-120, d - STEP));
      if (e.key === 'ArrowRight') setDisp((d) => Math.min(120, d + STEP));
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [gameState]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;
    // Red circle (left eye / target when weak=left)
    ctx.fillStyle = weakEye === 'right' ? colors.lock : colors.target;
    ctx.beginPath();
    ctx.arc(cx - disp / 2, cy, R, 0, Math.PI * 2);
    ctx.fill();
    // Blue circle (right eye / lock when weak=left)
    ctx.fillStyle = weakEye === 'right' ? colors.target : colors.lock;
    ctx.beginPath();
    ctx.arc(cx + disp / 2, cy, R, 0, Math.PI * 2);
    ctx.fill();
    // Fusion: when overlapping, draw central purple
    if (fused) {
      ctx.fillStyle = `rgba(128,0,128,0.8)`;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [disp, fused, colors, weakEye, gameState]);

  if (isFullScreen) {
    return (
      <div className="h-full w-full flex items-center justify-center relative">
        <canvas ref={canvasRef} width={W} height={H} className="max-h-full max-w-full" style={{ objectFit: 'contain', backgroundColor: '#121212' }} />
        <div className="absolute top-4 left-4 font-mono text-white drop-shadow-lg z-20 bg-slate-900/60 backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl">Score: {score}</div>
        {gameState !== 'PLAYING' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
            {gameState === 'GAMEOVER' && (<div className="text-center mb-4"><AlertCircle className="mx-auto w-12 h-12 mb-2" style={{ color: colors.target }} /><h2 className="text-2xl font-black">Done</h2><p className="text-lg text-slate-300">Score: {score}</p></div>)}
            {gameState === 'PAUSED' && (<div className="text-center mb-4"><Pause className="mx-auto w-12 h-12 mb-2" style={{ color: colors.lock }} /><h2 className="text-2xl font-black">PAUSED</h2></div>)}
            <button onClick={() => (gameState === 'PAUSED' ? setGameState('PLAYING') : startGame())} className="flex items-center gap-2 px-6 py-3 rounded-full font-bold" style={{ backgroundColor: colors.target, color: '#fff' }}><Play fill="currentColor" /> {gameState === 'START' ? 'Start' : gameState === 'PAUSED' ? 'Resume' : 'Play again'}</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-900 overflow-hidden">
      {/* Layer 1: Game Canvas - Full Screen Background */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative rounded-xl border border-white/10 overflow-hidden bg-slate-950 w-full h-full max-w-5xl max-h-[85vh]">
          <canvas ref={canvasRef} width={W} height={H} className="block w-full h-full object-contain" style={{ aspectRatio: '16/9', backgroundColor: '#121212' }} />
          <div className="absolute top-3 left-3 font-mono font-bold text-lg text-white bg-slate-900/60 backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl">Score: {score}</div>
          {gameState !== 'PLAYING' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
              {gameState === 'GAMEOVER' && (<div className="text-center mb-4"><AlertCircle className="mx-auto w-12 h-12 mb-2" style={{ color: colors.target }} /><h2 className="text-2xl font-black">Done</h2><p className="text-lg text-slate-300">Score: {score}</p></div>)}
              {gameState === 'PAUSED' && (<div className="text-center mb-4"><Pause className="mx-auto w-12 h-12 mb-2" style={{ color: colors.lock }} /><h2 className="text-2xl font-black">PAUSED</h2></div>)}
              <button onClick={() => (gameState === 'PAUSED' ? setGameState('PLAYING') : startGame())} className="flex items-center gap-2 px-6 py-3 rounded-full font-bold" style={{ backgroundColor: colors.target, color: '#fff' }}><Play fill="currentColor" /> {gameState === 'START' ? 'Start' : gameState === 'PAUSED' ? 'Resume' : 'Play again'}</button>
            </div>
          )}
        </div>
      </div>

      {/* Layer 2: Header Info - Glass HUD Top Left */}
      <div className="absolute top-4 left-4 z-20 max-w-sm p-4 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/10 text-white shadow-lg pointer-events-none">
        <div className="flex items-center gap-3 mb-2">
          <Crosshair className="w-6 h-6" style={{ color: colors.target }} />
          <h1 className="text-xl sm:text-2xl font-bold">Zooming Target</h1>
        </div>
        <p className="text-sm text-gray-300 hidden sm:block">
          Convergence training • Overlap circles to fuse
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
              <span className="text-sm text-gray-300">Fusion Time</span>
              <span className="text-white font-mono font-bold">{Math.round(fusionTime)}ms</span>
            </div>
            <p className="text-gray-400 text-xs">Arrow Keys: Move • Hold to fuse</p>
          </div>
        </div>
      </div>
    </div>
  );
}
