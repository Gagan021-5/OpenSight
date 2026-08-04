/**
 * GlassesDetection — TEMPORARILY BYPASSED
 * ─────────────────────────────────────────────────────────────────
 * All webcam, detection, and warning logic is disabled.
 * The component renders nothing and initializes no camera streams.
 *
 * To re-enable glasses detection in the future, restore this file
 * from git history or remove the early return below.
 * ─────────────────────────────────────────────────────────────────
 */

const GlassesDetection = ({ onGlassesDetected }) => {
  // Auto-signal "glasses detected" so nothing blocks gameplay
  // No webcam, no fetch, no UI — zero friction.
  if (onGlassesDetected) {
    // Fire once on next tick to avoid state-update-during-render warnings
    Promise.resolve().then(() => onGlassesDetected({ wearingGlasses: true, bypassed: true }));
  }

  return null;
};

export default GlassesDetection;