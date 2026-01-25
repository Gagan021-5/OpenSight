import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen flex">
      {/* Left: abstract graphic (hidden on small screens) */}
      <div className="hidden lg:flex lg:w-[50%] relative bg-gradient-to-br from-primary via-[#334155] to-[#0f172a] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-secondary/40 blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-[#7c3aed]/30 blur-3xl" />
        </div>
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="auth-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-grid)" />
        </svg>
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          <Eye className="w-14 h-14 text-white/90 mb-6" strokeWidth={1.5} />
          <h2 className="text-2xl xl:text-3xl font-bold text-white/95 mb-3">OpenSight</h2>
          <p className="text-white/70 text-lg max-w-sm">Vision therapy, in the browser. Sign in to continue your sessions.</p>
        </div>
      </div>

      {/* Right: form */}
      <div className="w-full lg:w-[50%] flex items-center justify-center p-6 md:p-10 bg-bg">
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Eye className="w-8 h-8 text-primary" />
            <span className="font-semibold text-primary">OpenSight</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">Welcome back</h1>
          <p className="text-primary-muted mb-8">Sign in to your account to continue.</p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-surface text-primary placeholder:text-primary-muted/70 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-surface text-primary placeholder:text-primary-muted/70 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] hover:opacity-95 transition shadow-card disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-primary-muted text-sm">
            Don&apos;t have an account?{' '}
            <Link to="/sign-up" className="font-semibold text-[#4f46e5] hover:underline">Sign up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
