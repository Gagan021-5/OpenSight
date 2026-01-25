import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGlobal } from '../context/GlobalContext.jsx';

export default function SignInPage() {
  const { login } = useGlobal();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }
      await login(email.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans selection:bg-indigo-100">
      {/* Left: Brand Side (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
        </div>
        
        <div className="relative z-10 w-full flex flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-3 w-fit group">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md group-hover:bg-white/20 transition-colors">
              <ArrowLeft size={20} />
            </div>
            <span className="font-medium opacity-80 group-hover:opacity-100 transition-opacity">Back to Home</span>
          </Link>

          <div className="space-y-6 max-w-lg">
            <img 
              src="/mylogo.jpeg" 
              alt="OpenSight Logo" 
              className="h-20 w-auto rounded-xl shadow-2xl shadow-indigo-500/20"
            />
            
            <h2 className="text-4xl font-bold tracking-tight">Welcome back to OpenSight.</h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              Your personalized vision therapy dashboard is ready. Continue your progress and track your improvements today.
            </p>
          </div>

          <div className="flex gap-4 text-sm text-slate-500">
            <span>© 2025 OpenSight</span>
            <span>•</span>
            <Link to="#" className="hover:text-slate-300">Privacy</Link>
            <Link to="#" className="hover:text-slate-300">Terms</Link>
          </div>
        </div>
      </div>

      {/* Right: Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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

            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sign in</h1>
            <p className="mt-2 text-slate-500">
              New here? <Link to="/sign-up" className="font-bold text-indigo-600 hover:text-indigo-700">Create an account</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Forgot Password Link Removed */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm text-slate-600 font-medium">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl cursor-pointer bg-slate-900 text-white font-bold text-lg shadow-xl shadow-slate-200 hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={20} /></>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}