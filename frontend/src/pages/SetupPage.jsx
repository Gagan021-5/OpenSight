import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { Eye, Target, Settings } from 'lucide-react';
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
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isKids ? 'bg-gradient-to-br from-yellow-100 to-blue-200' : 'bg-gradient-to-br from-slate-50 to-blue-50'
    }`}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-lg rounded-2xl shadow-xl p-8 ${
          isKids ? 'bg-white border-4 border-yellow-300' : 'bg-white border border-slate-200'
        }`}
      >
        <div className="text-center mb-8">
          <Eye className={`w-14 h-14 mx-auto mb-3 ${isKids ? 'text-yellow-600' : 'text-indigo-600'}`} />
          <h1 className={`text-2xl font-bold ${isKids ? 'font-nunito text-yellow-800' : 'text-slate-900'}`}>
            {isKids ? '⚙️ Mission Settings' : 'Therapy profile'}
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            {isKids ? 'Set up your training, Captain!' : 'Configure your vision therapy'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-sm font-semibold mb-2 ${isKids ? 'text-blue-700' : 'text-slate-700'}`}>
              <Target className="inline w-4 h-4 mr-1" />
              {isKids ? 'Which eye are we training?' : 'Weak eye'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['left', 'right', 'both'].map((eye) => (
                <button
                  key={eye}
                  type="button"
                  onClick={() => setConfig({ ...config, weakEye: eye })}
                  className={`py-3 rounded-xl border-2 font-medium transition ${
                    config.weakEye === eye
                      ? isKids ? 'border-yellow-500 bg-yellow-100 text-yellow-800' : 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {eye === 'both' ? 'Both (Fusion)' : eye.charAt(0).toUpperCase() + eye.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${isKids ? 'text-blue-700' : 'text-slate-700'}`}>
              Condition
            </label>
            <select
              value={config.condition}
              onChange={(e) => setConfig({ ...config, condition: e.target.value })}
              className={`w-full py-3 px-4 rounded-xl border-2 focus:outline-none ${
                isKids ? 'border-yellow-300 focus:border-yellow-500' : 'border-slate-200 focus:border-indigo-500'
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
            <label className={`block text-sm font-semibold mb-2 ${isKids ? 'text-blue-700' : 'text-slate-700'}`}>
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
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Easy</span>
              <span>Hard</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`w-full py-4 rounded-xl font-bold transition disabled:opacity-70 ${
              isKids
                ? 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isKids ? '🚀 Start Mission' : 'Save and continue'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
