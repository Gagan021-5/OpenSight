import React, { useState, useEffect, useRef } from 'react';
import { Ship, AlertTriangle, Settings, Play, MoveDown, Maximize, Minimize, Pause } from 'lucide-react';

// INTERNAL RESOLUTION (Fixed for Physics)
const INTERNAL_WIDTH = 400;
const INTERNAL_HEIGHT = 600;

// GAME CONFIGURATION
const BOAT_WIDTH = 60; 
const BOAT_HEIGHT = 90;
const OBSTACLE_WIDTH = 60;
const OBSTACLE_HEIGHT = 60;
const LANE_COUNT = 3;
const LANE_WIDTH = INTERNAL_WIDTH / LANE_COUNT;

// SPEED SETTINGS
const INITIAL_SPEED = 250; // Vertical speed of obstacles
const MAX_SPEED = 700; 
const SPEED_INCREMENT = 25;
const WAVE_SPEED_X = 150; // Horizontal speed of the background waves

const DichopticSea = () => {
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
  // Tracks horizontal movement for waves
  const waveHorizontalOffsetRef = useRef(0); 
  const currentLaneRef = useRef(1);

  const getLaneCenter = (laneIndex) => {
    return (laneIndex * LANE_WIDTH) + (LANE_WIDTH / 2) - (BOAT_WIDTH / 2);
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

    // Calculate distances for this frame
    const verticalMoveDistance = speedRef.current * deltaTime;
    const horizontalWaveDistance = WAVE_SPEED_X * deltaTime;

    // 1. Animate Horizontal Waves
    // We wrap around a 200px pattern width to keep numbers small
    waveHorizontalOffsetRef.current = (waveHorizontalOffsetRef.current + horizontalWaveDistance) % 200;

    // 2. Move Obstacles Vertically
    obstaclesRef.current.forEach(obs => {
      obs.y += verticalMoveDistance;
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
    const minGap = 280 + (speedRef.current * 0.25); 

    if (!lastObs || lastObs.y > minGap) { 
      if (Math.random() < 0.05) { 
        const lane = Math.floor(Math.random() * LANE_COUNT); 
        const obsX = (lane * LANE_WIDTH) + (LANE_WIDTH / 2) - (OBSTACLE_WIDTH / 2);
        const type = Math.random() > 0.5 ? 'SHARK' : 'WHALE';
        
        obstaclesRef.current.push({ 
          x: obsX, 
          y: -100, 
          width: OBSTACLE_WIDTH, 
          height: OBSTACLE_HEIGHT,
          type: type
        });
      }
    }

    // 5. Collision Detection
    const playerX = getLaneCenter(currentLaneRef.current);
    const playerRect = { x: playerX + 15, y: INTERNAL_HEIGHT - 130, w: BOAT_WIDTH - 30, h: BOAT_HEIGHT - 20 };
    
    for (let obs of obstaclesRef.current) {
      const obsRect = { x: obs.x + 10, y: obs.y + 10, w: obs.width - 20, h: obs.height - 20 };

      if (
        playerRect.x < obsRect.x + obsRect.w &&
        playerRect.x + playerRect.w > obsRect.x &&
        playerRect.y < obsRect.y + obsRect.h &&
        playerRect.y + playerRect.h > obsRect.y
      ) {
        setGameState('GAMEOVER');
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
    
    // Clear (Black Background)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

    // --- DRAW HORIZONTAL SEA WAVES (Blue - Right Eye) ---
    ctx.strokeStyle = '#0000FF'; // Pure Blue
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7; // Slightly transparent waves look nice

    // Wave parameters
    const waveHeight = 10; // Peak-to-trough height
    const waveLength = 100; // Length of one wave cycle
    const spacingY = 40;   // Vertical space between wave lines

    // Calculate current horizontal shift based on animation loop
    // We shift left to simulate moving right
    const shiftX = -waveHorizontalOffsetRef.current;

    ctx.beginPath();
    // Loop from top to bottom of screen to draw multiple wave lines
    // Start slightly off-screen (y = -spacingY) to ensure top is covered
    for (let y = -spacingY; y < INTERNAL_HEIGHT + spacingY; y += spacingY) {
        ctx.moveTo(shiftX - waveLength, y); // Move to start point off-screen left

        // Draw repeating wave segments across the screen using Bezier curves
        // We draw enough segments to cover the width plus the animation buffers
        for (let x = shiftX - waveLength; x < INTERNAL_WIDTH + waveLength * 2; x += waveLength) {
            ctx.bezierCurveTo(
                x + waveLength / 4, y - waveHeight, // Control point 1 (Peak)
                x + waveLength * 3 / 4, y + waveHeight, // Control point 2 (Trough)
                x + waveLength, y // End point
            );
        }
    }
    ctx.stroke();
    ctx.globalAlpha = 1.0; // Reset alpha for other elements

    // --- DRAW BOAT (Red - Left Eye) ---
    const pX = getLaneCenter(currentLaneRef.current);
    const pY = INTERNAL_HEIGHT - 140;
    
    ctx.fillStyle = `rgba(255, 0, 0, ${redIntensity})`;
    
    // Hull
    ctx.beginPath();
    ctx.moveTo(pX, pY);
    ctx.lineTo(pX + BOAT_WIDTH, pY);
    ctx.lineTo(pX + BOAT_WIDTH - 10, pY + BOAT_HEIGHT);
    ctx.lineTo(pX + 10, pY + BOAT_HEIGHT);
    ctx.closePath();
    ctx.fill();

    // Mast
    ctx.fillStyle = `rgba(150, 0, 0, ${redIntensity})`;
    ctx.fillRect(pX + BOAT_WIDTH/2 - 3, pY - 30, 6, 30);
    
    // Sail
    ctx.beginPath();
    ctx.moveTo(pX + BOAT_WIDTH/2, pY - 30);
    ctx.lineTo(pX + BOAT_WIDTH, pY);
    ctx.lineTo(pX + BOAT_WIDTH/2, pY);
    ctx.fill();

    // --- DRAW OBSTACLES (Red - Left Eye) ---
    obstaclesRef.current.forEach(obs => {
      ctx.fillStyle = `rgba(255, 0, 0, ${redIntensity})`;
      
      if (obs.type === 'SHARK') {
        // Shark Fin
        ctx.beginPath();
        ctx.moveTo(obs.x + 10, obs.y + obs.height);
        ctx.lineTo(obs.x + obs.width/2, obs.y);
        ctx.lineTo(obs.x + obs.width - 10, obs.y + obs.height);
        ctx.fill();
        // Water cut line
        ctx.strokeStyle = `rgba(100, 0, 0, ${redIntensity})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y + obs.height);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
        ctx.stroke();

      } else {
        // Whale
        ctx.beginPath();
        ctx.ellipse(obs.x + obs.width/2, obs.y + obs.height/2, obs.width/2, obs.height/3, 0, 0, 2 * Math.PI);
        ctx.fill();
        // Spout
        ctx.fillStyle = `rgba(100, 0, 0, ${redIntensity})`;
        ctx.beginPath();
        ctx.arc(obs.x + obs.width/2, obs.y + 15, 4, 0, 2*Math.PI);
        ctx.fill();
      }
    });
  };

  const startGame = () => {
    scoreRef.current = 0;
    speedRef.current = INITIAL_SPEED;
    obstaclesRef.current = [];
    currentLaneRef.current = 1;
    waveHorizontalOffsetRef.current = 0;
    lastTimeRef.current = performance.now(); 
    
    setScore(0);
    setDisplaySpeed(1);
    setCurrentLane(1);
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
          <Ship className="text-red-600 w-8 h-8" />
          <h1 className="text-3xl font-bold tracking-tighter">
            <span className="text-red-600">RED</span> VOYAGE <span className="text-blue-600 text-sm opacity-50">(SEA MODE)</span>
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

          {/* OVERLAY */}
          {gameState !== 'PLAYING' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-40 backdrop-blur-sm">
              
              {gameState === 'GAMEOVER' && (
                <div className="text-center mb-6 animate-pulse">
                  <AlertTriangle className="mx-auto text-red-500 w-16 h-16 mb-2" />
                  <h2 className="text-4xl font-black text-white">CAPSIZED!</h2>
                  <p className="text-xl text-red-400">Score: {score}</p>
                </div>
              )}

              {gameState === 'PAUSED' && (
                <div className="text-center mb-6">
                  <Pause className="mx-auto text-blue-500 w-16 h-16 mb-2" />
                  <h2 className="text-4xl font-black text-white">PAUSED</h2>
                </div>
              )}
              
              <button
                onClick={() => gameState === 'PAUSED' ? setGameState('PLAYING') : startGame()}
                className="flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full text-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                <Play fill="currentColor" />
                {gameState === 'START' ? 'SET SAIL' : (gameState === 'PAUSED' ? 'RESUME' : 'RETRY')}
              </button>
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
                <p><strong>Blue Waves:</strong> Visible to Right Eye.</p>
                <p><strong>Red Boat & Obstacles:</strong> Visible to Left Eye.</p>
                <p className="text-yellow-500 text-xs mt-2">Knots: {displaySpeed}</p>
              </div>
            </div>
            
             <div className="text-center text-xs text-gray-500 mt-auto">
               <MoveDown className="mx-auto mb-1 opacity-50" />
               Arrow Keys to Steer
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DichopticSea;