import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Eye, 
  Target, 
  Settings, 
  Home, 
  Activity,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useGlobal } from '../context/GlobalContext.jsx';

// Animation variants for staggered entrance
const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const InfoCard = ({ icon: Icon, label, value, colorClass }) => (
  <motion.div 
    variants={ITEM_VARIANTS}
    whileHover={{ y: -2 }}
    className="group relative overflow-hidden p-5 rounded-2xl bg-white/60 border border-slate-200/60 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300"
  >
    <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
      <Icon size={48} />
    </div>
    <div className="flex items-center gap-4 relative z-10">
      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${colorClass.replace('text-', 'bg-').replace('500', '100')} ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-slate-900 truncate">{value}</p>
      </div>
    </div>
  </motion.div>
);

export default function ProfilePage() {
  const { userProfile, refreshProfile, weakEye, condition, ageGroup } = useGlobal();

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const isKids = ageGroup === 'kid';

  return (
    <div className={`min-h-screen w-full relative overflow-hidden flex items-center justify-center p-4 sm:p-8 ${isKids ? 'bg-amber-50' : 'bg-slate-50'}`}>
      
      {/* Ambient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className={`absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-30 mix-blend-multiply animate-blob ${isKids ? 'bg-yellow-300' : 'bg-blue-200'}`} />
        <div className={`absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-30 mix-blend-multiply animate-blob animation-delay-2000 ${isKids ? 'bg-orange-300' : 'bg-purple-200'}`} />
      </div>

      <motion.div 
        variants={CONTAINER_VARIANTS}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div 
            variants={ITEM_VARIANTS}
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-xl ${
              isKids 
                ? 'bg-gradient-to-br from-yellow-300 to-orange-400 text-white' 
                : 'bg-gradient-to-br from-slate-800 to-slate-900 text-white'
            }`}
          >
            <User size={40} />
          </motion.div>
          <motion.h1 variants={ITEM_VARIANTS} className={`text-4xl font-black mb-2 ${isKids ? 'text-slate-900 font-nunito' : 'text-slate-900 tracking-tight'}`}>
            {isKids ? 'Your Pilot Profile' : 'Patient Profile'}
          </motion.h1>
          <motion.p variants={ITEM_VARIANTS} className={`text-lg ${isKids ? 'text-slate-600 font-nunito' : 'text-slate-500'}`}>
            Manage your account details and therapy configuration.
          </motion.p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <InfoCard 
            icon={User} 
            label="Full Name" 
            value={userProfile?.name || '—'} 
            colorClass="text-blue-500" 
          />
          <InfoCard 
            icon={Mail} 
            label="Email Address" 
            value={userProfile?.email || '—'} 
            colorClass="text-indigo-500" 
          />
          <InfoCard 
            icon={Target} 
            label="Weak Eye" 
            value={weakEye ? String(weakEye).charAt(0).toUpperCase() + String(weakEye).slice(1) : '—'} 
            colorClass="text-rose-500" 
          />
          <InfoCard 
            icon={Activity} 
            label="Condition" 
            value={condition ? String(condition).replace(/_/g, ' ') : '—'} 
            colorClass="text-emerald-500" 
          />
          <InfoCard 
            icon={Calendar} 
            label="Age Group" 
            value={ageGroup === 'kid' ? 'Pediatric (Kid)' : 'Adult'} 
            colorClass={isKids ? 'text-yellow-600' : 'text-slate-500'} 
          />
        </div>

        {/* Actions */}
        <motion.div variants={ITEM_VARIANTS} className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/setup"
            className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 ${
              isKids
                ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-950 shadow-yellow-200'
                : 'bg-slate-900 text-white shadow-slate-200 hover:bg-slate-800'
            }`}
          >
            <Settings className="w-5 h-5" /> 
            {isKids ? 'Modify Mission' : 'Edit Configuration'}
          </Link>

          <Link
            to="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow-md"
          >
            <Home className="w-5 h-5" /> Back to Home
          </Link>
        </motion.div>

      </motion.div>
    </div>
  );
}