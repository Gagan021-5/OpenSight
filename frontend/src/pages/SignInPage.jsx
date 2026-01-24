import { useState } from 'react';
import { useSignIn } from '@clerk/clerk-react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, Mail, Lock, Sparkles, Rocket, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const SignInPage = () => {
  const { signIn, setActive } = useSignIn();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('adult'); // 'adult' or 'kid'

  const isKidsMode = theme === 'kid';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard',
      });
    } catch (err) {
      setError('Google sign-in failed');
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${
      isKidsMode 
        ? 'bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-300'
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isKidsMode ? (
          <>
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 20, repeat: Infinity }}
              className="absolute top-10 right-10 text-6xl"
            >
              ⭐
            </motion.div>
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute bottom-20 left-10 text-5xl"
            >
              🚀
            </motion.div>
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-1/2 right-20 text-4xl"
            >
              👀
            </motion.div>
          </>
        ) : (
          <>
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute top-20 left-20 w-64 h-64 bg-indigo-300 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 10, repeat: Infinity, delay: 1 }}
              className="absolute bottom-20 right-20 w-80 h-80 bg-purple-300 rounded-full blur-3xl"
            />
          </>
        )}
      </div>

      {/* Theme Toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setTheme(theme === 'kid' ? 'adult' : 'kid')}
        className={`absolute top-6 right-6 z-20 px-4 py-2 rounded-full font-semibold transition-all ${
          isKidsMode
            ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'
            : 'bg-white/80 backdrop-blur-sm text-indigo-700 hover:bg-white'
        }`}
      >
        {isKidsMode ? '👨 Adult Mode' : '🎮 Kids Mode'}
      </motion.button>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo & Header */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block mb-4"
            >
              {isKidsMode ? (
                <div className="text-7xl">👁️✨</div>
              ) : (
                <Eye className="w-16 h-16 text-indigo-600 mx-auto" />
              )}
            </motion.div>
            
            <h1 className={`text-5xl font-black mb-2 ${
              isKidsMode 
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600'
                : 'text-indigo-900'
            }`}>
              {isKidsMode ? '🚀 OpenSight' : 'OpenSight'}
            </h1>
            <p className={`text-lg ${
              isKidsMode ? 'text-purple-700 font-bold' : 'text-gray-600'
            }`}>
              {isKidsMode ? 'Start Your Vision Adventure! 🎯' : 'Vision Therapy Platform'}
            </p>
          </motion.div>

          {/* Sign In Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className={`p-8 rounded-3xl shadow-2xl backdrop-blur-lg ${
              isKidsMode
                ? 'bg-white/90 border-4 border-yellow-400'
                : 'bg-white/80'
            }`}
          >
            <h2 className={`text-2xl font-bold mb-6 text-center ${
              isKidsMode ? 'text-purple-600' : 'text-gray-800'
            }`}>
              {isKidsMode ? '🎮 Welcome Back, Captain!' : 'Welcome Back'}
            </h2>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-xl mb-4 ${
                  isKidsMode
                    ? 'bg-red-200 border-2 border-red-400 text-red-800'
                    : 'bg-red-50 border border-red-200 text-red-600'
                }`}>
                {error}
              </motion.div>
            )}

            {/* Google Sign In */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 mb-6 transition-all ${
                isKidsMode
                  ? 'bg-gradient-to-r from-blue-400 to-purple-500 text-white hover:from-blue-500 hover:to-purple-600'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isKidsMode ? '⚡ Quick Sign In with Google' : 'Continue with Google'}
            </motion.button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-4 ${
                  isKidsMode ? 'bg-white text-purple-600 font-bold' : 'bg-white text-gray-500'
                }`}>
                  {isKidsMode ? '✨ OR ✨' : 'or'}
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  isKidsMode ? 'text-purple-700' : 'text-gray-700'
                }`}>
                  {isKidsMode ? '📧 Your Email' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    isKidsMode ? 'text-purple-400' : 'text-gray-400'
                  }`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 focus:outline-none focus:ring-4 transition-all ${
                      isKidsMode
                        ? 'border-purple-300 focus:border-purple-500 focus:ring-purple-200 text-lg'
                        : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-100'
                    }`}
                    placeholder={isKidsMode ? 'captain@opensight.com' : 'your.email@example.com'}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  isKidsMode ? 'text-purple-700' : 'text-gray-700'
                }`}>
                  {isKidsMode ? '🔒 Secret Password' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    isKidsMode ? 'text-purple-400' : 'text-gray-400'
                  }`} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 focus:outline-none focus:ring-4 transition-all ${
                      isKidsMode
                        ? 'border-purple-300 focus:border-purple-500 focus:ring-purple-200 text-lg'
                        : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-100'
                    }`}
                    placeholder={isKidsMode ? '••••••••' : 'Enter your password'}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                  isKidsMode
                    ? 'bg-gradient-to-r from-yellow-400 to-pink-500 text-white hover:from-yellow-500 hover:to-pink-600'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                }`}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isKidsMode ? '🚀 Launch!' : 'Sign In'}
                    {!isKidsMode && <ArrowRight className="w-5 h-5" />}
                  </>
                )}
              </motion.button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className={`text-sm ${
                isKidsMode ? 'text-purple-700' : 'text-gray-600'
              }`}>
                {isKidsMode ? "🆕 New Captain?" : "Don't have an account?"}{' '}
                <Link
                  to="/sign-up"
                  className={`font-bold hover:underline ${
                    isKidsMode ? 'text-pink-600' : 'text-indigo-600'
                  }`}
                >
                  {isKidsMode ? 'Join the Crew! 🎮' : 'Sign Up'}
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Features */}
          {isKidsMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 grid grid-cols-3 gap-3 text-center"
            >
              {['🎯 Fun Games', '🏆 Earn Badges', '👀 Train Eyes'].map((feature, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, rotate: 3 }}
                  className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border-2 border-yellow-300 font-bold text-purple-700 text-sm"
                >
                  {feature}
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SignInPage;
