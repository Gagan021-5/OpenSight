import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const useBackgroundAnimation = (ageGroup) => {
  const isKids = ageGroup === 'kid';

  if (isKids) {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 transition-colors duration-500" />
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/30 dark:bg-white/10 blur-xl"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              x: [null, Math.random() * window.innerWidth],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
            }}
          />
        ))}
      </div>
    );
  }

  // Adult: Minimal, subtle gradient
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 transition-colors duration-500" />
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-indigo-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-purple-500/5 rounded-full blur-3xl" />
    </div>
  );
};
