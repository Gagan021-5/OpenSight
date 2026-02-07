import { useState, useEffect } from 'react';
import { useGlobal } from './context/GlobalContext';
import AppRoutes from './routes';
import { Eye, Loader2 } from 'lucide-react';

// 👇 NEW IMPORTS FOR SAFETY & CALIBRATION
import { CalibrationProvider } from './components/CalibrationPanel'; 
import SafetyModal from './components/SafetyModal';

function App() {
  const { loading: authLoading } = useGlobal();
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // 🔹 Backend Health Check Logic (Your existing code)
  useEffect(() => {
    const wakeUpBackend = async () => {
      try {
        console.log(`[Health Check] Attempt ${retryCount + 1}...`);
        
        // Using localhost for local dev, but in production this should be your render URL
        // or a relative path if served from the same origin
        const res = await fetch('http://localhost:5000/ping');

        if (res.ok) {
           console.log("[Health Check] Success! Backend is awake.");
           setIsBackendReady(true);
        } else {
           throw new Error("Backend not ready");
        }
      } catch (error) {
        console.log("[Health Check] Failed. Retrying in 5s...", error);
        setTimeout(() => setRetryCount(prev => prev + 1), 5000);
      }
    };

    wakeUpBackend();
  }, [retryCount]);

  // 🔹 1. "Waking Up" Screen
  if (!isBackendReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-50">
        <div className="text-center p-8 max-w-md">
          <div className="relative mb-6">
             <Eye className="w-16 h-16 text-indigo-500 mx-auto animate-pulse" />
             <Loader2 className="w-20 h-20 text-indigo-400 absolute top-[-8px] left-1/2 -translate-x-1/2 animate-spin opacity-20" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Connecting to Dr. Sight</h2>
          <p className="text-slate-400 mb-6">
            Our specialized therapy engine is warming up. This usually takes 30-60 seconds on the first visit.
          </p>
          <div className="space-y-3">
             <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full animate-progress-indeterminate"></div>
             </div>
             <p className="text-xs text-slate-500 uppercase tracking-widest">
               Connection Attempt: {retryCount + 1}
             </p>
          </div>
        </div>
      </div>
    );
  }

  // 🔹 2. Auth Loading Screen
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-900 dark:text-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="text-center">
          <Eye className="w-16 h-16 text-indigo-600 dark:text-indigo-400 mx-auto mb-4 animate-pulse" />
          <div className="w-16 h-16 border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300 font-semibold">Verifying Credentials...</p>
        </div>
      </div>
    );
  }

  // 🔹 3. Main App (NOW WRAPPED WITH CALIBRATION PROVIDER)
  return (
    <CalibrationProvider> {/* 👈 THIS PROVIDES RED/BLUE CONTEXT TO ALL GAMES */}
      <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300 min-h-screen">
        
        {/* 👇 GLOBAL SAFETY POPUP (Appears once per session) */}
        <SafetyModal />
        
        {/* 👇 YOUR ROUTES (Dashboard, Games, etc.) */}
        <AppRoutes />
        
      </div>
    </CalibrationProvider>
  );
}

export default App;