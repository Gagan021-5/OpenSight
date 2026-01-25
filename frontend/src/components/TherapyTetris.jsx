import { useState, useEffect, useRef } from 'react';
import { LayoutGrid, Play, Pause, AlertCircle } from 'lucide-react';
import useTherapyColors from '../hooks/useTherapyColors.js';
import { useGlobal } from '../context/GlobalContext.jsx';

/**
 * Strabismus – "Therapy Tetris"
 * Falling blocks = target (weak eye). Static/stacked blocks = lock (strong eye).
 */
const COLS = 10, ROWS = 18, CELL = 22;
const W = COLS * CELL, H = ROWS * CELL;
const SHAPES = [
  [[1,1,1,1]],
  [[1,1],[1,1]],
  [[1,1,1],[0,1,0]],
  [[1,1,1],[1,0,0]],
  [[1,1,1],[0,0,1]],
  [[1,1,0],[0,1,1]],
  [[0,1,1],[1,1,0]],
];

export default function TherapyTetris({ onGameEnd, isFullScreen }) {
  const { weakEye } = useGlobal();
  const colors = useTherapyColors(weakEye, 1);

  const [gameState, setGameState] = useState('START');
  const [score, setScore] = useState(0);
  const [frame, setFrame] = useState(0);
  const startTimeRef = useRef(null);
  const gridRef = useRef(Array(ROWS).fill(null).map(() => Array(COLS).fill(0)));
  const pieceRef = useRef(null);
  const piecePosRef = useRef({ x: 0, y: 0 });
  const lastDropRef = useRef(0);
  const canvasRef = useRef(null);
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
    startTimeRef.current = Date.now();
    setScore(0);
    setGameState('PLAYING');
  };

  const endGame = () => {
    setGameState('GAMEOVER');
    if (onGameEnd && startTimeRef.current) onGameEnd(score, (Date.now() - startTimeRef.current) / 1000);
  };

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
    let lines = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (gridRef.current[r].every((c) => c)) {
        gridRef.current.splice(r, 1);
        gridRef.current.unshift(Array(COLS).fill(0));
        lines++;
        r++;
      }
    }
    if (lines) setScore((s) => s + lines * 100);
  };

  const rotate = (m) => m[0].map((_, i) => m.map((r) => r[i]).reverse());

  useEffect(() => {
    const h = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setGameState((p) => (p === 'PLAYING' ? 'PAUSED' : p === 'PAUSED' ? 'PLAYING' : p));
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
          if (overlap(pieceRef.current.mat, piecePosRef.current.x, piecePosRef.current.y)) endGame();
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
        if (overlap(pieceRef.current.mat, piecePosRef.current.x, piecePosRef.current.y)) endGame();
        inc();
      }
    };
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [gameState]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = colors.background;
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
      ctx.fillStyle = colors.target;
      const { mat } = p;
      const { x, y } = piecePosRef.current;
      for (let r = 0; r < mat.length; r++)
        for (let c = 0; c < mat[0].length; c++)
          if (mat[r][c]) ctx.fillRect((x + c) * CELL, (y + r) * CELL, CELL - 1, CELL - 1);
    }
  }, [gameState, frame, score, colors]);

  if (isFullScreen) {
    return (
      <div className="h-full w-full flex items-center justify-center relative">
        <canvas ref={canvasRef} width={W} height={H} className="max-h-full max-w-full" style={{ objectFit: 'contain', backgroundColor: '#121212' }} />
        <div className="absolute top-4 left-4 font-mono text-white drop-shadow-lg z-20 bg-slate-900/60 backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl">Score: {score}</div>
        {gameState !== 'PLAYING' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
            {(gameState === 'GAMEOVER' || gameState === 'START') && (<div className="text-center mb-4">{gameState === 'GAMEOVER' && <AlertCircle className="mx-auto w-12 h-12 mb-2" style={{ color: colors.target }} />}<h2 className="text-2xl font-black">{gameState === 'START' ? 'Ready' : 'Game Over'}</h2><p className="text-slate-300">Score: {score}</p></div>)}
            {gameState === 'PAUSED' && (<div className="text-center mb-4"><Pause className="mx-auto w-12 h-12 mb-2" style={{ color: colors.lock }} /><h2 className="text-2xl font-black">PAUSED</h2></div>)}
            <button onClick={() => (gameState === 'PAUSED' ? setGameState('PLAYING') : startGame())} className="flex items-center gap-2 px-6 py-3 rounded-full font-bold" style={{ backgroundColor: colors.target, color: '#fff' }}><Play fill="currentColor" /> {gameState === 'START' ? 'Start' : gameState === 'PAUSED' ? 'Resume' : 'Restart'}</button>
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
          <canvas ref={canvasRef} width={W} height={H} className="block w-full h-full object-contain" style={{ aspectRatio: '1/1', backgroundColor: '#121212' }} />
          <div className="absolute top-3 left-3 font-mono font-bold text-lg text-white bg-slate-900/60 backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl">Score: {score}</div>
          {gameState !== 'PLAYING' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
              {(gameState === 'GAMEOVER' || gameState === 'START') && (<div className="text-center mb-4">{gameState === 'GAMEOVER' && <AlertCircle className="mx-auto w-12 h-12 mb-2" style={{ color: colors.target }} />}<h2 className="text-2xl font-black">{gameState === 'START' ? 'Ready' : 'Game Over'}</h2><p className="text-slate-300">Score: {score}</p></div>)}
              {gameState === 'PAUSED' && (<div className="text-center mb-4"><Pause className="mx-auto w-12 h-12 mb-2" style={{ color: colors.lock }} /><h2 className="text-2xl font-black">PAUSED</h2></div>)}
              <button onClick={() => (gameState === 'PAUSED' ? setGameState('PLAYING') : startGame())} className="flex items-center gap-2 px-6 py-3 rounded-full font-bold" style={{ backgroundColor: colors.target, color: '#fff' }}><Play fill="currentColor" /> {gameState === 'START' ? 'Start' : gameState === 'PAUSED' ? 'Resume' : 'Restart'}</button>
            </div>
          )}
        </div>
      </div>

      {/* Layer 2: Header Info - Glass HUD Top Left */}
      <div className="absolute top-4 left-4 z-20 max-w-sm p-4 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/10 text-white shadow-lg pointer-events-none">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded"></div>
          <h1 className="text-xl sm:text-2xl font-bold">Therapy Tetris</h1>
        </div>
        <p className="text-sm text-gray-300 hidden sm:block">
          Spatial planning • Eye-hand coordination training
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
              <span className="text-sm text-gray-300">Lines</span>
              <span className="text-white font-mono font-bold">{lines}</span>
            </div>
            <p className="text-gray-400 text-xs">Arrow Keys: Move • Space: Rotate</p>
          </div>
        </div>
      </div>
    </div>
  );
}
