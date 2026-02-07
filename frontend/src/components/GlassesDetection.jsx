import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { Camera, AlertCircle, CheckCircle } from 'lucide-react';

const GlassesDetection = ({ onGlassesDetected, onGlassesNotDetected, isActive }) => {
  const webcamRef = useRef(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const intervalRef = useRef(null);

  const captureAndVerify = async () => {
    if (!webcamRef.current || !isActive) return;
    
    try {
      setIsVerifying(true);
      
      // Capture image
      const imageSrc = webcamRef.current.getScreenshot();
      
      // Send to backend for verification
      const response = await fetch('/api/verify-glasses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageSrc
        })
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
      } else {
        console.error('Glasses verification failed:', result.error);
      }
    } catch (error) {
      console.error('Error verifying glasses:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  // Set up periodic verification
  useEffect(() => {
    if (isActive) {
      // Initial verification after 2 seconds
      const initialTimeout = setTimeout(() => {
        captureAndVerify();
      }, 2000);
      
      // Then verify every 5 seconds
      intervalRef.current = setInterval(() => {
        captureAndVerify();
      }, 5000);
      
      return () => {
        clearTimeout(initialTimeout);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      // Clean up when not active
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <>
      {/* Hidden webcam for capture */}
      <div className="fixed top-0 left-0 w-1 h-1 opacity-0 pointer-events-none">
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={320}
          height={240}
          mirrored={true}
        />
      </div>

      {/* Glasses detection status indicator */}
      <div className="fixed top-4 left-4 z-30">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
          lastResult?.wearingGlasses 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {isVerifying ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
              <span>Verifying...</span>
            </>
          ) : lastResult?.wearingGlasses ? (
            <>
              <CheckCircle className="h-4 w-4" />
              <span>Glasses Detected</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4" />
              <span>No Glasses</span>
            </>
          )}
        </div>
      </div>

      {/* Warning modal when glasses not detected */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-2">
                <Camera className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Glasses Required</h2>
            </div>
            
            <div className="mb-6 space-y-3 text-gray-700">
              <p className="leading-relaxed">
                Please put on your Red/Blue glasses to continue with the therapy session.
              </p>
              
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                <p className="font-semibold text-amber-800 mb-2">Why this is important:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-amber-700">
                  <li>Ensures proper dichoptic therapy effect</li>
                  <li>Guarantees each eye receives correct stimulation</li>
                  <li>Maintains treatment effectiveness</li>
                </ul>
              </div>
              
              {lastResult && (
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  Detection confidence: {(lastResult.confidence * 100).toFixed(1)}%
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowWarning(false);
                  captureAndVerify(); // Re-verify
                }}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                I've Put Them On
              </button>
              
              <button
                onClick={() => {
                  setShowWarning(false);
                  onGlassesNotDetected?.(lastResult);
                }}
                className="rounded-lg bg-gray-200 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Skip This Time
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlassesDetection;
