import React, { useState, useEffect, useRef } from 'react';
import { Car, AlertTriangle, Settings, Play, MoveDown, Maximize, Minimize, Pause, RotateCcw } from 'lucide-react';

// INTERNAL RESOLUTION (Fixed for Physics)
const INTERNAL_WIDTH = 400;
const INTERNAL_HEIGHT = 600;

// GAME CONFIGURATION (Relative to Internal Resolution)
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
  const canvasRef = useRef(null);
  const containerRef = useRef(null); 
  
  const [gameState, setGameState] = useState('START'); 
  const [score, setScore] = useState(0);
  const [displaySpeed, setDisplaySpeed] = useState(1); 
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const [currentLane, setCurrentLane] = useState(1);
  const [redIntensity, setRedIntensity] = useState(1.0); 

  const requestRef = useRef();
  const lastTimeRef = useRef(0); 
  const scoreRef = useRef(0);
  const speedRef = useRef(INITIAL_SPEED);
  const obstaclesRef = useRef([]);
  const laneOffsetRef = useRef(0); 
  const currentLaneRef = useRef(1);

  const getLaneCenter = (laneIndex) => {
    return (laneIndex * LANE_WIDTH) + (LANE_WIDTH / 2) - (CAR_WIDTH / 2);
  };

  // FULL SCREEN LOGIC
  const toggleFullScreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullScreen(true);
      } catch (err) {
        console.error("Error attempting to enable full-screen mode:", err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // CONTROLS
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault(); 
        setGameState(prev => {
          if (prev === 'PLAYING') return 'PAUSED';
          if (prev === 'PAUSED') {
             lastTimeRef.current = performance.now();
             return 'PLAYING';
          }
          return prev;
        });
        return;
      }

      if (gameState !== 'PLAYING') return;
      
      if (e.key === 'ArrowLeft') {
        if (currentLaneRef.current > 0) {
          const newLane = currentLaneRef.current - 1;
          currentLaneRef.current = newLane;
          setCurrentLane(newLane);
        }
      } else if (e.key === 'ArrowRight') {
        if (currentLaneRef.current < LANE_COUNT - 1) {
          const newLane = currentLaneRef.current + 1;
          currentLaneRef.current = newLane;
          setCurrentLane(newLane);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // MAIN GAME LOOP (Time-Based)
  const updateGame = (time) => {
    if (gameState !== 'PLAYING') return;

    const deltaTime = (time - lastTimeRef.current) / 1000;
    lastTimeRef.current = time;

    if (deltaTime > 0.1) {
      requestRef.current = requestAnimationFrame(updateGame);
      return;
    }

    const moveDistance = speedRef.current * deltaTime;

    // 1. Animate Lanes
    laneOffsetRef.current = (laneOffsetRef.current - moveDistance) % 80;

    // 2. Move Obstacles
    obstaclesRef.current.forEach(obs => {
      obs.y += moveDistance;
    });

    // 3. Cleanup & Scoring
    if (obstaclesRef.current.length > 0 && obstaclesRef.current[0].y > INTERNAL_HEIGHT) {
      obstaclesRef.current.shift();
      scoreRef.current += 10;
      setScore(scoreRef.current);
      
      if (scoreRef.current % 100 === 0 && speedRef.current < MAX_SPEED) {
        speedRef.current += SPEED_INCREMENT;
        setDisplaySpeed(Math.floor(speedRef.current / 50)); 
      }
    }

    // 4. Spawn Obstacles
    const lastObs = obstaclesRef.current[obstaclesRef.current.length - 1];
    const minGap = 250 + (speedRef.current * 0.2); 

    if (!lastObs || lastObs.y > minGap) { 
      if (Math.random() < 0.05) { 
        const lane = Math.floor(Math.random() * LANE_COUNT); 
        const obsX = (lane * LANE_WIDTH) + (LANE_WIDTH / 2) - (OBSTACLE_WIDTH / 2);
        obstaclesRef.current.push({ 
          x: obsX, 
          y: -100, 
          width: OBSTACLE_WIDTH, 
          height: OBSTACLE_HEIGHT,
        });
      }
    }

    // 5. Collision Detection
    const playerX = getLaneCenter(currentLaneRef.current);
    const playerRect = { x: playerX + 10, y: INTERNAL_HEIGHT - 110, w: CAR_WIDTH - 20, h: CAR_HEIGHT - 20 };
    
    for (let i = 0; i < obstaclesRef.current.length; i++) {
      const obs = obstaclesRef.current[i];
      const obsRect = { x: obs.x + 5, y: obs.y + 5, w: obs.width - 10, h: obs.height - 10 };

      if (
        playerRect.x < obsRect.x + obsRect.w &&
        playerRect.x + playerRect.w > obsRect.x &&
        playerRect.y < obsRect.y + obsRect.h &&
        playerRect.y + playerRect.h > obsRect.y
      ) {
        // --- CRASH LOGIC ---
        setGameState('GAMEOVER');
        
        // Remove THIS specific obstacle so we don't hit it again immediately on resume
        obstaclesRef.current.splice(i, 1);
        
        cancelAnimationFrame(requestRef.current);
        return; 
      }
    }

    draw();
    requestRef.current = requestAnimationFrame(updateGame);
  };

  // DRAW FUNCTION
  const draw = () => {
    const ctx = canvasRef.current.getContext('2d');
    
    // Clear
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

    // --- DRAW LANES (Blue - Right Eye) ---
    ctx.strokeStyle = '#0000FF'; 
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

    // --- DRAW PLAYER (Red - Left Eye) ---
    const pX = getLaneCenter(currentLaneRef.current);
    const pY = INTERNAL_HEIGHT - 120;
    
    ctx.fillStyle = `rgba(255, 0, 0, ${redIntensity})`;
    ctx.fillRect(pX, pY, CAR_WIDTH, CAR_HEIGHT);
    // Shading
    ctx.fillStyle = `rgba(0, 0, 0, 0.3)`;
    ctx.fillRect(pX + 5, pY + 10, CAR_WIDTH - 10, 15); 
    ctx.fillRect(pX + 5, pY + 50, CAR_WIDTH - 10, 10); 

    // --- DRAW OBSTACLES (Red - Left Eye) ---
    obstaclesRef.current.forEach(obs => {
      ctx.fillStyle = `rgba(255, 0, 0, ${redIntensity})`;
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      ctx.strokeStyle = `rgba(100, 0, 0, ${redIntensity})`;
      ctx.lineWidth = 3;
      ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
    });
  };

  // Resets Everything (For 'Start' or manual 'Restart')
  const resetGame = () => {
    scoreRef.current = 0;
    speedRef.current = INITIAL_SPEED;
    obstaclesRef.current = [];
    currentLaneRef.current = 1;
    laneOffsetRef.current = 0;
    lastTimeRef.current = performance.now(); 
    
    setScore(0);
    setDisplaySpeed(1);
    setCurrentLane(1);
    setGameState('PLAYING');
    
    requestRef.current = requestAnimationFrame(updateGame);
  };

  // Just continues the loop (For 'Resume' after crash)
  const resumeGame = () => {
    lastTimeRef.current = performance.now(); // Reset time delta so we don't jump
    setGameState('PLAYING');
    requestRef.current = requestAnimationFrame(updateGame);
  };

  useEffect(() => {
    if (gameState === 'PLAYING') {
      lastTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(updateGame);
    } else {
      draw(); 
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, redIntensity, currentLane]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 font-sans text-white p-4">
      
      {!isFullScreen && (
        <div className="flex items-center gap-3 mb-6">
          <Car className="text-red-600 w-8 h-8" />
          <h1 className="text-3xl font-bold tracking-tighter">
            <span className="text-red-600">RED</span> RACER <span className="text-blue-600 text-sm opacity-50">(RESPONSIVE)</span>
          </h1>
        </div>
      )}

      <div className="flex gap-8 items-start justify-center w-full">
        
        {/* GAME CONTAINER */}
        <div 
          ref={containerRef}
          className={`relative bg-neutral-950 flex items-center justify-center transition-all duration-300 ${
            isFullScreen 
              ? 'fixed inset-0 w-screen h-screen z-50' 
              : 'border-4 border-gray-800 rounded-lg shadow-[0_0_50px_rgba(255,0,0,0.2)]'
          }`}
        >
          <button 
            onClick={toggleFullScreen}
            className="absolute top-4 right-4 p-2 bg-gray-800/50 hover:bg-gray-700 rounded-full text-white z-50 transition hover:scale-110"
            title="Toggle Fullscreen"
          >
            {isFullScreen ? <Minimize size={24} /> : <Maximize size={24} />}
          </button>

          <canvas
            ref={canvasRef}
            width={INTERNAL_WIDTH}
            height={INTERNAL_HEIGHT}
            className={`bg-black block shadow-2xl transition-all duration-300 ${
              isFullScreen 
                ? 'max-h-screen max-w-full aspect-[2/3]' 
                : 'rounded' 
            }`}
          />

          {/* OVERLAY: Centered within the container */}
          {gameState !== 'PLAYING' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-40 backdrop-blur-sm">
              
              {gameState === 'GAMEOVER' && (
                <div className="text-center mb-6 animate-pulse">
                  <AlertTriangle className="mx-auto text-red-500 w-16 h-16 mb-2" />
                  <h2 className="text-4xl font-black text-white">CRASHED!</h2>
                  <p className="text-xl text-red-400">Score: {score}</p>
                </div>
              )}

              {gameState === 'PAUSED' && (
                <div className="text-center mb-6">
                  <Pause className="mx-auto text-blue-500 w-16 h-16 mb-2" />
                  <h2 className="text-4xl font-black text-white">PAUSED</h2>
                </div>
              )}
              
              <div className="flex flex-col gap-3">
                {/* PRIMARY ACTION: Resume or Start */}
                <button
                  onClick={() => {
                      if (gameState === 'GAMEOVER' || gameState === 'PAUSED') {
                          resumeGame();
                      } else {
                          resetGame();
                      }
                  }}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full text-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  <Play fill="currentColor" />
                  {gameState === 'START' ? 'START ENGINE' : 'CONTINUE'}
                </button>

                {/* SECONDARY ACTION: Restart (Only visible if crashed/paused) */}
                {(gameState === 'GAMEOVER' || gameState === 'PAUSED') && (
                    <button
                        onClick={resetGame}
                        className="flex items-center justify-center gap-2 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold rounded-full text-sm transition-colors"
                    >
                        <RotateCcw size={16} />
                        Restart from 0
                    </button>
                )}
              </div>

            </div>
          )}

          <div className="absolute top-4 left-4 text-white font-mono font-bold text-xl drop-shadow-md z-30 pointer-events-none">
            SCORE: {score}
          </div>
        </div>

        {/* CONTROLS SIDEBAR (Hidden in Fullscreen) */}
        {!isFullScreen && (
          <div className="w-64 bg-neutral-800 p-6 rounded-xl border border-neutral-700 h-[600px] flex flex-col">
            <div className="flex items-center gap-2 mb-6 text-gray-400 uppercase text-xs font-bold tracking-widest">
              <Settings size={14} />
              Therapy Configuration
            </div>

            <div className="space-y-8 flex-1">
              <div>
                <label className="block text-sm font-medium text-red-400 mb-2">
                  Left Eye Challenge
                </label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1.0" 
                  step="0.1"
                  value={redIntensity}
                  onChange={(e) => setRedIntensity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Dim</span>
                  <span>Bright</span>
                </div>
              </div>

              <div className="bg-black/30 p-4 rounded text-sm text-gray-400 space-y-2">
                <p>Press <strong>SPACE</strong> to Pause.</p>
                <p>Use <strong>Arrow Keys</strong> to Swap Lanes.</p>
                <p className="text-yellow-500 text-xs mt-2">Speed Level: {displaySpeed}</p>
              </div>
            </div>
            
             <div className="text-center text-xs text-gray-500 mt-auto">
               <MoveDown className="mx-auto mb-1 opacity-50" />
               Arrow Keys to Move
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DichopticRacing;