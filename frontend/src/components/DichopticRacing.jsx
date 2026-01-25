import React, { useState, useEffect, useRef } from 'react';
import { Car, Settings, Play, MoveDown, Maximize, Minimize, Pause, RotateCcw } from 'lucide-react';
import useTherapyColors from '../hooks/useTherapyColors.js';
import { useGlobal } from '../context/GlobalContext.jsx';
import GameSummary from './GameSummary.jsx';
import { saveGameSession } from '../utils/scoreTracker.js';

// INTERNAL RESOLUTION (Fixed for Physics)
const INTERNAL_WIDTH = 400;
const INTERNAL_HEIGHT = 600;

// GAME CONFIGURATION
const CAR_WIDTH = 50; 
const CAR_HEIGHT = 80;
const OBSTACLE_WIDTH = 50;
const OBSTACLE_HEIGHT = 50;
const LANE_COUNT = 3;
const LANE_WIDTH = INTERNAL_WIDTH / LANE_COUNT;

// SPEED SETTINGS
const INITIAL_SPEED = 300; 
const MAX_SPEED = 800; 
const SPEED_INCREMENT = 20; 

const DichopticRacing = () => {
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
  const [showSummary, setShowSummary] = useState(false);

  // Timer & Pause Refs
  const startTimeRef = useRef(null);
  const totalPausedTimeRef = useRef(0);
  const pauseStartRef = useRef(null);

  const requestRef = useRef();
  const lastTimeRef = useRef(0); 
  const scoreRef = useRef(0);
  const speedRef = useRef(INITIAL_SPEED);
  const obstaclesRef = useRef([]);
  const laneOffsetRef = useRef(0); 
  const currentLaneRef = useRef(1);

  const getLaneCenter = (laneIndex) => (laneIndex * LANE_WIDTH) + (LANE_WIDTH / 2) - (CAR_WIDTH / 2);
  const getObstacleX = (laneIndex) => (laneIndex * LANE_WIDTH) + (LANE_WIDTH / 2) - (OBSTACLE_WIDTH / 2);

  const toggleFullScreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen().catch(err => console.error(err));
      setIsFullScreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    const handleFs = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFs);
    return () => document.removeEventListener('fullscreenchange', handleFs);
  }, []);

  // --- CONTROLS (Keyboard + Touch) ---
  const moveLeft = () => { if (currentLaneRef.current > 0) currentLaneRef.current -= 1; };
  const moveRight = () => { if (currentLaneRef.current < LANE_COUNT - 1) currentLaneRef.current += 1; };

  const handleTouch = (e) => {
    if (gameState !== 'PLAYING') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const relativeX = x - rect.left;
    if (relativeX < rect.width / 2) moveLeft();
    else moveRight();
  };

  const handlePause = () => {
    setGameState(prev => {
      if (prev === 'PLAYING') {
        pauseStartRef.current = Date.now();
        return 'PAUSED';
      }
      if (prev === 'PAUSED') {
        if (pauseStartRef.current) {
          totalPausedTimeRef.current += (Date.now() - pauseStartRef.current);
        }
        lastTimeRef.current = performance.now();
        return 'PLAYING';
      }
      return prev;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') { e.preventDefault(); handlePause(); return; }
      if (gameState !== 'PLAYING') return;
      if (e.key === 'ArrowLeft') moveLeft();
      else if (e.key === 'ArrowRight') moveRight();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const updateGame = (time) => {
    if (gameState !== 'PLAYING') return;

    const deltaTime = (time - lastTimeRef.current) / 1000;
    lastTimeRef.current = time;

    const moveDistance = speedRef.current * deltaTime;
    laneOffsetRef.current = (laneOffsetRef.current - moveDistance) % 80;
    obstaclesRef.current.forEach(obs => { obs.y += moveDistance; });

    if (obstaclesRef.current.length > 0 && obstaclesRef.current[0].y > INTERNAL_HEIGHT) {
      obstaclesRef.current.shift();
      scoreRef.current += 10;
      setScore(scoreRef.current);
      if (scoreRef.current % 100 === 0 && speedRef.current < MAX_SPEED) {
        speedRef.current += SPEED_INCREMENT;
        setDisplaySpeed(Math.floor(speedRef.current / 50)); 
      }
    }

    const lastObs = obstaclesRef.current[obstaclesRef.current.length - 1];
    if (!lastObs || lastObs.y > (250 + speedRef.current * 0.2)) { 
      if (Math.random() < 0.05) { 
        const lane = Math.floor(Math.random() * LANE_COUNT); 
        obstaclesRef.current.push({ x: getObstacleX(lane), y: -100, width: OBSTACLE_WIDTH, height: OBSTACLE_HEIGHT });
      }
    }

    const pX = getLaneCenter(currentLaneRef.current);
    const pY = INTERNAL_HEIGHT - 120;
    const pRect = { x: pX + 10, y: pY + 10, w: CAR_WIDTH - 20, h: CAR_HEIGHT - 20 };
    
    for (let i = 0; i < obstaclesRef.current.length; i++) {
      const obs = obstaclesRef.current[i];
      const oRect = { x: obs.x + 5, y: obs.y + 5, w: obs.width - 10, h: obs.height - 10 };
      if (pRect.x < oRect.x + oRect.w && pRect.x + pRect.w > oRect.x && pRect.y < oRect.y + oRect.h && pRect.y + pRect.h > oRect.y) {
        const finalDuration = startTimeRef.current 
          ? Math.floor((Date.now() - startTimeRef.current - totalPausedTimeRef.current) / 1000) 
          : 0;
        
        saveGameSession('dichoptic-racing', scoreRef.current, finalDuration);
        setGameState('GAMEOVER');
        setShowSummary(true);
        cancelAnimationFrame(requestRef.current);
        return; 
      }
    }
    draw();
    requestRef.current = requestAnimationFrame(updateGame);
  };

  const draw = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if(!ctx) return;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
    ctx.fillStyle = '#0a0a0a'; 
    ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

    ctx.strokeStyle = colors.lock; 
    ctx.lineWidth = 4;
    ctx.setLineDash([40, 40]); 
    ctx.lineDashOffset = laneOffsetRef.current;
    for (let i = 1; i < LANE_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(LANE_WIDTH * i, -50);
        ctx.lineTo(LANE_WIDTH * i, INTERNAL_HEIGHT + 50);
        ctx.stroke();
    }
    ctx.setLineDash([]); 

    ctx.fillStyle = getSolidColor(); 
    ctx.fillRect(getLaneCenter(currentLaneRef.current), INTERNAL_HEIGHT - 120, CAR_WIDTH, CAR_HEIGHT);
    
    obstaclesRef.current.forEach(obs => {
      ctx.fillStyle = colors.target; 
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });
  };

  useEffect(() => {
    if (gameState === 'PLAYING') {
      lastTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(updateGame);
    } else {
      draw(); 
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, colors, intensity]);

  const resetGame = () => {
    scoreRef.current = 0;
    speedRef.current = INITIAL_SPEED;
    obstaclesRef.current = [];
    currentLaneRef.current = 1;
    totalPausedTimeRef.current = 0;
    startTimeRef.current = Date.now();
    setScore(0);
    setDisplaySpeed(1);
    setShowSummary(false);
    setGameState('PLAYING');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 font-sans text-white p-4">
      {!isFullScreen && (
        <div className="flex items-center gap-3 mb-6">
          <Car className="w-8 h-8" style={{ color: getSolidColor() }} />
          <h1 className="text-3xl font-bold tracking-tighter uppercase">
            <span style={{ color: getSolidColor() }}>{weakEye === 'left' ? 'Red' : 'Blue'}</span> Racer
          </h1>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full max-w-6xl">
        {/* GAME CONTAINER */}
        <div 
          ref={containerRef}
          onClick={handleTouch}
          className={`relative w-full lg:flex-1 bg-neutral-950 flex items-center justify-center transition-all duration-300 ${
            isFullScreen ? 'fixed inset-0 z-50' : 'border-4 border-neutral-800 rounded-lg shadow-2xl aspect-[2/3] lg:aspect-auto lg:h-[600px] lg:w-auto cursor-pointer'
          }`}
        >
          <button onClick={(e) => { e.stopPropagation(); toggleFullScreen(); }} className="absolute top-4 right-4 p-2 bg-gray-800/50 hover:bg-gray-700 rounded-full text-white z-50 transition">
            {isFullScreen ? <Minimize size={24} /> : <Maximize size={24} />}
          </button>

          <canvas ref={canvasRef} width={INTERNAL_WIDTH} height={INTERNAL_HEIGHT} className="block w-full h-full object-contain" />
          
          {gameState !== 'PLAYING' && !showSummary && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-40 backdrop-blur-sm">
              <h2 className="text-4xl font-black mb-6">{gameState === 'PAUSED' ? 'PAUSED' : 'START ENGINE'}</h2>
              <button 
                onClick={(e) => { e.stopPropagation(); gameState === 'START' ? resetGame() : setGameState('PLAYING'); }} 
                className="flex items-center gap-2 px-8 py-4 text-white font-bold rounded-full text-xl shadow-lg transition hover:scale-105"
                style={{ backgroundColor: getSolidColor() }}
              >
                <Play fill="currentColor" /> {gameState === 'START' ? 'START' : 'CONTINUE'}
              </button>
            </div>
          )}
          <div className="absolute top-4 left-4 text-white font-mono font-bold text-xl drop-shadow-md z-30 pointer-events-none">SCORE: {score}</div>
        </div>

        {/* SIDEBAR */}
        {!isFullScreen && (
          <div className="w-full lg:w-80 bg-neutral-800 p-6 rounded-xl border border-neutral-700 h-auto lg:h-[600px] flex flex-col">
            <div className="flex items-center gap-2 mb-6 text-gray-400 uppercase text-xs font-bold tracking-widest">
              <Settings size={14} /> Therapy Config
            </div>
            <div className="space-y-8 flex-1">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: getSolidColor() }}>Obstacle Opacity</label>
                <input type="range" min="0.1" max="1.0" step="0.1" value={intensity} onChange={(e) => setIntensity(parseFloat(e.target.value))} className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer" style={{ accentColor: getSolidColor() }} />
                <div className="flex justify-between text-xs text-gray-500 mt-2"><span>Ghost</span><span>Solid</span></div>
              </div>
              <div className="bg-black/30 p-4 rounded text-sm text-gray-400 space-y-2">
                <p>Press <strong>SPACE</strong> to Pause.</p>
                <p>Use <strong>Arrow Keys</strong> to Swap Lanes.</p>
                <p className="text-yellow-500 text-xs mt-2">Speed Level: {displaySpeed}</p>
              </div>
            </div>
            <div className="lg:hidden text-center mt-6 p-4 bg-neutral-700/50 rounded-lg">
               <p className="text-sm font-bold text-white">Tap Left/Right side of screen to move</p>
            </div>
            <div className="hidden lg:block text-center text-xs text-gray-500 mt-auto"><MoveDown className="mx-auto mb-1 opacity-50" />Arrow Keys to Move</div>
          </div>
        )}
      </div>

      <GameSummary
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        gameId="dichoptic-racing"
        gameTitle="RED RACER"
        score={score}
        duration={startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current - totalPausedTimeRef.current) / 1000) : 0}
        onRestart={resetGame}
        onBackToDashboard={() => window.location.href = '/dashboard'}
      />
    </div>
  );
};
export default DichopticRacing;