import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, User, Settings, LogOut, Moon, Sun, Languages, Menu, X } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext.jsx';
import Chatbot from '../components/Chatbot.jsx';
import { useTranslation } from 'react-i18next';

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout() {
  const { userProfile, logout, ageGroup, visualMode, toggleVisualMode, toggleLanguage } = useGlobal();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isKids = ageGroup === 'kid';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/sign-in');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
      isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100 hover:text-black'
    }`;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white relative overflow-hidden antialiased">
      {/* Sidebar – desktop */}
      <aside className="hidden md:flex md:flex-col md:w-60 md:sticky md:inset-y-0 md:border-r md:border-gray-200 bg-white/80 backdrop-blur-md z-10">
        <div className="p-4 md:p-5 flex items-center gap-2 border-b border-gray-200">
          <img src="/mylogo.jpeg" alt="OpenSight" className="h-6 sm:h-8 w-auto" />
          <span className="font-semibold text-black text-sm sm:text-base">OpenSight</span>
        </div>
        
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={linkClass}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="text-sm sm:text-base">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Toggles in Sidebar */}
        <div className="px-3 py-2 flex items-center justify-between border-t border-gray-200">
            <button 
                onClick={toggleLanguage}
                className="p-2 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 text-sm font-semibold text-indigo-600"
                title="Toggle Language"
            >
                <Languages className="w-5 h-5" />
                {i18n.language === 'hi' ? 'HI' : 'EN'}
            </button>
        </div>

        {/* Sign Out */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition font-medium cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen flex flex-col pb-20 md:pb-0 relative z-10 pointer-events-auto">
        {/* Mobile Header with Toggles */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="flex items-center gap-2">
                <img src="/mylogo.jpeg" alt="OpenSight" className="h-6 w-auto" />
                <span className="font-semibold text-black text-sm">OpenSight</span>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={toggleLanguage}
                    className="p-2 rounded-lg hover:bg-gray-100 transition flex items-center gap-1 text-sm font-semibold text-indigo-600"
                    title="Toggle Language"
                >
                    <Languages className="w-5 h-5" />
                    {i18n.language === 'hi' ? 'HI' : 'EN'}
                </button>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                    {mobileMenuOpen ? <X className="w-5 h-5 text-indigo-600" /> : <Menu className="w-5 h-5 text-indigo-600" />}
                </button>
            </div>
        </div>

        <div className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Bottom tab bar – mobile */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around py-2 px-2 bg-white/90 backdrop-blur-md border-t border-gray-200 safe-area-pb z-30 pointer-events-auto ${mobileMenuOpen ? 'hidden' : ''}`}>
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={linkClass}>
            <Icon className="w-6 h-6" /> <span className="text-xs">{label}</span>
          </NavLink>
        ))}
        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-red-600 font-medium" aria-label="Sign out">
          <LogOut className="w-5 h-5" />
        </button>
      </nav>

      <Chatbot />
    </div>
  );
}
