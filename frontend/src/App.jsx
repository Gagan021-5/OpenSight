import { useState, useEffect } from 'react';
import { useGlobal } from './context/GlobalContext';
import AppRoutes from './routes';
import { Eye, Loader2 } from 'lucide-react';
import api from './utils/api.js';// Ensure this points to your axios instance

function App() {
  const { loading: authLoading } = useGlobal();
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // 🔹 Backend Health Check Logic
  useEffect(() => {
    const wakeUpBackend = async () => {
      try {
        await api.get('/ping');
        setIsBackendReady(true);
      } catch (error) {
        console.log("Backend is still sleeping... retrying in 5s");
        // Retry every 5 seconds until success
        setTimeout(() => setRetryCount(prev => prev + 1), 5000);
      }
    };

    wakeUpBackend();
  }, [retryCount]);

  // 🔹 Show the "Waking Up" screen if the backend hasn't responded yet
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

  // 🔹 Show standard auth loading if backend is ready but user check isn't done
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
         <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300 min-h-screen">
      <AppRoutes />
    </div>
  );
}

export default App;