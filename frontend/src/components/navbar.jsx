import { Link } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl text-white">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">OpenSight</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/sign-in"
            className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/sign-up"
            className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
