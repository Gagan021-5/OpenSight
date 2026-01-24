import { useState, useEffect, useRef } from 'react';
import { Car, AlertTriangle, Settings, Play, Pause, RotateCcw } from 'lucide-react';
import useTherapyColors from '../hooks/useTherapyColors';
import { useGlobal } from '../context/GlobalContext';

const W = 400, H = 600;
const CAR_W = 50, CAR_H = 80, OBS_W = 50, OBS_H = 50, LANES = 3, LANE_W = W / LANES;
const INIT_SPEED = 300, MAX_SPEED = 800, INC = 20;

function laneCenter(lane) {
  return lane * LANE_W + LANE_W / 2 - CAR_W / 2;
}

export default function DichopticRacing({ onGameEnd, isFullScreen }) {
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
  const laneOffR = useRef(0);
  const laneCurR = useRef(1);
  const canvasRef = useRef(null);

  const reset = () => {
    scoreR.current = 0;
    speedR.current = INIT_SPEED;
    obsR.current = [];
    laneCurR.current = 1;
    laneOffR.current = 0;
    lastT.current = performance.now();
    setScore(0);
    setDisplaySpeed(1);
    setCurrentLane(1);
    setGameState('PLAYING');
    startTimeRef.current = Date.now();
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
    ctx.lineWidth = 4;
    ctx.setLineDash([40, 40]);
    ctx.lineDashOffset = laneOffR.current;
    for (let i = 1; i < LANES; i++) {
      ctx.beginPath();
      ctx.moveTo(LANE_W * i, -50);
      ctx.lineTo(LANE_W * i, H + 50);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    const pX = laneCenter(laneCurR.current), pY = H - 120;
    ctx.fillStyle = colors.target;
    ctx.fillRect(pX, pY, CAR_W, CAR_H);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(pX + 5, pY + 10, CAR_W - 10, 15);
    ctx.fillRect(pX + 5, pY + 50, CAR_W - 10, 10);
    obsR.current.forEach((o) => {
      ctx.fillStyle = colors.target;
      ctx.fillRect(o.x, o.y, OBS_W, OBS_H);
      ctx.strokeStyle = colors.lock;
      ctx.lineWidth = 2;
      ctx.strokeRect(o.x, o.y, OBS_W, OBS_H);
    });
  };

  const update = (time) => {
    if (gameState !== 'PLAYING') return;
    const dt = Math.min((time - lastT.current) / 1000, 0.1);
    lastT.current = time;
    const move = speedR.current * dt;
    laneOffR.current = (laneOffR.current - move) % 80;
    obsR.current.forEach((o) => { o.y += move; });
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
    const gap = 250 + speedR.current * 0.2;
    if (!last || last.y > gap) {
      if (Math.random() < 0.05) {
        const L = Math.floor(Math.random() * LANES);
        obsR.current.push({
          x: L * LANE_W + LANE_W / 2 - OBS_W / 2,
          y: -100,
          width: OBS_W,
          height: OBS_H,
        });
      }
    }
    const pX = laneCenter(laneCurR.current) + 10, pY = H - 110, pW = CAR_W - 20, pH = CAR_H - 20;
    for (let i = 0; i < obsR.current.length; i++) {
      const o = obsR.current[i];
      const ox = o.x + 5, oy = o.y + 5, ow = OBS_W - 10, oh = OBS_H - 10;
      if (pX < ox + ow && pX + pW > ox && pY < oy + oh && pY + pH > oy) {
        setGameState('GAMEOVER');
        obsR.current.splice(i, 1);
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
      if (e.key === 'ArrowLeft' && laneCurR.current > 0) {
        laneCurR.current--;
        setCurrentLane(laneCurR.current);
      } else if (e.key === 'ArrowRight' && laneCurR.current < LANES - 1) {
        laneCurR.current++;
        setCurrentLane(laneCurR.current);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      lastT.current = performance.now();
      startTimeRef.current = startTimeRef.current || Date.now();
      rAf.current = requestAnimationFrame(update);
    } else draw();
    return () => cancelAnimationFrame(rAf.current);
  }, [gameState, intensity, currentLane, colors]);

  if (isFullScreen) {
    return (
      <div className="h-full w-full flex items-center justify-center relative">
        <canvas ref={canvasRef} width={W} height={H} className="max-h-full max-w-full" style={{ objectFit: 'contain' }} />
        <div className="absolute top-2 left-2 font-mono font-bold text-white drop-shadow-lg z-10">SCORE: {score}</div>
        {gameState !== 'PLAYING' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10">
            {gameState === 'GAMEOVER' && (<div className="text-center mb-4"><AlertTriangle className="mx-auto w-12 h-12 mb-2" style={{ color: colors.target }} /><h2 className="text-2xl font-black">CRASHED</h2><p className="text-lg" style={{ color: colors.target }}>Score: {score}</p></div>)}
            {gameState === 'PAUSED' && (<div className="text-center mb-4"><Pause className="mx-auto w-12 h-12 mb-2" style={{ color: colors.lock }} /><h2 className="text-2xl font-black">PAUSED</h2></div>)}
            <div className="flex flex-col gap-2">
              <button onClick={() => { if (gameState === 'START' || gameState === 'GAMEOVER') reset(); else if (gameState === 'PAUSED') { lastT.current = performance.now(); setGameState('PLAYING'); } }} className="flex items-center gap-2 px-6 py-3 rounded-full font-bold" style={{ backgroundColor: colors.target, color: '#fff' }}><Play fill="currentColor" /> {gameState === 'START' ? 'Start' : gameState === 'PAUSED' ? 'Continue' : 'Restart'}</button>
              {(gameState === 'GAMEOVER' || gameState === 'PAUSED') && (<button onClick={reset} className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-600 hover:bg-slate-500 text-sm font-bold"><RotateCcw size={14} /> Restart</button>)}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-900 text-white p-4">
      <div className="flex gap-3 mb-4">
        <Car className="w-8 h-8" style={{ color: colors.target }} />
        <h1 className="text-2xl font-bold">Racing</h1>
      </div>
      <div className="flex gap-6 items-start max-w-4xl mx-auto w-full">
        <div className="relative rounded-lg border-2 border-slate-700 overflow-hidden bg-slate-950 max-w-full">
          <canvas ref={canvasRef} width={W} height={H} className="block max-w-full max-h-[70vh] object-contain" />
          <div className="absolute top-3 left-3 font-mono font-bold text-lg">SCORE: {score}</div>
          {gameState !== 'PLAYING' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
              {gameState === 'GAMEOVER' && (
                <div className="text-center mb-4">
                  <AlertTriangle className="mx-auto w-12 h-12 mb-2" style={{ color: colors.target }} />
                  <h2 className="text-2xl font-black">CRASHED</h2>
                  <p className="text-lg" style={{ color: colors.target }}>Score: {score}</p>
                </div>
              )}
              {gameState === 'PAUSED' && (
                <div className="text-center mb-4">
                  <Pause className="mx-auto w-12 h-12 mb-2" style={{ color: colors.lock }} />
                  <h2 className="text-2xl font-black">PAUSED</h2>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    if (gameState === 'START' || gameState === 'GAMEOVER') reset();
                    else if (gameState === 'PAUSED') { lastT.current = performance.now(); setGameState('PLAYING'); }
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-bold"
                  style={{ backgroundColor: colors.target, color: '#fff' }}
                >
                  <Play fill="currentColor" /> {gameState === 'START' ? 'Start' : gameState === 'PAUSED' ? 'Continue' : 'Restart'}
                </button>
                {(gameState === 'GAMEOVER' || gameState === 'PAUSED') && (
                  <button onClick={reset} className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-600 hover:bg-slate-500 text-sm font-bold">
                    <RotateCcw size={14} /> Restart
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="w-52 bg-slate-800 p-4 rounded-xl border border-slate-600 space-y-4">
          <div className="flex items-center gap-2 text-slate-400 font-semibold text-sm"><Settings size={14} /> Config</div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Target intensity</label>
            <input type="range" min="0.1" max="1" step="0.1" value={intensity} onChange={(e) => setIntensity(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
          </div>
          <p className="text-slate-400 text-sm">SPACE: Pause. Arrows: Lanes. Speed: {displaySpeed}</p>
        </div>
      </div>
    </div>
  );
}
