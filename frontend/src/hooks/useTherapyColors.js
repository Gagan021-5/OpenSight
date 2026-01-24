/**
 * useTherapyColors Hook
 * 
 * Core logic for OpenSight's three-mode vision therapy system.
 * Returns appropriate colors based on the user's weak eye configuration.
 * 
 * @param {string} weakEye - 'left' | 'right' | 'both'
 * @param {number} intensity - 0.0 to 1.0 (opacity for target)
 * @returns {object} { target, lock, background }
 */
const useTherapyColors = (weakEye, intensity = 1.0) => {
  // Ensure intensity is between 0 and 1
  const clampedIntensity = Math.max(0, Math.min(1, intensity));

  // DEFAULT: LEFT WEAK (Target Red, Lock Blue)
  let colors = {
    target: `rgba(255, 0, 0, ${clampedIntensity})`, // Red - Visible to Left Eye
    lock: '#0000FF', // Blue - Visible to Right Eye
    background: '#FFFFFF'
  };

  if (weakEye === 'right') {
    // RIGHT WEAK (Target Blue, Lock Red)
    colors = {
      target: `rgba(0, 0, 255, ${clampedIntensity})`, // Blue - Visible to Right Eye
      lock: '#FF0000', // Red - Visible to Left Eye
      background: '#FFFFFF'
    };
  } else if (weakEye === 'both') {
    // BOTH WEAK (Fusion Mode)
    // Purple appears dark to BOTH eyes through red/blue glasses
    // This forces binocular fusion
    colors = {
      target: `rgba(128, 0, 128, ${clampedIntensity})`, // Purple
      lock: '#000000', // Black (High contrast lock visible to both)
      background: '#FFFFFF'
    };
  }

  return colors;
};

export default useTherapyColors;
