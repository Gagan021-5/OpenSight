import { useState, useEffect } from 'react';
import { useGlobal } from './context/GlobalContext';
import AppRoutes from './routes';
import { Eye, Loader2 } from 'lucide-react';
import api from './utils/api'; 

function App() {
  const { loading: authLoading } = useGlobal();
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // 🔹 Backend Health Check Logic
  useEffect(() => {
    const wakeUpBackend = async () => {
      try {
        // FIX: The backend defines /ping at the root, but our API instance points to /api
        // We override the baseURL for just this request to hit the root https://...onrender.com/ping
        const rootUrl = api.defaults.baseURL?.replace('/api', '') || '';
        
        // Use standard fetch to avoid axios baseURL issues for this specific root check
        // or axios with custom config. Let's use the axios instance but override baseURL.
        await api.get('/ping', { 
           baseURL: rootUrl 
        });

        setIsBackendReady(true);
      } catch (error) {
        console.log(`Backend sleeping or path wrong... attempt ${retryCount + 1}`);
        // Retry every 5 seconds
        setTimeout(() => setRetryCount(prev => prev + 1), 5000);
      }
    };

    wakeUpBackend();
  }, [retryCount]);

  // 🔹 1. "Waking Up" Screen (Before Backend is ready)
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

  // 🔹 2. Auth Loading Screen (Backend ready, checking user token)
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

  // 🔹 3. Main App
  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300 min-h-screen">
      <AppRoutes />
    </div>
  );
}

export default App;