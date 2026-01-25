import React, { useState, useEffect, useRef } from 'react';
import { Ship, AlertTriangle, Settings, Play, Pause, MoveDown, Maximize, Minimize, RotateCcw } from 'lucide-react';
import useTherapyColors from '../hooks/useTherapyColors.js';
import { useGlobal } from '../context/GlobalContext.jsx';

const INTERNAL_WIDTH = 400;
const INTERNAL_HEIGHT = 600;
const BOAT_W = 60, BOAT_H = 90;
const OBS_W = 60, OBS_H = 60;
const LANES = 3;
const LANE_W = INTERNAL_WIDTH / LANES;
const INITIAL_SPEED = 250;
const MAX_SPEED = 700;
const SPEED_INC = 25;
const WAVE_X = 150;

export default function DichopticSea({ onGameEnd }) {
  const { weakEye } = useGlobal();
  const [intensity, setIntensity] = useState(1.0);
  const colors = useTherapyColors(weakEye, intensity);
  const getSolidColor = () => weakEye === 'left' ? '#FF0000' : '#0000FF';

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [gameState, setGameState] = useState('START');
  const [score, setScore] = useState(0);
  const [displaySpeed, setDisplaySpeed] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const rAf = useRef();
  const lastT = useRef(0);
  const scoreR = useRef(0);
  const speedR = useRef(INITIAL_SPEED);
  const obsR = useRef([]);
  const waveX = useRef(0);
  const laneCurR = useRef(1);
  const startTimeRef = useRef(null);

  const getLaneCenter = (lane) => lane * LANE_W + LANE_W / 2 - BOAT_W / 2;

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

  const startGame = () => {
    scoreR.current = 0;
    speedR.current = INITIAL_SPEED;
    obsR.current = [];
    laneCurR.current = 1;
    waveX.current = 0;
    lastT.current = performance.now();
    startTimeRef.current = Date.now();
    setScore(0);
    setDisplaySpeed(1);
    setGameState('PLAYING');
    rAf.current = requestAnimationFrame(update);
  };

  const update = (time) => {
    if (gameState !== 'PLAYING') return;
    const dt = Math.min((time - lastT.current) / 1000, 0.1);
    lastT.current = time;

    waveX.current = (waveX.current + WAVE_X * dt) % 200;
    obsR.current.forEach(o => o.y += speedR.current * dt);

    if (obsR.current[0]?.y > INTERNAL_HEIGHT) {
      obsR.current.shift();
      scoreR.current += 10;
      setScore(scoreR.current);
      if (scoreR.current % 100 === 0 && speedR.current < MAX_SPEED) {
        speedR.current += SPEED_INC;
        setDisplaySpeed(Math.floor(speedR.current / 50));
      }
    }

    const last = obsR.current[obsR.current.length - 1];
    const gap = 280 + speedR.current * 0.25;
    if (!last || last.y > gap) {
      if (Math.random() < 0.05) {
        const L = Math.floor(Math.random() * LANES);
        obsR.current.push({ x: L * LANE_W + LANE_W/2 - OBS_W/2, y: -100 });
      }
    }

    const pX = getLaneCenter(laneCurR.current) + 15;
    const pY = INTERNAL_HEIGHT - 130;
    const pW = BOAT_W - 30;
    const pH = BOAT_H - 20;

    for (const o of obsR.current) {
      if (pX < o.x + 10 + (OBS_W - 20) && pX + pW > o.x + 10 && 
          pY < o.y + 10 + (OBS_H - 20) && pY + pH > o.y + 10) {
        setGameState('GAMEOVER');
        if (onGameEnd && startTimeRef.current) 
          onGameEnd(scoreR.current, (Date.now() - startTimeRef.current) / 1000);
        cancelAnimationFrame(rAf.current);
        return;
      }
    }
    draw();
    rAf.current = requestAnimationFrame(update);
  };

  const draw = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

    ctx.strokeStyle = colors.lock;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5;
    const shiftX = -waveX.current;
    const waveH = 10, waveL = 100, spaceY = 40;
    ctx.beginPath();
    for (let y = -spaceY; y < INTERNAL_HEIGHT + spaceY; y += spaceY) {
      ctx.moveTo(shiftX - waveL, y);
      for (let x = shiftX - waveL; x < INTERNAL_WIDTH + waveL * 2; x += waveL) {
        ctx.bezierCurveTo(x + waveL/4, y - waveH, x + waveL*3/4, y + waveH, x + waveL, y);
      }
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    const pX = getLaneCenter(laneCurR.current);
    const pY = INTERNAL_HEIGHT - 140;
    ctx.fillStyle = getSolidColor();
    ctx.beginPath();
    ctx.moveTo(pX, pY);
    ctx.lineTo(pX + BOAT_W, pY);
    ctx.lineTo(pX + BOAT_W - 10, pY + BOAT_H);
    ctx.lineTo(pX + 10, pY + BOAT_H);
    ctx.fill();

    obsR.current.forEach(o => {
      ctx.fillStyle = colors.target; 
      ctx.fillRect(o.x + 10, o.y + 10, OBS_W - 20, OBS_H - 20);
    });
  };

  useEffect(() => {
    const h = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setGameState(p => p === 'PLAYING' ? 'PAUSED' : p === 'PAUSED' ? 'PLAYING' : p);
        if (gameState === 'PAUSED') lastT.current = performance.now();
      }
      if (gameState !== 'PLAYING') return;
      if (e.key === 'ArrowLeft' && laneCurR.current > 0) laneCurR.current--;
      if (e.key === 'ArrowRight' && laneCurR.current < LANES - 1) laneCurR.current++;
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
  }, [gameState, colors, intensity]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 font-sans text-white p-4">
      {!isFullScreen && (
        <div className="flex items-center gap-3 mb-6">
          <Ship className="w-8 h-8" style={{ color: getSolidColor() }} />
          <h1 className="text-3xl font-bold tracking-tighter">
            <span style={{ color: getSolidColor() }}>RED</span> SEA <span className="text-blue-500 text-sm opacity-50 hidden sm:inline">(DICHOPTIC)</span>
          </h1>
        </div>
      )}

      {/* RESPONSIVE LAYOUT WRAPPER: Flex Column on Mobile, Row on Large Screens */}
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full max-w-6xl">
        
        {/* Game Area */}
        <div ref={containerRef} className={`relative w-full lg:flex-1 bg-neutral-950 flex items-center justify-center transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50' : 'border-4 border-neutral-800 rounded-lg shadow-2xl aspect-[2/3] lg:aspect-auto lg:h-[600px]'}`}>
          <button onClick={toggleFullScreen} className="absolute top-4 right-4 p-2 bg-gray-800/50 hover:bg-gray-700 rounded-full text-white z-50 transition">
            {isFullScreen ? <Minimize size={24} /> : <Maximize size={24} />}
          </button>
          
          <canvas 
            ref={canvasRef} 
            width={INTERNAL_WIDTH} 
            height={INTERNAL_HEIGHT} 
            className={`block shadow-2xl ${isFullScreen ? 'max-h-screen max-w-full object-contain' : 'w-full h-full object-contain'}`} 
            style={{ backgroundColor: '#000' }} 
          />
          
          {gameState !== 'PLAYING' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-40 backdrop-blur-sm">
              {gameState === 'GAMEOVER' && <div className="text-center mb-6"><AlertTriangle className="mx-auto w-16 h-16 mb-2" style={{ color: getSolidColor() }} /><h2 className="text-4xl font-black">CAPSIZED!</h2><p className="text-xl">Score: {score}</p></div>}
              {gameState === 'PAUSED' && <div className="text-center mb-6"><Pause className="mx-auto w-16 h-16 mb-2 text-blue-500" /><h2 className="text-4xl font-black">PAUSED</h2></div>}
              <button onClick={() => (gameState === 'GAMEOVER' || gameState === 'PAUSED') ? (gameState === 'PAUSED' ? setGameState('PLAYING') : startGame()) : startGame()} className="flex items-center gap-2 px-8 py-4 text-white font-bold rounded-full text-xl shadow-lg transition hover:scale-105" style={{ backgroundColor: getSolidColor() }}><Play fill="currentColor" /> {gameState === 'START' ? 'SET SAIL' : 'CONTINUE'}</button>
              {(gameState === 'GAMEOVER' || gameState === 'PAUSED') && <button onClick={startGame} className="mt-4 flex items-center gap-2 px-6 py-2 bg-neutral-700 hover:bg-neutral-600 text-gray-300 font-bold rounded-full text-sm"><RotateCcw size={16} /> Restart</button>}
            </div>
          )}
          <div className="absolute top-4 left-4 text-white font-mono font-bold text-xl drop-shadow-md z-30">SCORE: {score}</div>
        </div>

        {/* Sidebar - Stacks below on mobile */}
        {!isFullScreen && (
          <div className="w-full lg:w-80 bg-neutral-800 p-6 rounded-xl border border-neutral-700 h-auto lg:h-[600px] flex flex-col">
            <div className="flex items-center gap-2 mb-6 text-gray-400 uppercase text-xs font-bold tracking-widest"><Settings size={14} /> Therapy Config</div>
            <div className="space-y-8 flex-1">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: getSolidColor() }}>Obstacle Opacity</label>
                <input type="range" min="0.1" max="1.0" step="0.1" value={intensity} onChange={(e) => setIntensity(parseFloat(e.target.value))} className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer" style={{ accentColor: getSolidColor() }} />
                <div className="flex justify-between text-xs text-gray-500 mt-2"><span>Ghost</span><span>Solid</span></div>
              </div>
              <div className="bg-black/30 p-4 rounded text-sm text-gray-400 space-y-2">
                <p>Press <strong>SPACE</strong> to Pause.</p>
                <p>Use <strong>Arrow Keys</strong> to Steer.</p>
                <p className="text-yellow-500 text-xs mt-2">Speed: {displaySpeed}</p>
                <p className="text-xs mt-4 pt-4 border-t border-gray-700">
                    <span style={{ color: getSolidColor() }}>■ Boat</span>: Solid<br/>
                    <span style={{ color: colors.target }}>■ Obstacles</span>: Faded
                </p>
              </div>
            </div>
            {/* Mobile Controls Hint */}
            <div className="lg:hidden text-center mt-6 p-4 bg-neutral-700/50 rounded-lg">
               <p className="text-sm font-bold text-white">Tap Left/Right side of screen to move</p>
            </div>
            <div className="hidden lg:block text-center text-xs text-gray-500 mt-auto"><MoveDown className="mx-auto mb-1 opacity-50" />Arrow Keys to Move</div>
          </div>
        )}
      </div>
    </div>
  );
}