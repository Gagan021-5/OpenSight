import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Eye, Target, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGlobal } from '../context/GlobalContext';

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
    <div className="max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-bold text-primary mb-2">Profile</h1>
        <p className="text-primary-muted mb-8">Your account and therapy settings.</p>

        <div className="space-y-4">
          {cards.map(({ icon: Icon, label, value }, i) => (
            <div
              key={label}
              className="p-5 rounded-2xl bg-surface border border-border shadow-card flex items-center gap-4"
            >
              {Icon && (
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#4f46e5]/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#4f46e5]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-primary-muted">{label}</div>
                <div className="text-primary font-medium truncate">{value}</div>
              </div>
            </div>
          ))}
        </div>

        <Link
          to="/setup"
          className="mt-8 inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-[#4f46e5] border-2 border-[#4f46e5]/30 hover:bg-[#4f46e5]/5 transition"
        >
          <Settings className="w-5 h-5" /> Edit settings
        </Link>
      </motion.div>
    </div>
  );
}
