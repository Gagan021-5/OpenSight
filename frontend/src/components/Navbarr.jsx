import { Link } from 'react-router-dom';
import { Menu, X, Languages, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

export default function Navbarr() {
  const { i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    const next = i18n.language === 'hi' ? 'en' : 'hi';
    i18n.changeLanguage(next);
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 py-3 shadow-sm' 
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo Section - Custom Image Restored */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/mylogo.jpeg" 
              alt="OpenSight" 
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105" 
            />
            <span className="font-bold text-slate-900 text-xl tracking-tight">OpenSight</span>
          </Link>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors uppercase tracking-wider"
            >
              <Languages size={18} />
              {i18n.language === 'hi' ? 'HI' : 'EN'}
            </button>

            <div className="h-6 w-px bg-slate-200 mx-2" />

            <Link
              to="/sign-in"
              className="text-sm font-bold text-slate-600 hover:text-slate-900 px-4 py-2 transition-colors"
            >
              Log in
            </Link>

            <Link
              to="/sign-up"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 hover:shadow-xl hover:-translate-y-0.5"
            >
              Get Started <ArrowRight size={16} />
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
            className="fixed top-[70px] left-0 right-0 z-40 bg-white border-b border-slate-200 md:hidden shadow-xl overflow-hidden"
          >
            <div className="p-6 space-y-4">
              <Link
                to="/sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-3 px-4 rounded-xl bg-slate-50 text-slate-900 font-bold text-center hover:bg-slate-100 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/sign-up"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-3 px-4 rounded-xl bg-slate-900 text-white font-bold text-center hover:bg-slate-800 transition-colors shadow-lg"
              >
                Get Started
              </Link>
              
              <div className="border-t border-slate-100 pt-4 mt-4 flex justify-center">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 text-slate-700 font-bold text-sm uppercase"
                >
                  <Languages size={18} />
                  Switch to {i18n.language === 'hi' ? 'English' : 'Hindi'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}