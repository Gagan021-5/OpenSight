import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { useDevMode } from '../context/DevModeContext';
import { Eye, Target, Settings } from 'lucide-react';

const SetupPage = () => {
  // Try to use the appropriate context based on what's available
  let context;
  try {
    context = useDevMode();
  } catch {
    context = useGlobal();
  }
  
  const { updateConfig } = context;
  const navigate = useNavigate();
  
  const [config, setConfig] = useState({
    weakEye: 'left',
    condition: 'amblyopia',
    difficulty: 5
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateConfig(config);
      navigate('/dashboard');
    } catch (error) {
      console.error('Setup failed:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <Eye className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup Your Therapy Profile</h1>
          <p className="text-gray-600">Configure your vision therapy settings</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Weak Eye */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <Target className="inline w-4 h-4 mr-2" />
              Which Eye Needs Training?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['left', 'right', 'both'].map((eye) => (
                <button
                  key={eye}
                  type="button"
                  onClick={() => setConfig({ ...config, weakEye: eye })}
                  className={`p-4 rounded-lg border-2 font-medium transition-all ${
                    config.weakEye === eye
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {eye === 'both' ? 'Both (Fusion)' : eye.charAt(0).toUpperCase() + eye.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Condition Type
            </label>
            <select
              value={config.condition}
              onChange={(e) => setConfig({ ...config, condition: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:outline-none"
            >
              <option value="amblyopia">Amblyopia (Lazy Eye)</option>
              <option value="strabismus">Strabismus (Eye Turn)</option>
              <option value="convergence">Convergence Insufficiency</option>
              <option value="tracking">Tracking Disorder</option>
              <option value="neglect">Spatial Neglect</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <Settings className="inline w-4 h-4 mr-2" />
              Starting Difficulty: {config.difficulty}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={config.difficulty}
              onChange={(e) => setConfig({ ...config, difficulty: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Easy</span>
              <span>Challenging</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-lg"
          >
            Start Therapy Journey
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupPage;
