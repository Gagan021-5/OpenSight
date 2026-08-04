/**
 * OpenSight Game Registry
 * ─────────────────────────────────────────────────────────────────────
 * Every game carries explicit metadata:
 *   - category:          'dichoptic' | 'glassless'
 *   - requiresGlasses:   true → enforce webcam glasses detection
 *                         false → bypass detection, render full-color
 *   - therapeuticTarget:  human-readable clinical purpose
 *
 * Condition-based buckets are preserved so the dashboard can still
 * show different game sets based on the user's diagnosed condition.
 * ─────────────────────────────────────────────────────────────────────
 */

export const GAME_REGISTRY = {
  amblyopia: [
    {
      id: 'snake',
      title: 'Dichoptic Snake',
      description: 'Classic snake with red/cyan channel separation to break cortical suppression in the weak eye.',
      path: '/game/snake',
      iconType: 'Gamepad2',
      category: 'dichoptic',
      requiresGlasses: true,
      therapeuticTarget: 'Amblyopia anti-suppression',
    },
    {
      id: 'racing',
      title: 'Dichoptic Racing',
      description: 'Racing game with dichoptic contrast to train binocular fusion and reduce suppression.',
      path: '/game/racing',
      iconType: 'Gamepad2',
      category: 'dichoptic',
      requiresGlasses: true,
      therapeuticTarget: 'Amblyopia anti-suppression',
    },
    {
      id: 'sea',
      title: 'Sea Voyage',
      description: 'Underwater adventure using anaglyph color-filtering for anti-suppression therapy.',
      path: '/game/sea',
      iconType: 'Gamepad2',
      category: 'dichoptic',
      requiresGlasses: true,
      therapeuticTarget: 'Amblyopia anti-suppression',
    },
  ],
  strabismus: [
    {
      id: 'tetris',
      title: 'Therapy Tetris',
      description: 'Anti-suppression Tetris using red/cyan streams to improve binocular eye alignment.',
      path: '/game/tetris',
      iconType: 'Gamepad2',
      category: 'dichoptic',
      requiresGlasses: true,
      therapeuticTarget: 'Anti-suppression alignment',
    },
  ],
  convergence: [
    {
      id: 'convergence',
      title: 'Dynamic Focus',
      description: 'Accommodative rock exercise — targets zoom in and out to flex ciliary muscles and relieve screen fatigue.',
      path: '/game/convergence',
      iconType: 'Target',
      category: 'glassless',
      requiresGlasses: false,
      therapeuticTarget: 'Accommodative flexibility / Digital eye strain relief',
    },
  ],
  tracking: [
    {
      id: 'tracking',
      title: 'Saccadic Precision',
      description: 'Rapid-fire targets flash at random positions to train fast, accurate eye jumps and gaze switching.',
      path: '/game/whack',
      iconType: 'Zap',
      category: 'glassless',
      requiresGlasses: false,
      therapeuticTarget: 'Saccadic rapid eye movement / Gaze precision',
    },
  ],
  neglect: [
    {
      id: 'neglect',
      title: 'Lighthouse Search',
      description: 'Spatial awareness exercise for visual scanning and peripheral attention training.',
      path: '/game/lighthouse',
      iconType: 'Sparkles',
      category: 'glassless',
      requiresGlasses: false,
      therapeuticTarget: 'Visual scanning / Spatial awareness',
    },
  ],
};

// ── Flat lookup index (built once at import time) ─────────────────────
const _gameIndex = {};
Object.values(GAME_REGISTRY)
  .flat()
  .forEach((game) => {
    _gameIndex[game.id] = game;
  });

/**
 * Look up a single game definition by its `id`.
 * Returns the full game object or `null` if not found.
 *
 * @param {string} id - The game id (e.g. 'snake', 'convergence').
 * @returns {object|null}
 */
export function getGameById(id) {
  return _gameIndex[id] || null;
}

// Fallback "General Therapy" list so the dashboard is never empty
const GENERAL_THERAPY_GAMES = [
  _gameIndex['snake'],
  _gameIndex['convergence'],
  _gameIndex['tracking'],
].filter(Boolean);

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
