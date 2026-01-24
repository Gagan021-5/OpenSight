import React, { useState, useEffect, useRef } from 'react';
import { Eye, Settings, Maximize, Minimize, Pause, Play, AlertCircle } from 'lucide-react';

// GAME CONFIGURATION
const CANVAS_SIZE = 400;
const SCALE = 20; 
const SPEED = 150; 

const DichopticSnake = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null); // Ref for fullscreen

  // GAME STATE
  const [gameState, setGameState] = useState('START'); // START, PLAYING, PAUSED, GAMEOVER
  const [score, setScore] = useState(0);
  const [foodIntensity, setFoodIntensity] = useState(1.0); // 1.0 = Bright, 0.2 = Dim
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [snake, setSnake] = useState([[10, 10]]); 
  const [food, setFood] = useState([15, 15]);
  const [direction, setDirection] = useState([0, -1]); 

  // --- FULL SCREEN LOGIC ---
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

  // --- GAME LOGIC ---
  const startGame = () => {
    setSnake([[10, 10]]);
    setFood([Math.floor(Math.random() * (CANVAS_SIZE / SCALE)), Math.floor(Math.random() * (CANVAS_SIZE / SCALE))]);
    setDirection([0, -1]);
    setScore(0);
    setGameState('PLAYING');
  };

  const endGame = () => {
    setGameState('GAMEOVER');
  };

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 1. Pause Toggle (Spacebar)
      if (e.code === 'Space') {
        e.preventDefault();
        setGameState(prev => {
          if (prev === 'PLAYING') return 'PAUSED';
          if (prev === 'PAUSED') return 'PLAYING';
          return prev;
        });
        return;
      }

      // 2. Prevent scrolling for arrows
      if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
      }
      
      // 3. Movement (Only if playing)
      if (gameState !== 'PLAYING') return;

      switch (e.key) {
        case 'ArrowUp': if (direction[1] !== 1) setDirection([0, -1]); break;
        case 'ArrowDown': if (direction[1] !== -1) setDirection([0, 1]); break;
        case 'ArrowLeft': if (direction[0] !== 1) setDirection([-1, 0]); break;
        case 'ArrowRight': if (direction[0] !== -1) setDirection([1, 0]); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameState]);

  // Game Loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const moveSnake = setInterval(() => {
      setSnake((prevSnake) => {
        const newHead = [prevSnake[0][0] + direction[0], prevSnake[0][1] + direction[1]];

        // Wall Collision
        if (
          newHead[0] < 0 || newHead[0] >= CANVAS_SIZE / SCALE || 
          newHead[1] < 0 || newHead[1] >= CANVAS_SIZE / SCALE
        ) {
          endGame();
          return prevSnake;
        }

        // Self Collision
        for (let segment of prevSnake) {
          if (newHead[0] === segment[0] && newHead[1] === segment[1]) {
            endGame();
            return prevSnake;
          }
        }

        const newSnake = [newHead, ...prevSnake];

        // Food Collision
        if (newHead[0] === food[0] && newHead[1] === food[1]) {
          setScore((s) => s + 1);
          setFood([
            Math.floor(Math.random() * (CANVAS_SIZE / SCALE)),
            Math.floor(Math.random() * (CANVAS_SIZE / SCALE))
          ]);
        } else {
          newSnake.pop(); 
        }

        return newSnake;
      });
    }, SPEED);

    return () => clearInterval(moveSnake);
  }, [gameState, direction, food]);

  // Render Loop
  useEffect(() => {
    const context = canvasRef.current.getContext('2d');
    context.setTransform(1, 0, 0, 1, 0, 0);

    // 1. Background: Black
    context.fillStyle = '#000000';
    context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    context.setTransform(SCALE, 0, 0, SCALE, 0, 0);

    // 2. Draw Snake: PURE RED (Visible to Left Eye)
    context.fillStyle = '#FF0000'; 
    snake.forEach(([x, y]) => context.fillRect(x, y, 1, 1));

    // 3. Draw Food: RED with Variable Opacity
    context.fillStyle = `rgba(255, 0, 0, ${foodIntensity})`;
    context.fillRect(food[0], food[1], 1, 1);

    // Optional: Border
    context.strokeStyle = `rgba(255, 0, 0, 0.3)`;
    context.lineWidth = 0.1;
    context.strokeRect(0, 0, CANVAS_SIZE / SCALE, CANVAS_SIZE / SCALE);

  }, [snake, food, foodIntensity]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 font-sans text-white p-4">
      
      {/* HEADER (Hidden in Fullscreen) */}
      {!isFullScreen && (
        <div className="max-w-md w-full mb-6 text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-2 flex items-center justify-center gap-2">
            <Eye className="w-8 h-8" />
            Left Eye Isolation
          </h1>
          <p className="text-gray-400 text-sm">
            Snake Game for Amblyopia. Food and Snake are Red (Left Eye Only).
          </p>
        </div>
      )}

      {/* GAME CONTAINER */}
      <div className="flex gap-8 items-start justify-center w-full">
        
        <div 
          ref={containerRef}
          className={`relative flex items-center justify-center bg-neutral-950 ${isFullScreen ? 'w-full h-full' : 'rounded-lg shadow-[0_0_30px_rgba(255,0,0,0.3)] border-2 border-red-900/30'}`}
        >
          {/* Maximize/Minimize Button */}
          <button 
            onClick={toggleFullScreen}
            className="absolute top-2 right-2 p-2 bg-gray-800/50 hover:bg-gray-700 rounded-full text-white z-20 transition"
            title="Toggle Fullscreen"
          >
            {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>

          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="block bg-black shadow-2xl"
          />
          
          {/* OVERLAY SYSTEM */}
          {gameState !== 'PLAYING' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm z-10">
              
              {gameState === 'GAMEOVER' && (
                <div className="text-center mb-6 animate-pulse">
                  <AlertCircle className="mx-auto text-red-500 w-16 h-16 mb-2" />
                  <h2 className="text-4xl font-black text-white tracking-wider">GAME OVER</h2>
                  <p className="text-xl text-gray-300">Score: {score}</p>
                </div>
              )}

              {gameState === 'PAUSED' && (
                <div className="text-center mb-6">
                  <Pause className="mx-auto text-blue-500 w-16 h-16 mb-2" />
                  <h2 className="text-4xl font-black text-white tracking-wider">PAUSED</h2>
                </div>
              )}

              <button
                onClick={() => gameState === 'PAUSED' ? setGameState('PLAYING') : startGame()}
                className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full text-xl shadow-lg transition-all hover:scale-105"
              >
                <Play fill="currentColor" />
                {gameState === 'START' ? 'START THERAPY' : (gameState === 'PAUSED' ? 'RESUME' : 'RESTART')}
              </button>
            </div>
          )}
        </div>

        {/* SETTINGS PANEL (Hidden in Fullscreen) */}
        {!isFullScreen && (
          <div className="w-64 bg-neutral-800 p-6 rounded-xl shadow-lg border border-neutral-700 h-[400px] flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-red-400 font-bold border-b border-neutral-700 pb-2">
              <Settings size={18} />
              <span>Therapy Controls</span>
            </div>
            
            <div className="space-y-6 flex-1">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium text-gray-300">Food Visibility</label>
                  <span className="text-sm font-mono text-red-400">{Math.round(foodIntensity * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1.0" 
                  step="0.1"
                  value={foodIntensity}
                  onChange={(e) => setFoodIntensity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Lower intensity = Harder visual workout for the left eye.
                </p>
              </div>

              <div className="bg-black/30 p-3 rounded text-sm text-gray-400">
                <p className="mb-2"><strong>Score:</strong> <span className="text-white font-mono text-lg">{score}</span></p>
                <p>Press <strong>SPACE</strong> to Pause.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DichopticSnake;