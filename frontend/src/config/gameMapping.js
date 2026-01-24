export const gameMapping = {
  amblyopia: [
    { id: 'snake', name: 'Snake Hunt', path: '/game/snake', description: 'Classic snake game adapted for dichoptic therapy.' },
    { id: 'racing', name: 'Speed Racer', path: '/game/racing', description: 'High-speed racing game to train reaction time.' },
    { id: 'sea', name: 'Sea Voyage', path: '/game/sea', description: 'Explore the ocean depths with contrast balanced visuals.' }
  ],
  strabismus: [
    { id: 'tetris', name: 'Therapy Tetris', path: '/game/tetris', description: 'Align blocks to improve eye teaming and fusion.' }
  ],
  convergence: [
    { id: 'convergence', name: 'Zooming Target', path: '/game/convergence', description: 'Focus on moving targets to train convergence.' }
  ],
  tracking: [
    { id: 'whack', name: 'Whack-a-Target', path: '/game/whack', description: 'Fast-paced target tracking exercise.' }
  ],
  neglect: [
    { id: 'lighthouse', name: 'Lighthouse', path: '/game/lighthouse', description: 'Scan the screen to find the lighthouse beam.' }
  ],
  // Fallback for general or undefined conditions
  general: [
    { id: 'snake', name: 'Snake Hunt', path: '/game/snake', description: 'Classic snake game.' },
    { id: 'tetris', name: 'Therapy Tetris', path: '/game/tetris', description: 'Block alignment game.' }
  ]
};

export const getGamesForCondition = (condition) => {
  const normalizedCondition = condition?.toLowerCase() || 'general';
  return gameMapping[normalizedCondition] || gameMapping['general'];
};
