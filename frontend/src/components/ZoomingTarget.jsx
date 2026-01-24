import { useState, useEffect, useRef } from 'react';
import { Crosshair, Play, Pause, AlertCircle } from 'lucide-react';
import useTherapyColors from '../hooks/useTherapyColors';
import { useGlobal } from '../context/GlobalContext';

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
  const fuseStart = useRef(null);
  const startTimeRef = useRef(null);
  const canvasRef = useRef(null);

  const startGame = () => {
    setScore(0);
    setDisp(0);
    setFused(false);
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
    if (gameState !== 'PLAYING') return;
    const inFusion = Math.abs(disp) < FUSION_THRESH;
    if (inFusion) {
      if (!fuseStart.current) fuseStart.current = Date.now();
      const held = (Date.now() - fuseStart.current) / 1000;
      if (held >= 1) {
        setScore((s) => s + 10);
        fuseStart.current = Date.now();
      }
    } else {
      fuseStart.current = null;
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
        <canvas ref={canvasRef} width={W} height={H} className="max-h-full max-w-full" style={{ objectFit: 'contain' }} />
        <div className="absolute top-2 left-2 font-mono text-white drop-shadow-lg z-10">Score: {score}</div>
        {gameState !== 'PLAYING' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10">
            {gameState === 'GAMEOVER' && (<div className="text-center mb-4"><AlertCircle className="mx-auto w-12 h-12 mb-2" style={{ color: colors.target }} /><h2 className="text-2xl font-black">Done</h2><p className="text-lg text-slate-300">Score: {score}</p></div>)}
            {gameState === 'PAUSED' && (<div className="text-center mb-4"><Pause className="mx-auto w-12 h-12 mb-2" style={{ color: colors.lock }} /><h2 className="text-2xl font-black">PAUSED</h2></div>)}
            <button onClick={() => (gameState === 'PAUSED' ? setGameState('PLAYING') : startGame())} className="flex items-center gap-2 px-6 py-3 rounded-full font-bold" style={{ backgroundColor: colors.target, color: '#fff' }}><Play fill="currentColor" /> {gameState === 'START' ? 'Start' : gameState === 'PAUSED' ? 'Resume' : 'Play again'}</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-900 text-white p-4">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Crosshair className="w-6 h-6" style={{ color: colors.target }} /> Zooming Target
        </h1>
        <p className="text-slate-400 text-sm">Convergence: overlap the two circles to fuse (purple). Hold to score. ← → to adjust.</p>
      </div>
      <div className="flex gap-6 items-start max-w-4xl mx-auto w-full">
        <div className="relative rounded-lg border-2 border-slate-700 overflow-hidden bg-slate-950 max-w-full">
          <canvas ref={canvasRef} width={W} height={H} className="block max-w-full max-h-[70vh] object-contain" />
          <div className="absolute top-2 left-2 font-mono">Score: {score}</div>
          {gameState !== 'PLAYING' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
              {gameState === 'GAMEOVER' && (
                <div className="text-center mb-4">
                  <AlertCircle className="mx-auto w-12 h-12 mb-2" style={{ color: colors.target }} />
                  <h2 className="text-2xl font-black">Done</h2>
                  <p className="text-lg text-slate-300">Score: {score}</p>
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
                style={{ backgroundColor: colors.target, color: '#fff' }}
              >
                <Play fill="currentColor" /> {gameState === 'START' ? 'Start' : gameState === 'PAUSED' ? 'Resume' : 'Play again'}
              </button>
            </div>
          )}
        </div>
        <div className="w-52 bg-slate-800 p-4 rounded-xl border border-slate-600 text-sm text-slate-400">
          <p>← → : move circles horizontally to overlap.</p>
          <p>When they overlap you see purple (fusion). Hold fusion to earn points.</p>
          <p>SPACE: Pause.</p>
        </div>
      </div>
    </div>
  );
}
