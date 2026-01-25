import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Eye, Target, Settings, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGlobal } from '../context/GlobalContext.jsx';

export default function ProfilePage() {
  const { userProfile, refreshProfile, weakEye, condition, ageGroup } = useGlobal();

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const cards = [
    { icon: User, label: 'Name', value: userProfile?.name || '—' },
    { icon: Mail, label: 'Email', value: userProfile?.email || '—' },
    { icon: Target, label: 'Weak eye', value: weakEye ? String(weakEye).charAt(0).toUpperCase() + String(weakEye).slice(1) : '—' },
    { icon: Eye, label: 'Condition', value: condition ? String(condition).replace(/_/g, ' ') : '—' },
    { icon: null, label: 'Age group', value: ageGroup === 'kid' ? 'Kid' : 'Adult' },
  ];

  return (
    <div className="max-w-2xl bg-white antialiased p-3">
      <motion.div className='space-x-1.5' initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}>
        <h1 className="text-2xl font-black text-black mb-2">Profile</h1>
        <p className="text-gray-700 mb-8">Your account and therapy settings.</p>

        <div className="space-y-4">
          {cards.map(({ icon: Icon, label, value }, i) => (
            <div
              key={label}
              className="p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-gray-200/60 shadow-card flex items-center gap-4"
            >
              {Icon && (
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-indigo-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-600">{label}</div>
                <div className="text-black font-medium truncate">{value}</div>
              </div>
            </div>
          ))}
        </div>

        <Link
          to="/setup"
          className="mt-8 inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-indigo-600 border-2 border-indigo-200 hover:bg-indigo-50 transition cursor-pointer"
        >
          <Settings className="w-5 h-5 " /> Edit settings
        </Link>

        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-gray-600 border-2 border-gray-200 hover:bg-gray-100 transition cursor-pointer"
        >
          <Home className="w-5 h-5 " /> Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
