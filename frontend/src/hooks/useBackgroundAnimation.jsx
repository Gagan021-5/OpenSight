import { motion } from 'framer-motion';

export const useBackgroundAnimation = (ageGroup = 'adult') => {
  const isKid = ageGroup === 'kid';

  const blobA = isKid
    ? 'from-yellow-300/40 via-sky-300/30 to-violet-300/30'
    : 'from-indigo-500/25 via-purple-500/20 to-cyan-500/20';

  const blobB = isKid
    ? 'from-emerald-300/30 via-amber-300/25 to-pink-300/25'
    : 'from-slate-500/15 via-indigo-500/15 to-fuchsia-500/15';

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <motion.div
        aria-hidden="true"
        className={`absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-gradient-to-br ${blobA} blur-3xl`}
        animate={{
          x: [0, 40, -20, 0],
          y: [0, 10, 30, 0],
          scale: [1, 1.08, 0.98, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        aria-hidden="true"
        className={`absolute -bottom-28 -right-28 h-[520px] w-[520px] rounded-full bg-gradient-to-br ${blobB} blur-3xl`}
        animate={{
          x: [0, -30, 20, 0],
          y: [0, -20, -10, 0],
          scale: [1, 0.98, 1.06, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(79,70,229,0.10),transparent_55%),radial-gradient(circle_at_75%_80%,rgba(124,58,237,0.10),transparent_60%)]"
      />
    </div>
  );
};
