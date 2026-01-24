import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { Eye, Target, Settings, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SetupPage() {
  const { updateConfig, ageGroup } = useGlobal();
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    weakEye: 'left',
    condition: 'amblyopia',
    difficulty: 5,
  });
  const [saving, setSaving] = useState(false);

  const isKids = ageGroup === 'kid';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateConfig(config);
      navigate('/dashboard');
    } catch (err) {
      console.error('Setup failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white antialiased">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-lg rounded-2xl shadow-2xl p-8 bg-white/80 backdrop-blur-md border border-gray-200/60`}
      >
        <div className="text-center mb-8">
          <Eye className={`w-14 h-14 mx-auto mb-3 ${isKids ? 'text-yellow-600' : 'text-indigo-600'}`} />
          <h1 className={`text-2xl font-black text-black mb-2 ${isKids ? 'font-nunito' : ''}`}>
            {isKids ? '⚙️ Mission Settings' : 'Therapy profile'}
          </h1>
          <p className="text-gray-700 text-sm mt-1">
            {isKids ? 'Set up your training, Captain!' : 'Configure your vision therapy'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-sm font-semibold mb-2 text-gray-700`}>
              <Target className="inline w-4 h-4 mr-1" />
              {isKids ? 'Which eye are we training?' : 'Weak eye'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['left', 'right', 'both'].map((eye) => (
                <button
                  key={eye}
                  type="button"
                  onClick={() => setConfig({ ...config, weakEye: eye })}
                  className={`py-3 rounded-xl border-2 font-medium transition cursor-pointer ${
                    config.weakEye === eye
                      ? isKids ? 'border-yellow-500 bg-yellow-100 text-yellow-800' : 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {eye === 'both' ? 'Both (Fusion)' : eye.charAt(0).toUpperCase() + eye.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 text-gray-700`}>
              Condition
            </label>
            <select
              value={config.condition}
              onChange={(e) => setConfig({ ...config, condition: e.target.value })}
              className={`w-full py-3 px-4 rounded-xl border-2 focus:outline-none bg-white text-black cursor-pointer ${
                isKids ? 'border-yellow-300 focus:border-yellow-500' : 'border-gray-200 focus:border-indigo-500'
              }`}
            >
              <option value="amblyopia">Amblyopia (Lazy Eye)</option>
              <option value="strabismus">Strabismus (Eye Turn)</option>
              <option value="convergence">Convergence Insufficiency</option>
              <option value="tracking">Tracking Disorder</option>
              <option value="neglect">Spatial Neglect</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 text-gray-700`}>
              <Settings className="inline w-4 h-4 mr-1" />
              {isKids ? 'Challenge level' : 'Difficulty'}: {config.difficulty}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={config.difficulty}
              onChange={(e) => setConfig({ ...config, difficulty: parseInt(e.target.value, 10) })}
              className={`w-full h-2 rounded-lg accent-indigo-600 ${isKids ? 'accent-yellow-500' : ''}`}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Easy</span>
              <span>Hard</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`w-full py-4 rounded-xl font-black transition disabled:opacity-70 cursor-pointer ${
              isKids
                ? 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isKids ? '🚀 Start Mission' : 'Save and continue'}
          </button>
        </form>

        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl font-semibold text-gray-600 border-2 border-gray-200 hover:bg-gray-100 transition cursor-pointer"
        >
          <Home className="w-5 h-5" /> Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
