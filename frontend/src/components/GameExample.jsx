import React, { useState, useEffect, useRef } from 'react';
import { useSessionTimer } from '../hooks/useSessionTimer.js';
import { useCalibration } from '../components/CalibrationPanel.jsx';
import GlassesDetection from '../components/GlassesDetection.jsx';
import CalibrationPanel from '../components/CalibrationPanel.jsx';
import { Play, Pause, Settings, Clock, Eye } from 'lucide-react';

const GameExample = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('IDLE'); // IDLE, PLAYING, PAUSED, BREAK
  const [showCalibration, setShowCalibration] = useState(false);
  const [isGamePaused, setIsGamePaused] = useState(false);
  
  // Session timer hook
  const { timeLeft, isSessionOver, formattedTime, startTimer } = useSessionTimer(1200); // 20 minutes
  
  // Calibration context
  const { redTint, blueTint } = useCalibration();
  
  // Game controls
  const startGame = () => {
    setGameState('PLAYING');
    setIsGamePaused(false);
    startTimer();
  };
  
  const pauseGame = () => {
    setGameState('PAUSED');
    setIsGamePaused(true);
  };
  
  const resumeGame = () => {
    setGameState('PLAYING');
    setIsGamePaused(false);
  };
  
  // Glasses detection handlers
  const handleGlassesDetected = (result) => {
    if (isGamePaused) {
      resumeGame();
    }
  };
  
  const handleGlassesNotDetected = (result) => {
    if (gameState === 'PLAYING') {
      pauseGame();
    }
  };
  
  // Game rendering with calibrated colors
  const renderGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gameState === 'PLAYING' && !isSessionOver) {
      // Use calibrated colors instead of hardcoded values
      const redColor = `rgb(${redTint}, 0, 0)`;
      const blueColor = `rgb(0, 0, ${blueTint})`;
      
      // Example: Draw red elements (for left eye)
      ctx.fillStyle = redColor;
      ctx.fillRect(50, 50, 100, 100);
      
      // Example: Draw blue elements (for right eye)
      ctx.fillStyle = blueColor;
      ctx.fillRect(200, 50, 100, 100);
      
      // Add your game logic here
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.fillText('Game Running', 150, 200);
    }
  };
  
  // Animation loop
  useEffect(() => {
    const animate = () => {
      renderGame();
      if (gameState === 'PLAYING' && !isSessionOver) {
        requestAnimationFrame(animate);
      }
    };
    
    if (gameState === 'PLAYING' && !isSessionOver) {
      animate();
    }
  }, [gameState, isSessionOver, redTint, blueTint]);
  
  return (
    <div className="relative w-full h-screen bg-black">
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full"
        style={{ maxWidth: '800px', margin: '0 auto', display: 'block' }}
      />
      
      {/* Game HUD */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {/* Session Timer */}
        <div className="bg-black/70 text-white px-3 py-2 rounded-lg flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="font-mono text-sm">{formattedTime}</span>
        </div>
        
        {/* Game Controls */}
        <div className="flex gap-2">
          {gameState === 'PLAYING' ? (
            <button
              onClick={pauseGame}
              className="bg-black/70 text-white p-2 rounded-lg hover:bg-black/80 transition-colors"
            >
              <Pause className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={gameState === 'IDLE' ? startGame : resumeGame}
              className="bg-black/70 text-white p-2 rounded-lg hover:bg-black/80 transition-colors"
              disabled={isSessionOver}
            >
              <Play className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={() => setShowCalibration(!showCalibration)}
            className="bg-black/70 text-white p-2 rounded-lg hover:bg-black/80 transition-colors"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Calibration Panel */}
      <CalibrationPanel 
        isOpen={showCalibration} 
        onClose={() => setShowCalibration(false)} 
      />
      
      {/* Glasses Detection */}
      <GlassesDetection
        isActive={gameState === 'PLAYING'}
        onGlassesDetected={handleGlassesDetected}
        onGlassesNotDetected={handleGlassesNotDetected}
      />
      
      {/* Game State Overlays */}
      {gameState === 'IDLE' && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Vision Therapy Game</h2>
            <button
              onClick={startGame}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Start Session
            </button>
          </div>
        </div>
      )}
      
      {gameState === 'PAUSED' && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Game Paused</h2>
            <p className="mb-4">Put on your glasses to continue</p>
            <button
              onClick={resumeGame}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Resume
            </button>
          </div>
        </div>
      )}
      
      {/* Session Break Overlay */}
      {isSessionOver && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="mx-4 max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center">
            <div className="mb-4">
              <Eye className="h-12 w-12 text-green-600 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Break Time!</h2>
            <p className="text-gray-700 mb-6">
              You've completed your 20-minute therapy session. Take a break following the 20-20-20 rule:
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">20-20-20 Rule</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>Look at something 20 feet away</li>
                <li>For at least 20 seconds</li>
                <li>Every 20 minutes of screen time</li>
              </ul>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold text-white transition-colors"
            >
              Start New Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameExample;
