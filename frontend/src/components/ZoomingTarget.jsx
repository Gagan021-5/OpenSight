import React, { useState, useEffect, useRef } from 'react';
import { Crosshair, Play, Pause, AlertCircle, Settings, Maximize, Minimize } from 'lucide-react';
import useTherapyColors from '../hooks/useTherapyColors.js';
import { useGlobal } from '../context/GlobalContext.jsx';

const INTERNAL_WIDTH = 400;
const INTERNAL_HEIGHT = 400;
const R = 40;
const STEP = 8;
const FUSION_THRESH = 12;

export default function ZoomingTarget({ onGameEnd }) {
  const { weakEye } = useGlobal();
  const colors = useTherapyColors(weakEye, 1);
  // Weak eye sees Solid, Strong eye sees Reference
  const getSolidColor = () => weakEye === 'left' ? '#FF0000' : '#0000FF';

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [gameState, setGameState] = useState('START');
  const [score, setScore] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [disp, setDisp] = useState(0);
  const [fused, setFused] = useState(false);
  const [fusionTime, setFusionTime] = useState(0);
  const fuseStart = useRef(null);

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

  useEffect(() => {
    if (gameState !== 'PLAYING') { setFusionTime(0); return; }
    const inFusion = Math.abs(disp) < FUSION_THRESH;
    if (inFusion) {
      if (!fuseStart.current) fuseStart.current = Date.now();
      const ct = Date.now() - fuseStart.current;
      setFusionTime(ct);
      if (ct >= 1000) {
        setScore(s => s + 10);
        fuseStart.current = Date.now();
      }
    } else {
      fuseStart.current = null;
      setFusionTime(0);
    }
    setFused(inFusion);
  }, [gameState, disp]);

  const draw = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    // 1. Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
    
    const cx = INTERNAL_WIDTH / 2, cy = INTERNAL_HEIGHT / 2;
    
    // Left Eye Image (Red if weak=left) - Drawn Solid
    ctx.fillStyle = weakEye === 'right' ? colors.lock : colors.target; 
    ctx.beginPath();
    ctx.arc(cx - disp / 2, cy, R, 0, Math.PI * 2);
    ctx.fill();
    
    // Right Eye Image (Blue if weak=left) - Drawn as Reference
    // Use 'screen' blend mode to simulate light mixing (Red+Blue = Magenta/Purple)
    ctx.globalCompositeOperation = 'screen'; 
    ctx.fillStyle = weakEye === 'right' ? colors.target : colors.lock;
    ctx.beginPath();
    ctx.arc(cx + disp / 2, cy, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    // Guide Lines (Very faint for alignment help)
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(INTERNAL_WIDTH, cy);
    ctx.stroke();
  };

  useEffect(() => {
    let rAf;
    const loop = () => { draw(); rAf = requestAnimationFrame(loop); };
    loop();
    return () => cancelAnimationFrame(rAf);
  }, [disp, colors, weakEye]);

  useEffect(() => {
    const h = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setGameState(p => p === 'PLAYING' ? 'PAUSED' : p === 'PAUSED' ? 'PLAYING' : p);
      }
      if (gameState !== 'PLAYING') return;
      if (e.key === 'ArrowLeft') setDisp(d => Math.max(-120, d - STEP));
      if (e.key === 'ArrowRight') setDisp(d => Math.min(120, d + STEP));
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [gameState]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 font-sans text-white p-4">
      {!isFullScreen && (
        <div className="flex items-center gap-3 mb-6">
          <Crosshair className="w-8 h-8" style={{ color: getSolidColor() }} />
          <h1 className="text-3xl font-bold tracking-tighter">
            <span style={{ color: getSolidColor() }}>ZOOM</span> TARGET <span className="text-blue-500 text-sm opacity-50 hidden sm:inline">(CONVERGENCE)</span>
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
              {gameState === 'PAUSED' && <div className="text-center mb-6"><Pause className="mx-auto w-16 h-16 mb-2 text-blue-500" /><h2 className="text-4xl font-black">PAUSED</h2></div>}
              {gameState === 'GAMEOVER' && <div className="text-center mb-6"><AlertCircle className="mx-auto w-16 h-16 mb-2" style={{ color: getSolidColor() }} /><h2 className="text-4xl font-black">FINISHED</h2></div>}
              <button onClick={() => setGameState('PLAYING')} className="flex items-center gap-2 px-8 py-4 text-white font-bold rounded-full text-xl shadow-lg transition hover:scale-105" style={{ backgroundColor: getSolidColor() }}><Play fill="currentColor" /> {gameState === 'START' ? 'START' : 'RESUME'}</button>
            </div>
          )}
          <div className="absolute top-4 left-4 text-white font-mono font-bold text-xl drop-shadow-md z-30">
            SCORE: {score} <span className="text-xs text-gray-400 block mt-1">Fusion Time: {Math.round(fusionTime)}ms</span>
          </div>
        </div>

        {/* Sidebar */}
        {!isFullScreen && (
          <div className="w-full lg:w-80 bg-neutral-800 p-6 rounded-xl border border-neutral-700 h-auto flex flex-col">
            <div className="flex items-center gap-2 mb-6 text-gray-400 uppercase text-xs font-bold tracking-widest"><Settings size={14} /> Instructions</div>
            <div className="space-y-4 flex-1 text-sm text-gray-300">
              <p>Use <strong className="text-white">Arrow Keys</strong> to move the circles horizontally.</p>
              <p>Your goal is to make them <strong>overlap perfectly</strong> until the center turns purple/white.</p>
              <p>Hold the fusion to gain points.</p>
            </div>
            {/* Mobile Hint */}
            <div className="lg:hidden text-center mt-6 p-4 bg-neutral-700/50 rounded-lg">
               <p className="text-sm font-bold text-white">Tap Left/Right side of screen to adjust</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}