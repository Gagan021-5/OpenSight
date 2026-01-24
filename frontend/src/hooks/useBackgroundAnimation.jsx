import { motion } from 'framer-motion';

export const useBackgroundAnimation = (ageGroup = 'adult') => {
  const isKid = ageGroup === 'kid';

  if (isKid) {
    // Kids: Fun, cartoonish floating shapes (stars, clouds, rockets, bubbles)
    return (
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Star */}
        <motion.div
          aria-hidden="true"
          className="absolute top-10 left-10 text-yellow-400 text-5xl"
          animate={{ y: [0, 20, 0], rotate: [0, 15, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          ⭐
        </motion.div>
        {/* Cloud */}
        <motion.div
          aria-hidden="true"
          className="absolute top-24 right-20 text-blue-400 text-6xl"
          animate={{ x: [0, 30, 0], y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          ☁️
        </motion.div>
        {/* Rocket */}
        <motion.div
          aria-hidden="true"
          className="absolute bottom-20 left-20 text-red-400 text-5xl"
          animate={{ y: [0, -30, 0], rotate: [-5, 5, -5] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          🚀
        </motion.div>
        {/* Bubble */}
        <motion.div
          aria-hidden="true"
          className="absolute bottom-32 right-16 text-green-400 text-4xl"
          animate={{ y: [0, -40, 0], x: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        >
          🫧
        </motion.div>
        {/* Extra star */}
        <motion.div
          aria-hidden="true"
          className="absolute top-40 right-1/3 text-yellow-300 text-3xl"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          ✨
        </motion.div>
      </div>
    );
  }

  // Adults: Subtle aurora gradient mesh
  const blobA = 'from-indigo-500/25 via-purple-500/20 to-cyan-500/20';
  const blobB = 'from-slate-500/15 via-indigo-500/15 to-fuchsia-500/15';

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
