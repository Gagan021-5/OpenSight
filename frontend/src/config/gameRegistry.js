import {
  Gamepad2,
  Target,
  Zap,
  Sparkles,
  CheckCircle2,
  Menu,
  X,
  Github,
} from 'lucide-react';

export const GAME_REGISTRY = {
  amblyopia: [
    {
      id: 'snake',
      title: 'Dichoptic Snake',
      description: 'Classic snake with red/blue filters to train the weak eye.',
      path: '/game/snake',
      iconType: 'Gamepad2',
    },
    {
      id: 'racing',
      title: 'Dichoptic Racing',
      description: 'Racing game with dichoptic contrast for lazy eye therapy.',
      path: '/game/racing',
      iconType: 'Gamepad2',
    },
    {
      id: 'sea',
      title: 'Sea Voyage',
      description: 'Underwater adventure with vision therapy mechanics.',
      path: '/game/sea',
      iconType: 'Gamepad2',
    },
  ],
  strabismus: [
    {
      id: 'tetris',
      title: 'Therapy Tetris',
      description: 'Anti-suppression Tetris to improve eye alignment.',
      path: '/game/tetris',
      iconType: 'Gamepad2',
    },
  ],
  convergence: [
    {
      id: 'convergence',
      title: 'Zooming Target',
      description: 'Focus exercises to improve convergence ability.',
      path: '/game/convergence',
      iconType: 'Target',
    },
  ],
  tracking: [
    {
      id: 'tracking',
      title: 'Whack-a-Target',
      description: 'Tracking and reaction training for eye coordination.',
      path: '/game/whack',
      iconType: 'Zap',
    },
  ],
  neglect: [
    {
      id: 'neglect',
      title: 'Lighthouse Search',
      description: 'Spatial awareness game for neglect therapy.',
      path: '/game/lighthouse',
      iconType: 'Sparkles',
    },
  ],
};

// Fallback “General Therapy” list so the dashboard is never empty
const GENERAL_THERAPY_GAMES = [
  {
    id: 'snake',
    title: 'Dichoptic Snake',
    description: 'Classic snake with red/blue filters to train the weak eye.',
    path: '/game/snake',
    iconType: 'Gamepad2',
  },
  {
    id: 'convergence',
    title: 'Zooming Target',
    description: 'Focus exercises to improve convergence ability.',
    path: '/game/convergence',
    iconType: 'Target',
  },
  {
    id: 'whack',
    title: 'Whack-a-Target',
    description: 'Tracking and reaction training for eye coordination.',
    path: '/game/whack',
    iconType: 'Zap',
  },
];

/**
 * Get the list of games for a given condition.
 * Normalizes the condition string and falls back to GENERAL_THERAPY_GAMES if unknown.
 * @param {string} condition - The condition string from the backend.
 * @returns {Array} Array of game objects.
 */
export function getGamesForCondition(condition) {
  if (!condition || typeof condition !== 'string') {
    return GENERAL_THERAPY_GAMES;
  }
  const normalized = condition.toLowerCase().trim();
  // Handle cases like "Lazy Eye (Amblyopia)" by extracting the keyword
  const matched = Object.keys(GAME_REGISTRY).find((key) =>
    normalized.includes(key)
  );
  return GAME_REGISTRY[matched] || GENERAL_THERAPY_GAMES;
}
