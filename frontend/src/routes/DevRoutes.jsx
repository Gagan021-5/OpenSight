import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import DashboardLayout from '../layouts/DashboardLayout';

// Pages
import Dashboard from '../pages/Dashboard';
import SetupPage from '../pages/SetupPage';

// Games
import DichopticSnake from '../components/DichopticSnake';
import DichopticRacing from '../components/DichopticRacing';
import DichopticSea from '../components/DichopticSea';

// Development home page
const DevHome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-purple-300">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-black text-purple-600 mb-2">🔧 Development Mode</h1>
            <p className="text-gray-600 text-lg">Auth disabled - Explore freely!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pages */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
              <h2 className="text-2xl font-bold text-blue-700 mb-4">📄 Pages</h2>
              <div className="space-y-3">
                <a href="/dashboard" className="block p-3 bg-white rounded-lg hover:shadow-md transition">
                  <span className="font-semibold text-blue-600">Dashboard</span>
                  <p className="text-sm text-gray-600">Main game selection page</p>
                </a>
                <a href="/setup" className="block p-3 bg-white rounded-lg hover:shadow-md transition">
                  <span className="font-semibold text-blue-600">Setup</span>
                  <p className="text-sm text-gray-600">Therapy configuration</p>
                </a>
              </div>
            </div>

            {/* Games */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
              <h2 className="text-2xl font-bold text-green-700 mb-4">🎮 Games</h2>
              <div className="space-y-3">
                <a href="/game/snake" className="block p-3 bg-white rounded-lg hover:shadow-md transition">
                  <span className="font-semibold text-green-600">🐍 Snake</span>
                  <p className="text-sm text-gray-600">Classic snake game</p>
                </a>
                <a href="/game/racing" className="block p-3 bg-white rounded-lg hover:shadow-md transition">
                  <span className="font-semibold text-green-600">🏎️ Racing</span>
                  <p className="text-sm text-gray-600">Avoid obstacles</p>
                </a>
                <a href="/game/sea" className="block p-3 bg-white rounded-lg hover:shadow-md transition">
                  <span className="font-semibold text-green-600">🚢 Sea Voyage</span>
                  <p className="text-sm text-gray-600">Navigate the ocean</p>
                </a>
              </div>
            </div>

            {/* Components */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl">
              <h2 className="text-2xl font-bold text-yellow-700 mb-4">⚙️ Config</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Weak Eye:</strong> left</p>
                <p><strong>Condition:</strong> amblyopia</p>
                <p><strong>Theme:</strong> adult</p>
                <p className="text-xs text-gray-600 mt-3">Edit in <code className="bg-yellow-200 px-1 rounded">DevModeContext.jsx</code></p>
              </div>
            </div>

            {/* Hooks */}
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-xl">
              <h2 className="text-2xl font-bold text-pink-700 mb-4">🪝 Hooks Available</h2>
              <div className="space-y-2 text-sm">
                <p>✅ <code className="bg-pink-200 px-1 rounded">useDevMode()</code></p>
                <p>✅ <code className="bg-pink-200 px-1 rounded">useTherapyColors()</code></p>
                <p className="text-xs text-gray-600 mt-3">Use <code>useDevMode</code> instead of <code>useGlobal</code></p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-purple-100 rounded-xl border-2 border-purple-300">
            <p className="text-sm text-purple-800">
              <strong>💡 Tip:</strong> To enable Clerk auth, remove the <code className="bg-purple-200 px-1 rounded">DEV_MODE</code> check in <code className="bg-purple-200 px-1 rounded">main.jsx</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DevRoutes = () => {
  return (
    <Routes>
      {/* Dev Home */}
      <Route path="/" element={<DevHome />} />

      {/* Dashboard Routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Game Routes (No Layout) */}
      <Route path="/game/snake" element={<DichopticSnake />} />
      <Route path="/game/racing" element={<DichopticRacing />} />
      <Route path="/game/sea" element={<DichopticSea />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default DevRoutes;
