/**
 * useTherapyColors – OpenSight three-mode vision therapy system.
 * All games MUST use this hook. No hardcoded colors.
 *
 * @param {string} weakEye - 'left' | 'right' | 'both'
 * @param {number} intensity - 0.0 → 1.0 (opacity for target)
 * @returns {{ target: string, lock: string, background: string }}
 *
 * Clinical: Red/Blue isolate weak eye; Purple forces fusion; Black locks visible to both.
 */
const useTherapyColors = (weakEye, intensity) => {
  const i = intensity == null ? 1 : Math.max(0, Math.min(1, intensity));

  let colors = {
    target: `rgba(255, 0, 0, ${i})`,
    lock: '#0000FF',
    background: '#FFFFFF',
  };

  if (weakEye === 'right') {
    colors = {
      target: `rgba(0, 0, 255, ${i})`,
      lock: '#FF0000',
      background: '#FFFFFF',
    };
  } else if (weakEye === 'both') {
    colors = {
      target: `rgba(128, 0, 128, ${i})`,
      lock: '#000000',
      background: '#FFFFFF',
    };
  }

  return colors;
};

export default useTherapyColors;
