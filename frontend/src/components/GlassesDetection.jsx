import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { Camera, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

const GlassesDetection = ({ onGlassesDetected, onGlassesNotDetected, isActive }) => {
  const webcamRef = useRef(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  
  // 🆕 NEW: State to toggle camera visibility
  const [showCamera, setShowCamera] = useState(false); 
  
  const intervalRef = useRef(null);

  const captureAndVerify = async () => {
    if (!webcamRef.current || !isActive) return;
    
    try {
      setIsVerifying(true);
      
      // Capture image
      const imageSrc = webcamRef.current.getScreenshot();
      
      // Send to backend for verification
      const response = await fetch('http://localhost:5000/api/verify-glasses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageSrc })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setLastResult(result);
        if (result.wearingGlasses) {
          setShowWarning(false);
          onGlassesDetected?.(result);
        } else {
          setShowWarning(true);
          onGlassesNotDetected?.(result);
        }
      }
    } catch (error) {
      console.error('Error verifying glasses:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (isActive) {
      const initialTimeout = setTimeout(() => captureAndVerify(), 2000);
      intervalRef.current = setInterval(() => captureAndVerify(), 5000);
      
      return () => {
        clearTimeout(initialTimeout);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <>
      {/* 📸 WEBCAM CONTAINER (Dynamic Styles) */}
      <div className={`fixed transition-all duration-300 z-40 border-2 border-indigo-500 overflow-hidden bg-black rounded-lg ${
        showCamera 
          ? "bottom-4 right-4 w-48 h-36 opacity-100 shadow-2xl" // Visible Mode
          : "top-0 left-0 w-1 h-1 opacity-0 pointer-events-none" // Hidden Mode
      }`}>
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={320}
          height={240}
          mirrored={true}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 🛡️ STATUS BADGE (Top Left) */}
      <div className="fixed top-20 left-4 z-30 flex flex-col gap-2">
        
        {/* Status Indicator */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium shadow-lg transition-colors ${
          lastResult?.wearingGlasses 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {isVerifying ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
          ) : lastResult?.wearingGlasses ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span>{isVerifying ? "Scanning..." : lastResult?.wearingGlasses ? "Glasses ON" : "Glasses OFF"}</span>
        </div>

        {/* 🆕 TOGGLE CAMERA BUTTON */}
        <button 
          onClick={() => setShowCamera(!showCamera)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-slate-200 text-xs rounded-lg hover:bg-slate-700 transition shadow-lg border border-slate-700"
        >
          {showCamera ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          {showCamera ? "Hide Debug Cam" : "Show Debug Cam"}
        </button>

      </div>

      {/* ⚠️ WARNING MODAL (Keep your existing modal logic here) */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
           {/* ... (Your existing modal code) ... */}
           {/* Just adding a basic version for context */}
           <div className="bg-white p-6 rounded-xl max-w-sm text-center">
              <h2 className="text-xl font-bold text-red-600 mb-2">⚠️ Glasses Required</h2>
              <p className="text-gray-600 mb-4">Please put on your Red/Blue glasses.</p>
              <button 
                onClick={() => { setShowWarning(false); captureAndVerify(); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full"
              >
                I put them on
              </button>
           </div>
        </div>
      )}
    </>
  );
};

export default GlassesDetection;