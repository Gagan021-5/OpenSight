import { useGlobal } from './context/GlobalContext';
import AppRoutes from './routes';
import { Eye } from 'lucide-react';

function App() {
  const { loading } = useGlobal();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-900 dark:text-slate-50 transition-colors duration-300">
        <div className="text-center">
          <Eye className="w-16 h-16 text-indigo-600 dark:text-indigo-400 mx-auto mb-4 animate-pulse" />
          <div className="w-16 h-16 border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300 font-semibold">Loading OpenSight...</p>
        </div>
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
