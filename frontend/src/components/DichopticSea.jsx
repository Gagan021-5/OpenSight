import { useState, useEffect, useRef } from 'react';
import { Ship, AlertTriangle, Settings, Play, Pause } from 'lucide-react';
import useTherapyColors from '../hooks/useTherapyColors';
import { useGlobal } from '../context/GlobalContext';

const W = 400, H = 600;
const BOAT_W = 60, BOAT_H = 90, OBS_W = 60, OBS_H = 60, LANES = 3, LANE_W = W / LANES;
const INIT_SPEED = 250, MAX_SPEED = 700, INC = 25, WAVE_X = 150;

function laneCenter(lane) {
  return lane * LANE_W + LANE_W / 2 - BOAT_W / 2;
}

export default function DichopticSea({ onGameEnd, isFullScreen }) {
  const { weakEye } = useGlobal();
  const [intensity, setIntensity] = useState(1);
  const colors = useTherapyColors(weakEye, intensity);

  const [gameState, setGameState] = useState('START');
  const [score, setScore] = useState(0);
  const [displaySpeed, setDisplaySpeed] = useState(1);
  const [currentLane, setCurrentLane] = useState(1);
  const startTimeRef = useRef(null);

  const rAf = useRef();
  const lastT = useRef(0);
  const scoreR = useRef(0);
  const speedR = useRef(INIT_SPEED);
  const obsR = useRef([]);
  const waveX = useRef(0);
  const laneCurR = useRef(1);
  const canvasRef = useRef(null);

  const startGame = () => {
    scoreR.current = 0;
    speedR.current = INIT_SPEED;
    obsR.current = [];
    laneCurR.current = 1;
    waveX.current = 0;
    lastT.current = performance.now();
    startTimeRef.current = Date.now();
    setScore(0);
    setDisplaySpeed(1);
    setCurrentLane(1);
    setGameState('PLAYING');
  };

  const endGame = () => {
    setGameState('GAMEOVER');
    if (onGameEnd && startTimeRef.current) onGameEnd(scoreR.current, (Date.now() - startTimeRef.current) / 1000);
  };

  const draw = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = colors.lock;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7;
    const shiftX = -waveX.current;
    const waveH = 10, waveL = 100, spaceY = 40;
    ctx.beginPath();
    for (let y = -spaceY; y < H + spaceY; y += spaceY) {
      ctx.moveTo(shiftX - waveL, y);
      for (let x = shiftX - waveL; x < W + waveL * 2; x += waveL) {
        ctx.bezierCurveTo(x + waveL/4, y - waveH, x + waveL*3/4, y + waveH, x + waveL, y);
      }
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    const pX = laneCenter(laneCurR.current), pY = H - 140;
    ctx.fillStyle = colors.target;
    ctx.beginPath();
    ctx.moveTo(pX, pY);
    ctx.lineTo(pX + BOAT_W, pY);
    ctx.lineTo(pX + BOAT_W - 10, pY + BOAT_H);
    ctx.lineTo(pX + 10, pY + BOAT_H);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(pX + BOAT_W/2 - 3, pY - 30, 6, 30);
    ctx.beginPath();
    ctx.moveTo(pX + BOAT_W/2, pY - 30);
    ctx.lineTo(pX + BOAT_W, pY);
    ctx.lineTo(pX + BOAT_W/2, pY);
    ctx.fill();
    obsR.current.forEach((o) => {
      ctx.fillStyle = colors.target;
      ctx.beginPath();
      ctx.moveTo(o.x + 10, o.y + OBS_H);
      ctx.lineTo(o.x + OBS_W/2, o.y);
      ctx.lineTo(o.x + OBS_W - 10, o.y + OBS_H);
      ctx.fill();
    });
  };

  const update = (time) => {
    if (gameState !== 'PLAYING') return;
    const dt = Math.min((time - lastT.current) / 1000, 0.1);
    lastT.current = time;
    waveX.current = (waveX.current + WAVE_X * dt) % 200;
    obsR.current.forEach((o) => { o.y += speedR.current * dt; });
    if (obsR.current[0]?.y > H) {
      obsR.current.shift();
      scoreR.current += 10;
      setScore(scoreR.current);
      if (scoreR.current % 100 === 0 && speedR.current < MAX_SPEED) {
        speedR.current += INC;
        setDisplaySpeed(Math.floor(speedR.current / 50));
      }
    }
    const last = obsR.current[obsR.current.length - 1];
    const gap = 280 + speedR.current * 0.25;
    if (!last || last.y > gap) {
      if (Math.random() < 0.05) {
        const L = Math.floor(Math.random() * LANES);
        obsR.current.push({ x: L * LANE_W + LANE_W/2 - OBS_W/2, y: -100, width: OBS_W, height: OBS_H });
      }
    }
    const pX = laneCenter(laneCurR.current) + 15, pY = H - 130, pW = BOAT_W - 30, pH = BOAT_H - 20;
    for (const o of obsR.current) {
      const ox = o.x + 10, oy = o.y + 10, ow = OBS_W - 20, oh = OBS_H - 20;
      if (pX < ox + ow && pX + pW > ox && pY < oy + oh && pY + pH > oy) {
        setGameState('GAMEOVER');
        if (onGameEnd && startTimeRef.current) onGameEnd(scoreR.current, (Date.now() - startTimeRef.current) / 1000);
        cancelAnimationFrame(rAf.current);
        return;
      }
    }
    draw();
    rAf.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    const h = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setGameState((p) => (p === 'PLAYING' ? 'PAUSED' : p === 'PAUSED' ? 'PLAYING' : p));
        if (gameState === 'PAUSED') lastT.current = performance.now();
        return;
      }
      if (gameState !== 'PLAYING') return;
      if (e.key === 'ArrowLeft' && laneCurR.current > 0) { laneCurR.current--; setCurrentLane(laneCurR.current); }
      else if (e.key === 'ArrowRight' && laneCurR.current < LANES - 1) { laneCurR.current++; setCurrentLane(laneCurR.current); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      lastT.current = performance.now();
      rAf.current = requestAnimationFrame(update);
    } else draw();
    return () => cancelAnimationFrame(rAf.current);
  }, [gameState, intensity, currentLane, colors]);

  if (isFullScreen) {
    return (
      <div className="h-full w-full flex items-center justify-center relative">
        <canvas ref={canvasRef} width={W} height={H} className="max-h-full max-w-full" style={{ objectFit: 'contain' }} />
        <div className="absolute top-4 left-4 font-mono font-bold text-white drop-shadow-lg z-20 bg-slate-900/60 backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl">SCORE: {score}</div>
        {gameState !== 'PLAYING' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
            {gameState === 'GAMEOVER' && (<div className="text-center mb-4"><AlertTriangle className="mx-auto w-12 h-12 mb-2" style={{ color: colors.target }} /><h2 className="text-2xl font-black">CAPSIZED</h2><p className="text-lg" style={{ color: colors.target }}>Score: {score}</p></div>)}
            {gameState === 'PAUSED' && (<div className="text-center mb-4"><Pause className="mx-auto w-12 h-12 mb-2" style={{ color: colors.lock }} /><h2 className="text-2xl font-black">PAUSED</h2></div>)}
            <button onClick={() => (gameState === 'PAUSED' ? setGameState('PLAYING') : startGame())} className="flex items-center gap-2 px-6 py-3 rounded-full font-bold" style={{ backgroundColor: colors.target, color: '#fff' }}><Play fill="currentColor" /> {gameState === 'START' ? 'Set Sail' : gameState === 'PAUSED' ? 'Resume' : 'Retry'}</button>
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
          <canvas ref={canvasRef} width={W} height={H} className="block w-full h-full object-contain" style={{ aspectRatio: '16/9' }} />
          <div className="absolute top-3 left-3 font-mono font-bold text-lg text-white bg-slate-900/60 backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl">SCORE: {score}</div>
          {gameState !== 'PLAYING' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
              {gameState === 'GAMEOVER' && (<div className="text-center mb-4"><AlertTriangle className="mx-auto w-12 h-12 mb-2" style={{ color: colors.target }} /><h2 className="text-2xl font-black">CAPSIZED</h2><p className="text-lg" style={{ color: colors.target }}>Score: {score}</p></div>)}
              {gameState === 'PAUSED' && (<div className="text-center mb-4"><Pause className="mx-auto w-12 h-12 mb-2" style={{ color: colors.lock }} /><h2 className="text-2xl font-black">PAUSED</h2></div>)}
              <button onClick={() => (gameState === 'PAUSED' ? setGameState('PLAYING') : startGame())} className="flex items-center gap-2 px-6 py-3 rounded-full font-bold" style={{ backgroundColor: colors.target, color: '#fff' }}><Play fill="currentColor" /> {gameState === 'START' ? 'Set Sail' : gameState === 'PAUSED' ? 'Resume' : 'Retry'}</button>
            </div>
          )}
        </div>
      </div>

      {/* Layer 2: Header Info - Glass HUD Top Left */}
      <div className="absolute top-4 left-4 z-20 max-w-sm p-4 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/10 text-white shadow-lg pointer-events-none">
        <div className="flex items-center gap-3 mb-2">
          <Ship className="w-6 h-6" style={{ color: colors.target }} />
          <h1 className="text-xl sm:text-2xl font-bold">Sea Explorer</h1>
        </div>
        <p className="text-sm text-gray-300 hidden sm:block">
          Contrast sensitivity training • Find hidden objects
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
              <span className="text-sm text-gray-300">Objects Found</span>
              <span className="text-white font-mono font-bold">{foundR.current}</span>
            </div>
            <p className="text-gray-400 text-xs">Arrow Keys: Move • Space: Pause</p>
          </div>
        </div>
      </div>
    </div>
  );
}
