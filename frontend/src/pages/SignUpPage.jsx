import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Loader2, ArrowRight, ArrowLeft, Baby, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGlobal } from '../context/GlobalContext.jsx';

export default function SignUpPage() {
  const { register } = useGlobal();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    ageGroup: 'adult' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.email || !formData.password || !formData.name) {
        throw new Error('Please fill in all fields');
      }
      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      await register({
        ...formData,
        email: formData.email.trim(),
        name: formData.name.trim()
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium";

  return (
    <div className="min-h-screen flex bg-white font-sans selection:bg-indigo-100">
      {/* Left: Brand Side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-indigo-900">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-purple-500/30 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] mix-blend-screen" />
        </div>
        
        <div className="relative z-10 w-full flex flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-3 w-fit group">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md group-hover:bg-white/20 transition-colors">
              <ArrowLeft size={20} />
            </div>
            <span className="font-medium opacity-80 group-hover:opacity-100 transition-opacity">Back to Home</span>
          </Link>

          <div className="space-y-6 max-w-lg">
            {/* Custom Logo Restored */}
            <img 
              src="/mylogo.jpeg" 
              alt="OpenSight Logo" 
              className="h-20 w-auto rounded-xl shadow-lg border border-white/10"
            />

            <h2 className="text-4xl font-bold tracking-tight">Start your journey to better vision.</h2>
            <ul className="space-y-4 text-indigo-100 text-lg">
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/50 flex items-center justify-center text-xs">✓</div>
                Clinically inspired games
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/50 flex items-center justify-center text-xs">✓</div>
                Progress tracking & analytics
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/50 flex items-center justify-center text-xs">✓</div>
                Always free & open source
              </li>
            </ul>
          </div>

          <div className="text-sm text-indigo-200/60">
            By signing up, you agree to our Terms and Privacy Policy.
          </div>
        </div>
      </div>

      {/* Right: Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left">
            <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-8 text-slate-500 font-medium">
              <ArrowLeft size={18} /> Back
            </Link>

            {/* Mobile Logo */}
            <div className="lg:hidden mb-6 flex justify-center">
               <img src="/mylogo.jpeg" alt="Logo" className="h-12 w-auto" />
            </div>

            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h1>
            <p className="mt-2 text-slate-500">
              Already have an account? <Link to="/sign-in" className="font-bold text-indigo-600 hover:text-indigo-700">Sign in</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Min. 6 characters"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-bold text-slate-700 mb-3">Who is this for?</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, ageGroup: 'kid' }))}
                  className={`relative p-4 rounded-xl border-2 transition-all text-left flex flex-col gap-2 ${
                    formData.ageGroup === 'kid'
                      ? 'border-yellow-400 bg-yellow-50 text-yellow-900 ring-1 ring-yellow-400'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Baby size={24} className={formData.ageGroup === 'kid' ? 'text-yellow-600' : 'text-slate-400'} />
                  <span className="font-bold">A Child</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, ageGroup: 'adult' }))}
                  className={`relative p-4 rounded-xl border-2 transition-all text-left flex flex-col gap-2 ${
                    formData.ageGroup === 'adult'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <UserCheck size={24} className={formData.ageGroup === 'adult' ? 'text-indigo-600' : 'text-slate-400'} />
                  <span className="font-bold">Myself (Adult)</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold text-lg shadow-xl shadow-slate-200 hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>Create Account <ArrowRight size={20} /></>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}