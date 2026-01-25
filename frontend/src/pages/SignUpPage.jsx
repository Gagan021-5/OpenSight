import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, Mail, Lock, User, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGlobal } from '../context/GlobalContext.jsx';

export default function SignUpPage() {
  const { register } = useGlobal();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [ageGroup, setAgeGroup] = useState('adult');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!email || !password || !name) {
        setError('Please fill in all fields');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      await register({
        email: email.trim(),
        password,
        name: name.trim() || 'User',
        ageGroup,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-surface text-primary placeholder:text-primary-muted/70 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition";

  return (
    <div className="min-h-screen flex">
      {/* Left: abstract graphic */}
      <div className="hidden lg:flex lg:w-[50%] relative bg-gradient-to-br from-[#0d9488] via-[#0f766e] to-[#134e4a] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/3 right-1/4 w-56 h-56 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute bottom-1/4 left-1/3 w-40 h-40 rounded-full bg-[#5eead4]/40 blur-3xl" />
        </div>
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="signup-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#signup-grid)" />
        </svg>
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          <Eye className="w-14 h-14 text-white/90 mb-6" strokeWidth={1.5} />
          <h2 className="text-2xl xl:text-3xl font-bold text-white/95 mb-3">Create your account</h2>
          <p className="text-white/70 text-lg max-w-sm">Join OpenSight and start your vision therapy journey. Free, no credit card.</p>
        </div>
      </div>

      {/* Right: form */}
      <div className="w-full lg:w-[50%] flex items-center justify-center p-6 md:p-10 bg-bg overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md py-4"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Eye className="w-8 h-8 text-primary" />
            <span className="font-semibold text-primary">OpenSight</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">Sign up</h1>
          <p className="text-primary-muted mb-8">Create an account to get started.</p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-muted" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Your name" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-muted" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-2">Password (min 6)</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-muted" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={inputClass} placeholder="••••••••" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-2">I am a</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setAgeGroup('kid')}
                  className={`flex-1 py-3.5 rounded-xl border-2 font-medium transition ${
                    ageGroup === 'kid' ? 'border-[#4f46e5] bg-[#4f46e5]/5 text-[#4f46e5]' : 'border-border text-primary-muted hover:border-border-focus'
                  }`}
                >
                  Kid
                </button>
                <button
                  type="button"
                  onClick={() => setAgeGroup('adult')}
                  className={`flex-1 py-3.5 rounded-xl border-2 font-medium transition ${
                    ageGroup === 'adult' ? 'border-[#4f46e5] bg-[#4f46e5]/5 text-[#4f46e5]' : 'border-border text-primary-muted hover:border-border-focus'
                  }`}
                >
                  Adult
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !email || !password || !name}
              className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] hover:opacity-95 transition shadow-card disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create account'}
            </button>
          </form>

          <p className="mt-8 text-center text-primary-muted text-sm">
            Already have an account? <Link to="/sign-in" className="font-semibold text-[#4f46e5] hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
