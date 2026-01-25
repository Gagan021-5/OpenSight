import React, { useState, useEffect, useRef } from 'react';
import { LayoutGrid, Play, Pause, AlertCircle, Settings, MoveDown, Maximize, Minimize, RotateCcw } from 'lucide-react';
import useTherapyColors from '../hooks/useTherapyColors.js';
import { useGlobal } from '../context/GlobalContext.jsx';

const INTERNAL_WIDTH = 220;
const INTERNAL_HEIGHT = 396;
const COLS = 10;
const ROWS = 18;
const CELL = 22;
const W = COLS * CELL;
const H = ROWS * CELL;

const SHAPES = [
  [[1,1,1,1]],[[1,1],[1,1]],[[1,1,1],[0,1,0]],[[1,1,1],[1,0,0]],[[1,1,1],[0,0,1]],[[1,1,0],[0,1,1]],[[0,1,1],[1,1,0]]
];

export default function TherapyTetris() {
  const { weakEye } = useGlobal();
  const [intensity, setIntensity] = useState(1.0);
  const colors = useTherapyColors(weakEye, intensity);
  const getSolidColor = () => weakEye === 'left' ? '#FF0000' : '#0000FF';

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [gameState, setGameState] = useState('START');
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [frame, setFrame] = useState(0);
  const gridRef = useRef(Array(ROWS).fill(null).map(() => Array(COLS).fill(0)));
  const pieceRef = useRef(null);
  const piecePosRef = useRef({ x: 0, y: 0 });
  const lastDropRef = useRef(0);
  const inc = () => setFrame((f) => f + 1);

  const spawn = () => {
    const s = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const mat = s.map((r) => [...r]);
    return { mat, x: Math.floor((COLS - mat[0].length) / 2), y: 0 };
  };

  const startGame = () => {
    gridRef.current = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    pieceRef.current = spawn();
    piecePosRef.current = { x: pieceRef.current.x, y: pieceRef.current.y };
    lastDropRef.current = Date.now();
    setScore(0);
    setLines(0);
    setGameState('PLAYING');
  };

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

  const overlap = (mat, px, py) => {
    for (let r = 0; r < mat.length; r++)
      for (let c = 0; c < mat[0].length; c++)
        if (mat[r][c]) {
          const ny = py + r, nx = px + c;
          if (ny >= ROWS || nx < 0 || nx >= COLS) return true;
          if (ny >= 0 && gridRef.current[ny][nx]) return true;
        }
    return false;
  };

  const merge = (mat, px, py) => {
    for (let r = 0; r < mat.length; r++)
      for (let c = 0; c < mat[0].length; c++)
        if (mat[r][c] && py + r >= 0) gridRef.current[py + r][px + c] = 1;
  };

  const clearLines = () => {
    let linesCleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (gridRef.current[r].every((c) => c)) {
        gridRef.current.splice(r, 1);
        gridRef.current.unshift(Array(COLS).fill(0));
        linesCleared++;
        r++;
      }
    }
    if (linesCleared) {
      setScore((s) => s + linesCleared * 100);
      setLines((l) => l + linesCleared);
    }
  };

  const rotate = (m) => m[0].map((_, i) => m.map((r) => r[i]).reverse());

  useEffect(() => {
    const h = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setGameState(p => p === 'PLAYING' ? 'PAUSED' : p === 'PAUSED' ? 'PLAYING' : p);
        return;
      }
      if (gameState !== 'PLAYING' || !pieceRef.current) return;
      const { mat } = pieceRef.current;
      let { x, y } = piecePosRef.current;
      if (e.key === 'ArrowLeft' && !overlap(mat, x - 1, y)) { piecePosRef.current.x = x - 1; inc(); }
      if (e.key === 'ArrowRight' && !overlap(mat, x + 1, y)) { piecePosRef.current.x = x + 1; inc(); }
      if (e.key === 'ArrowDown') {
        if (!overlap(mat, x, y + 1)) { piecePosRef.current.y = y + 1; inc(); }
        else {
          merge(mat, x, y);
          clearLines();
          pieceRef.current = spawn();
          piecePosRef.current = { x: pieceRef.current.x, y: pieceRef.current.y };
          if (overlap(pieceRef.current.mat, piecePosRef.current.x, piecePosRef.current.y)) setGameState('GAMEOVER');
          inc();
        }
      }
      if (e.key === 'ArrowUp') {
        const rot = rotate(mat);
        if (!overlap(rot, x, y)) { pieceRef.current = { ...pieceRef.current, mat: rot }; inc(); }
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'PLAYING' || !pieceRef.current) return;
    const tick = () => {
      const now = Date.now();
      if (now - lastDropRef.current < 600) return;
      lastDropRef.current = now;
      const { mat } = pieceRef.current;
      let { x, y } = piecePosRef.current;
      if (!overlap(mat, x, y + 1)) { piecePosRef.current.y = y + 1; inc(); }
      else {
        merge(mat, x, y);
        clearLines();
        pieceRef.current = spawn();
        piecePosRef.current = { x: pieceRef.current.x, y: pieceRef.current.y };
        if (overlap(pieceRef.current.mat, piecePosRef.current.x, piecePosRef.current.y)) setGameState('GAMEOVER');
        inc();
      }
    };
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [gameState]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);
    
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        if (gridRef.current[r][c]) {
          ctx.fillStyle = colors.lock;
          ctx.fillRect(c * CELL, r * CELL, CELL - 1, CELL - 1);
        }
      }
    
    const p = pieceRef.current;
    if (p && gameState === 'PLAYING') {
      ctx.fillStyle = getSolidColor();
      const { mat } = p;
      const { x, y } = piecePosRef.current;
      for (let r = 0; r < mat.length; r++)
        for (let c = 0; c < mat[0].length; c++)
          if (mat[r][c]) ctx.fillRect((x + c) * CELL, (y + r) * CELL, CELL - 1, CELL - 1);
    }
  }, [gameState, frame, score, colors]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 font-sans text-white p-4">
      {!isFullScreen && (
        <div className="flex items-center gap-3 mb-6">
          <LayoutGrid className="w-8 h-8" style={{ color: getSolidColor() }} />
          <h1 className="text-3xl font-bold tracking-tighter">
            <span style={{ color: getSolidColor() }}>RED</span> TETRIS
          </h1>
        </div>
      )}

      {/* RESPONSIVE LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full max-w-5xl">
        <div ref={containerRef} className={`relative w-full lg:flex-1 bg-neutral-950 flex items-center justify-center transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50' : 'border-4 border-neutral-800 rounded-lg shadow-2xl aspect-[10/18] lg:h-[600px] lg:w-auto'}`}>
          <button onClick={toggleFullScreen} className="absolute top-4 right-4 p-2 bg-gray-800/50 hover:bg-gray-700 rounded-full text-white z-50 transition">
            {isFullScreen ? <Minimize size={24} /> : <Maximize size={24} />}
          </button>
          <canvas ref={canvasRef} width={W} height={H} className={`block shadow-2xl ${isFullScreen ? 'max-h-screen max-w-full object-contain' : 'w-full h-full object-contain'}`} style={{ backgroundColor: '#000' }} />
          
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
                <label className="block text-sm font-medium mb-2" style={{ color: getSolidColor() }}>Piece Opacity</label>
                <input type="range" min="0.1" max="1.0" step="0.1" value={intensity} onChange={(e) => setIntensity(parseFloat(e.target.value))} className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer" style={{ accentColor: getSolidColor() }} />
              </div>
              <div className="bg-black/30 p-4 rounded text-sm text-gray-400 space-y-2"><p>Lines: {lines}</p><p className="text-xs mt-4 pt-4 border-t border-gray-700"><span style={{ color: getSolidColor() }}>■ Falling</span>: Solid</p></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}