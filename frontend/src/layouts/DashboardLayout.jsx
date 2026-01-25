import { useState } from 'react';
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  Settings, 
  LogOut, 
  Languages, 
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useGlobal } from '../context/GlobalContext.jsx';
import Chatbot from '../components/Chatbot.jsx';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/setup', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout() {
  const { logout, ageGroup, toggleLanguage } = useGlobal();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isKids = ageGroup === 'kid';
  const activeColor = isKids ? 'text-yellow-700 bg-yellow-100' : 'text-indigo-600 bg-indigo-50';
  const hoverColor = isKids ? 'hover:bg-yellow-50 hover:text-yellow-900' : 'hover:bg-slate-50 hover:text-slate-900';

  const handleLogout = () => {
    logout();
    navigate('/sign-in');
  };

  return (
    <div className={`min-h-screen flex bg-slate-50 relative overflow-hidden ${isKids ? 'selection:bg-yellow-200' : 'selection:bg-indigo-100'}`}>
      
      {/* --- DESKTOP SIDEBAR --- */}
      {/* Sticky positioning ensures it covers full height even when dashboard scrolls */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 260 }}
        className="hidden md:flex flex-col sticky top-0 h-screen bg-white border-r border-slate-200 z-30 shadow-sm flex-shrink-0 transition-all duration-300 ease-in-out"
      >
        {/* Logo Area - RESTORED */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-slate-100">
          {!isSidebarCollapsed ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex items-center gap-3"
            >
              {/* Using your original logo file */}
              <img 
                src="/mylogo.jpeg" 
                alt="OpenSight" 
                className="h-8 w-auto object-contain" 
              />
              <span className={`font-bold text-lg tracking-tight ${isKids ? 'font-nunito text-slate-800' : 'text-slate-900'}`}>
                OpenSight
              </span>
            </motion.div>
          ) : (
             // Collapsed State Logo (Icon only if you have one, or just the first letter)
             <div className="mx-auto">
               <img 
                src="/mylogo.jpeg" 
                alt="OpenSight" 
                className="h-8 w-auto object-contain" 
              />
             </div>
          )}
          
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to;
            return (
              <NavLink 
                key={to} 
                to={to} 
                className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive ? `${activeColor} font-bold shadow-sm` : `text-slate-500 font-medium ${hoverColor}`
                } ${isSidebarCollapsed ? 'justify-center' : ''}`}
              >
                <Icon size={isSidebarCollapsed ? 24 : 20} strokeWidth={isActive ? 2.5 : 2} />
                
                {!isSidebarCollapsed && (
                  <span className={`${isKids ? 'font-nunito text-base' : 'text-sm'} whitespace-nowrap`}>{label}</span>
                )}

                {/* Tooltip for collapsed state */}
                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
                    {label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 space-y-2 bg-white">
          <button 
            onClick={toggleLanguage}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              isSidebarCollapsed ? 'justify-center' : ''
            } text-slate-500 hover:bg-slate-50 hover:text-indigo-600`}
            title="Switch Language"
          >
            <Languages size={20} />
            {!isSidebarCollapsed && <span className="text-sm font-medium whitespace-nowrap">{i18n.language === 'hi' ? 'Hindi' : 'English'}</span>}
          </button>

          <button 
            onClick={handleLogout}
            className={`w-full flex cursor-pointer items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              isSidebarCollapsed ? 'justify-center' : ''
            } text-red-500 hover:bg-red-50 hover:text-red-600`}
            title="Sign Out"
          >
            <LogOut size={20} />
            {!isSidebarCollapsed && <span className="text-sm font-medium whitespace-nowrap">Log Out</span>}
          </button>
        </div>
      </motion.aside>


      {/* --- MOBILE HEADER & CONTENT --- */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Mobile Top Bar */}
        <div className="md:hidden flex-shrink-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 h-16 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <img src="/mylogo.jpeg" alt="OpenSight" className="h-6 w-auto" />
              <span className={`font-bold text-lg ${isKids ? 'font-nunito text-slate-800' : 'text-slate-900'}`}>OpenSight</span>
           </div>
           
           <div className="flex gap-2">
             <button onClick={toggleLanguage} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
               <Languages size={20} />
             </button>
           </div>
        </div>

        {/* Main Content Area - SCROLLABLE */}
        <main className="flex-1 relative overflow-y-auto overflow-x-hidden scroll-smooth">
          <Outlet />
          {/* Spacer for mobile bottom nav */}
          <div className="h-24 md:h-0" />
        </main>

        {/* Mobile Bottom Tab Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 pb-safe z-50 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
             const isActive = location.pathname === to;
             return (
               <NavLink 
                 key={to} 
                 to={to} 
                 className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                   isActive 
                     ? isKids ? 'text-yellow-600' : 'text-indigo-600' 
                     : 'text-slate-400 hover:text-slate-600'
                 }`}
               >
                 <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'transform -translate-y-1 transition-transform' : ''} />
                 <span className="text-[10px] font-bold">{label}</span>
               </NavLink>
             )
          })}
          <button 
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 p-2 text-slate-300 hover:text-red-500 transition-colors"
          >
            <LogOut size={24} />
            <span className="text-[10px] font-bold">Exit</span>
          </button>
        </div>

      </div>
      
      <Chatbot />
    </div>
  );
}