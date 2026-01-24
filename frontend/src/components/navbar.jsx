import { Link } from 'react-router-dom';
import { Menu, X, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export default function Navbar() {
  const { i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const next = i18n.language === 'hi' ? 'en' : 'hi';
    i18n.changeLanguage(next);
  };

  const navLinks = [
    { to: '/sign-in', label: 'Sign in', mobileOnly: false },
    { to: '/sign-up', label: 'Get Started', mobileOnly: false },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/mylogo.jpeg" alt="OpenSight" className="h-8 w-auto" />
            <span className="font-bold text-black text-lg sm:text-xl">OpenSight</span>
          </Link>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
            {/* Language Toggle */}
            <motion.button
              onClick={toggleLanguage}
              className="p-2 rounded-full  cursor-pointer hover:bg-gray-100 transition flex items-center gap-1"
              aria-label="Toggle language"
              whileTap={{ scale: 0.9 }}
            >
              <Languages className="w-5 h-5 text-gray-700" />
              <span className="text-xs font-bold uppercase text-gray-700">
                {i18n.language === 'hi' ? 'HI' : 'EN'}
              </span>
            </motion.button>

            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-sm font-semibold transition-colors bg-gray-50 cursor-pointer ${
                  label === 'Get Started'
                    ? 'px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
                    : 'text-gray-700 hover:text-purple-600'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-b border-gray-200 md:hidden overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {/* Mobile Language Toggle */}
              <div className="flex items-center justify-around py-3 border-b border-gray-200">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <Languages className="w-5 h-5" />
                  <span>{i18n.language === 'hi' ? 'HI' : 'EN'}</span>
                </button>
              </div>

              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full text-center py-3 rounded-xl font-semibold transition cursor-pointer ${
                    label === 'Get Started'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
