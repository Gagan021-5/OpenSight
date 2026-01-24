import { Link, useLocation } from 'react-router-dom';
import { Eye, Moon, Sun, Languages, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobal } from '../context/GlobalContext';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { visualMode, toggleVisualMode, toggleLanguage } = useGlobal();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <header className="relative z-50 flex items-center justify-between px-6 py-4 md:px-12 md:py-6 bg-transparent">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg group-hover:scale-105 transition-transform">
            <Eye className="w-6 h-6" strokeWidth={2} />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">OpenSight</span>
      </Link>

      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-2 p-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button 
            onClick={toggleVisualMode}
            className="p-2 rounded-full hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-all cursor-pointer"
            aria-label="Toggle Theme"
            >
            {visualMode === 'light' ? <Moon className="w-5 h-5 text-slate-600" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </button>
            <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
            <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-all cursor-pointer"
            aria-label="Toggle Language"
            >
            <Languages className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">{i18n.language}</span>
            </button>
        </div>
        
        {!location.pathname.includes('dashboard') && (
          <div className="flex items-center gap-4 ml-4">
            <Link
              to="/sign-in"
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              {t('landing.signIn')}
            </Link>
            <Link
              to="/sign-up"
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5"
            >
              {t('landing.getStarted')}
            </Link>
          </div>
        )}
      </nav>

      {/* Mobile Menu Button */}
      <button 
        className="md:hidden p-2 text-slate-600 dark:text-slate-300"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl p-6 flex flex-col gap-6 md:hidden"
          >
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Settings</span>
                <div className="flex gap-4">
                    <button onClick={toggleVisualMode} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                        {visualMode === 'light' ? <Moon className="w-5 h-5 text-slate-600" /> : <Sun className="w-5 h-5 text-amber-400" />}
                    </button>
                    <button onClick={toggleLanguage} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <Languages className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        <span className="uppercase font-bold text-slate-700 dark:text-white">{i18n.language}</span>
                    </button>
                </div>
            </div>
            
            {!location.pathname.includes('dashboard') && (
                <div className="flex flex-col gap-3">
                    <Link
                    to="/sign-in"
                    className="w-full py-3 text-center rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-white"
                    >
                    {t('landing.signIn')}
                    </Link>
                    <Link
                    to="/sign-up"
                    className="w-full py-3 text-center rounded-xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-500/20"
                    >
                    {t('landing.getStarted')}
                    </Link>
                </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
