import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Settings, Clock, Eye, RefreshCw, Home, AlertTriangle } from 'lucide-react';

// Custom Hooks & Components
import { useSessionTimer } from '../hooks/useSessionTimer';
import { useCalibration } from '../components/CalibrationPanel';
import CalibrationPanel from '../components/CalibrationPanel';
import GlassesDetection from '../components/GlassesDetection';

const Game = () => {
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // --- 1. GAME STATE ---
  const [gameState, setGameState] = useState('IDLE'); // 'IDLE', 'PLAYING', 'PAUSED', 'FINISHED'
  const [showCalibration, setShowCalibration] = useState(false);
  const [glassesWarning, setGlassesWarning] = useState(false);

  // --- 2. HOOKS ---
  // Timer: 20 minutes (1200 seconds)
  const { timeLeft, isSessionOver, formattedTime, startTimer, pauseTimer } = useSessionTimer(1200);
  
  // Calibration: Get global colors
  const { redColor, blueColor } = useCalibration();

  // --- 3. CONTROL HANDLERS ---
  const startGame = () => {
    setGameState('PLAYING');
    startTimer();
  };

  const pauseGame = () => {
    setGameState('PAUSED');
    pauseTimer();
  };

  const resumeGame = () => {
    setGameState('PLAYING');
    startTimer();
  };

  const quitGame = () => {
    navigate('/dashboard');
  };

  // --- 4. AI GLASSES LOGIC ---
  const handleGlassesStatus = (isWearingGlasses) => {
    // If game is running and user takes off glasses -> PAUSE
    if (gameState === 'PLAYING' && !isWearingGlasses) {
      console.warn("⚠️ Safety System: Glasses removed. Pausing.");
      setGlassesWarning(true);
      pauseGame();
    } 
    // If game was paused by warning and user puts them back on -> RESUME (Optional)
    else if (glassesWarning && isWearingGlasses) {
      setGlassesWarning(false);
      // resumeGame(); // Uncomment if you want auto-resume
    }
  };

  // --- 5. GAME LOOP & RENDERING ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      // Clear Screen
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw Background
      ctx.fillStyle = '#0f172a'; // Slate-950
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (gameState === 'PLAYING') {
        // --- DEMO GAME LOGIC (Replace with your Snake/Tetris logic) ---
        
        // LEFT EYE OBJECT (Red)
        ctx.fillStyle = redColor; // Uses Global Calibrated Color
        ctx.beginPath();
        ctx.arc(300, 300, 50, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "16px sans-serif";
        ctx.fillText("Left Eye Target", 240, 370);

        // RIGHT EYE OBJECT (Blue)
        ctx.fillStyle = blueColor; // Uses Global Calibrated Color
        ctx.fillRect(450, 250, 100, 100);
        ctx.fillStyle = "#fff";
        ctx.fillText("Right Eye Target", 450, 370);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, redColor, blueColor]);

  // --- 6. RENDER UI ---
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative font-sans text-slate-100">

      {/* --- HUD (Heads Up Display) --- */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-slate-900/50 backdrop-blur-sm border-b border-slate-800">
        
        {/* Timer */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold border ${timeLeft < 60 ? 'bg-red-900/20 border-red-500 text-red-500 animate-pulse' : 'bg-slate-800 border-slate-700 text-blue-400'}`}>
          <Clock className="w-5 h-5" />
          <span>{formattedTime}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={() => setShowCalibration(!showCalibration)}
            className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition border border-slate-700"
            title="Calibrate Glasses"
          >
            <Settings className="w-6 h-6 text-slate-300" />
          </button>

          {gameState === 'IDLE' ? (
            <button onClick={startGame} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg shadow-blue-500/30 transition flex gap-2">
              <Play className="w-6 h-6" /> Start
            </button>
          ) : (
            <button 
              onClick={gameState === 'PLAYING' ? pauseGame : resumeGame} 
              className={`p-2 rounded-lg transition border ${gameState === 'PLAYING' ? 'bg-amber-600 border-amber-500 hover:bg-amber-500' : 'bg-emerald-600 border-emerald-500 hover:bg-emerald-500'}`}
            >
              {gameState === 'PLAYING' ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
            </button>
          )}

          <button onClick={quitGame} className="p-2 bg-slate-800 rounded-lg hover:bg-red-900/30 hover:text-red-400 transition border border-slate-700">
            <Home className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* --- GAME CONTAINER --- */}
      <div className="relative border-4 border-slate-800 rounded-2xl shadow-2xl bg-black overflow-hidden mt-16">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={600} 
          className={`transition-all duration-500 ${gameState === 'PAUSED' ? 'blur-sm opacity-50' : 'blur-0 opacity-100'}`}
        />

        {/* --- OVERLAYS --- */}

        {/* 1. PAUSE MENU */}
        {gameState === 'PAUSED' && !glassesWarning && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="bg-slate-900/90 p-8 rounded-2xl border border-slate-700 text-center backdrop-blur-md shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-2">Game Paused</h2>
              <button onClick={resumeGame} className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2 mx-auto transition">
                <Play className="w-5 h-5" /> Resume
              </button>
            </div>
          </div>
        )}

        {/* 2. GLASSES WARNING (AI Triggered) */}
        {glassesWarning && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-red-950/80 backdrop-blur-md">
            <div className="bg-slate-900 p-8 rounded-2xl border-2 border-red-500 text-center shadow-2xl max-w-md">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
              <h2 className="text-2xl font-bold text-white mb-2">Glasses Not Detected!</h2>
              <p className="text-slate-300 mb-6">
                Therapy paused. Please put your Red/Blue glasses back on to continue.
              </p>
              <button 
                onClick={() => { setGlassesWarning(false); resumeGame(); }} 
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition"
              >
                I'm Wearing Them
              </button>
            </div>
          </div>
        )}

        {/* 3. CALIBRATION PANEL (Slide-over) */}
        {showCalibration && (
          <div className="absolute top-4 right-4 z-40 w-80 animate-in slide-in-from-right duration-300">
            <CalibrationPanel />
          </div>
        )}

        {/* 4. INVISIBLE AI DETECTOR */}
        <GlassesDetection 
          isActive={gameState === 'PLAYING'} 
          onGlassesStatusChange={handleGlassesStatus} 
        />
      </div>

      {/* --- SESSION COMPLETE MODAL (20-20-20 Rule) --- */}
      {isSessionOver && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-8 text-center shadow-2xl">
            <div className="mx-auto w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
              <Eye className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Session Complete!</h2>
            <p className="text-slate-400 mb-6">
              You've hit the 20-minute mark. To prevent strain, follow the <strong>20-20-20 Rule</strong>:
            </p>
            <div className="bg-slate-800 rounded-xl p-4 mb-8 text-left border border-slate-700">
              <ul className="space-y-3 text-slate-300 text-sm">
                <li>👀 Look at something <strong>20 feet away</strong>.</li>
                <li>⏱️ Focus on it for <strong>20 seconds</strong>.</li>
                <li>🧘 Relax before your next session.</li>
              </ul>
            </div>
            <button onClick={() => window.location.reload()} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition">
              <RefreshCw className="w-5 h-5" /> Start New Session
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Game;