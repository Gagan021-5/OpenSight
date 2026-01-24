import { useGlobal } from './context/GlobalContext';
import AppRoutes from './routes';
import { Eye } from 'lucide-react';

function App() {
  const { loading } = useGlobal();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Eye className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-pulse" />
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading OpenSight...</p>
        </div>
      </div>
    );
  }

  return <AppRoutes />;
}

export default App;
