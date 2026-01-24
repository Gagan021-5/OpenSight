import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, User, Settings, LogOut, Eye, Moon, Sun, Languages } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';
import { useBackgroundAnimation } from '../hooks/useBackgroundAnimation';
import Chatbot from '../components/Chatbot';
import { useTranslation } from 'react-i18next';

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/setup', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout() {
  const { userProfile, logout, ageGroup, visualMode, toggleVisualMode, toggleLanguage } = useGlobal();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isKids = ageGroup === 'kid';
  const background = useBackgroundAnimation(ageGroup);

  const handleLogout = () => {
    logout();
    navigate('/sign-in');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
      isActive ? 'bg-[#4f46e5]/10 text-[#4f46e5]' : 'text-primary-muted hover:bg-black/5 hover:text-primary'
    }`;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-transparent relative overflow-hidden">
      {background}
      
      {/* Sidebar – desktop */}
      <aside className="hidden md:flex md:flex-col md:w-60 md:fixed md:inset-y-0 md:border-r md:border-border bg-surface/80 backdrop-blur-md z-10">
        <div className="p-4 md:p-5 flex items-center gap-2 border-b border-border">
          <Eye className="w-8 h-8 text-primary" strokeWidth={1.8} />
          <span className="font-semibold text-primary">OpenSight</span>
        </div>
        
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={linkClass}>
              <Icon className="w-5 h-5" /> {label}
            </NavLink>
          ))}
        </nav>

        {/* Toggles in Sidebar */}
        <div className="px-3 py-2 flex items-center justify-between border-t border-border">
            <button 
                onClick={toggleVisualMode}
                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition"
                title="Toggle Theme"
            >
                {visualMode === 'light' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </button>
            <button 
                onClick={toggleLanguage}
                className="flex items-center gap-1 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition"
                title="Toggle Language"
            >
                <Languages className="w-5 h-5 text-primary dark:text-white" />
                <span className="text-xs font-bold uppercase text-primary dark:text-white">{i18n.language}</span>
            </button>
        </div>

        <div className="p-3 border-t border-border">
          <div className="px-3 py-2 text-sm text-primary-muted truncate">{userProfile?.name || userProfile?.email}</div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl font-medium text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="w-5 h-5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:pl-60 min-h-screen flex flex-col pb-20 md:pb-0 relative z-10">
        {/* Mobile Header with Toggles */}
        <div className="md:hidden flex items-center justify-between p-4 bg-surface/80 backdrop-blur-md border-b border-border">
            <div className="flex items-center gap-2">
                <Eye className="w-6 h-6 text-primary" />
                <span className="font-semibold text-primary">OpenSight</span>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={toggleVisualMode} className="p-2 rounded-full hover:bg-black/5 cursor-pointer">
                    {visualMode === 'light' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-amber-400" />}
                </button>
                <button onClick={toggleLanguage} className="p-2 rounded-full hover:bg-black/5 cursor-pointer">
                    <Languages className="w-5 h-5 text-primary" />
                </button>
            </div>
        </div>

        <div className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Bottom tab bar – mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around py-2 px-2 bg-surface/90 backdrop-blur-md border-t border-border safe-area-pb z-20">
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
