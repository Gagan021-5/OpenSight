import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext.jsx';
import { Eye, Target, Settings, Home, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className={`min-h-screen w-full relative overflow-hidden flex items-center justify-center p-4 ${isKids ? 'bg-amber-50' : 'bg-slate-50'}`}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-30 mix-blend-multiply animate-blob ${isKids ? 'bg-yellow-200' : 'bg-indigo-200'}`} />
        <div className={`absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-30 mix-blend-multiply animate-blob animation-delay-2000 ${isKids ? 'bg-orange-200' : 'bg-blue-200'}`} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-[2rem] overflow-hidden"
      >
        {/* Header Bar */}
        <div className={`p-8 pb-6 text-center border-b ${isKids ? 'border-yellow-100 bg-yellow-50/50' : 'border-slate-100 bg-slate-50/50'}`}>
          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 ${
             isKids ? 'bg-gradient-to-br from-yellow-300 to-orange-400 text-white' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
          }`}>
            <Settings size={32} strokeWidth={1.5} />
          </div>
          <h1 className={`text-3xl font-black mb-2 ${isKids ? 'text-slate-900 font-nunito' : 'text-slate-900 tracking-tight'}`}>
            {isKids ? 'Mission Control ⚙️' : 'Therapy Configuration'}
          </h1>
          <p className={`text-lg ${isKids ? 'text-slate-600 font-nunito' : 'text-slate-500'}`}>
            {isKids ? 'Set up your training parameters, Captain!' : 'Customize your visual therapy regimen.'}
          </p>
        </div>

        <div className="p-8 pt-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Eye Selector */}
            <div className="space-y-3">
              <label className={`block text-sm font-bold uppercase tracking-wider ${isKids ? 'text-yellow-700' : 'text-slate-500'}`}>
                {isKids ? '1. Target Eye' : 'Target Eye'}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['left', 'right', 'both'].map((eye) => {
                  const isActive = config.weakEye === eye;
                  return (
                    <button
                      key={eye}
                      type="button"
                      onClick={() => setConfig({ ...config, weakEye: eye })}
                      className={`relative overflow-hidden group py-4 px-2 rounded-2xl border-2 transition-all duration-200 font-bold text-sm sm:text-base ${
                        isActive
                          ? isKids 
                            ? 'border-yellow-400 bg-yellow-50 text-yellow-900 shadow-md transform scale-[1.02]' 
                            : 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md transform scale-[1.02]'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {isActive && <div className={`absolute inset-0 opacity-10 ${isKids ? 'bg-yellow-400' : 'bg-indigo-600'}`} />}
                      <span className="relative z-10 flex flex-col items-center gap-1">
                        <Eye size={20} className={isActive ? (isKids ? 'text-yellow-600' : 'text-indigo-600') : 'text-slate-400'} />
                        {eye === 'both' ? 'Both' : eye.charAt(0).toUpperCase() + eye.slice(1)}
                      </span>
                      {isActive && (
                        <motion.div layoutId="check" className="absolute top-2 right-2">
                          <CheckCircle2 size={14} className={isKids ? 'text-yellow-600' : 'text-indigo-600'} />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Condition Selector */}
            <div className="space-y-3">
              <label className={`block text-sm font-bold uppercase tracking-wider ${isKids ? 'text-yellow-700' : 'text-slate-500'}`}>
                {isKids ? '2. Mission Type' : 'Clinical Condition'}
              </label>
              <div className="relative">
                <select
                  value={config.condition}
                  onChange={(e) => setConfig({ ...config, condition: e.target.value })}
                  className={`w-full appearance-none py-4 px-5 rounded-2xl border-2 bg-white font-medium outline-none transition-all cursor-pointer ${
                    isKids 
                      ? 'border-slate-200 focus:border-yellow-400 text-slate-800' 
                      : 'border-slate-200 focus:border-indigo-500 text-slate-800'
                  }`}
                >
                  <option value="amblyopia">Amblyopia (Lazy Eye)</option>
                  <option value="strabismus">Strabismus (Eye Turn)</option>
                  <option value="convergence">Convergence Insufficiency</option>
                  <option value="tracking">Tracking Disorder</option>
                  <option value="neglect">Spatial Neglect</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <AlertCircle size={20} />
                </div>
              </div>
            </div>

            {/* Difficulty Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className={`block text-sm font-bold uppercase tracking-wider ${isKids ? 'text-yellow-700' : 'text-slate-500'}`}>
                  {isKids ? '3. Challenge Level' : 'Difficulty Level'}
                </label>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  isKids ? 'bg-yellow-100 text-yellow-800' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  Level {config.difficulty}
                </span>
              </div>
              
              <div className="relative h-12 flex items-center">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={config.difficulty}
                  onChange={(e) => setConfig({ ...config, difficulty: parseInt(e.target.value, 10) })}
                  className={`w-full h-3 rounded-full appearance-none cursor-pointer focus:outline-none ${
                    isKids ? 'bg-slate-200 accent-yellow-500' : 'bg-slate-200 accent-indigo-600'
                  }`}
                  style={{
                    background: `linear-gradient(to right, ${isKids ? '#eab308' : '#4f46e5'} 0%, ${isKids ? '#eab308' : '#4f46e5'} ${(config.difficulty - 1) * 11.1}%, #e2e8f0 ${(config.difficulty - 1) * 11.1}%, #e2e8f0 100%)`
                  }}
                />
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wide">
                <span>Beginner</span>
                <span>Advanced</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${
                isKids
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-yellow-200 hover:shadow-yellow-300'
                  : 'bg-slate-900 text-white shadow-slate-300 hover:shadow-slate-400'
              }`}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                isKids ? '🚀 Launch Mission' : 'Save Configuration'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <Home size={16} /> Cancel and Return Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}