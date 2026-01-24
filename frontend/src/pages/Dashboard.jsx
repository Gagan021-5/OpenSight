import { Link } from 'react-router-dom';
import { Gamepad2, Trophy, Settings, Eye, User } from 'lucide-react';

// Import both contexts - component will use whichever is available
import { useGlobal } from '../context/GlobalContext';
import { useDevMode } from '../context/DevModeContext';

const Dashboard = () => {
  // Try to use the appropriate context based on what's available
  let context;
  try {
    context = useDevMode();
  } catch {
    context = useGlobal();
  }
  
  const { userProfile, ageGroup, weakEye, condition } = context;

  const games = [
    { id: 'snake', name: 'Snake Hunt', path: '/game/snake', condition: 'amblyopia' },
    { id: 'racing', name: 'Speed Racer', path: '/game/racing', condition: 'amblyopia' },
    { id: 'sea', name: 'Sea Voyage', path: '/game/sea', condition: 'amblyopia' },
  ];

  const isKidsMode = ageGroup === 'kid';

  return (
    <div className={`min-h-screen ${isKidsMode ? 'bg-gradient-to-br from-yellow-100 to-blue-200' : 'bg-gradient-to-br from-gray-50 to-blue-50'}`}>
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Eye className={`w-10 h-10 ${isKidsMode ? 'text-yellow-500' : 'text-indigo-600'}`} />
          <div>
            <h1 className={`text-2xl font-bold ${isKidsMode ? 'font-comic text-yellow-700' : 'text-gray-900'}`}>
              {isKidsMode ? '🚀 Mission Control' : 'OpenSight Dashboard'}
            </h1>
            <p className="text-sm text-gray-600">
              {userProfile?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/settings"
            className={`p-2 rounded-full ${isKidsMode ? 'bg-yellow-300 hover:bg-yellow-400' : 'bg-white hover:bg-gray-100'} transition`}
          >
            <Settings className="w-6 h-6" />
          </Link>
          <User className="w-8 h-8 p-1.5 bg-purple-500 text-white rounded-full" />
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Info Card */}
        <div className={`p-6 rounded-2xl mb-8 ${isKidsMode ? 'bg-white/80 border-4 border-yellow-300' : 'bg-white shadow-lg'}`}>
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-full ${isKidsMode ? 'bg-blue-200' : 'bg-indigo-100'}`}>
              <Eye className={`w-8 h-8 ${isKidsMode ? 'text-blue-600' : 'text-indigo-600'}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                Training: <span className="capitalize">{weakEye}</span> Eye
              </h3>
              <p className="text-sm text-gray-600 capitalize">
                Condition: {condition.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div>
          <h2 className={`text-2xl font-bold mb-6 ${isKidsMode ? 'font-comic text-yellow-700' : 'text-gray-900'}`}>
            {isKidsMode ? '🎮 Choose Your Mission' : 'Therapy Games'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <Link
                key={game.id}
                to={game.path}
                className={`group p-6 rounded-2xl transition-all transform hover:scale-105 ${
                  isKidsMode
                    ? 'bg-white border-4 border-blue-300 hover:border-blue-500 shadow-lg'
                    : 'bg-white shadow-md hover:shadow-xl'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Gamepad2 className={`w-12 h-12 ${isKidsMode ? 'text-blue-500' : 'text-indigo-600'}`} />
                  {isKidsMode && <span className="text-3xl">🎯</span>}
                </div>
                <h3 className={`text-xl font-bold mb-2 ${isKidsMode ? 'font-comic text-blue-700' : 'text-gray-900'}`}>
                  {game.name}
                </h3>
                <button className={`mt-4 w-full py-3 rounded-xl font-bold transition ${
                  isKidsMode
                    ? 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}>
                  {isKidsMode ? 'START MISSION' : 'Start Game'}
                </button>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className={`mt-8 p-6 rounded-2xl ${isKidsMode ? 'bg-white/80 border-4 border-green-300' : 'bg-white shadow-lg'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Trophy className={`w-6 h-6 ${isKidsMode ? 'text-green-500' : 'text-yellow-500'}`} />
            <h3 className="text-lg font-bold">
              {isKidsMode ? '🏆 Your Badges' : 'Progress'}
            </h3>
          </div>
          <p className="text-gray-600">
            {isKidsMode ? 'Keep playing to earn more badges!' : 'Track your therapy progress here.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
