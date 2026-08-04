import express from "express";
// import { spawn } from "child_process";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const visionrouter = express.Router();

/**
 * ─────────────────────────────────────────────────────────────────
 *  GLASSES DETECTION — TEMPORARILY BYPASSED
 * ─────────────────────────────────────────────────────────────────
 *  The Python-based webcam detection (detect_glasses.py) is disabled.
 *  This endpoint now returns an auto-pass response so any legacy
 *  frontend calls won't break — they'll just get a "glasses detected"
 *  result without spawning any Python process.
 *
 *  To re-enable:
 *    1. Uncomment the imports above.
 *    2. Replace this stub with the original spawn-based handler.
 *    3. Ensure mediapipe + opencv-python are installed on the server.
 * ─────────────────────────────────────────────────────────────────
 */
visionrouter.post("/verify-glasses", (req, res) => {
  res.json({
    success: true,
    wearingGlasses: true,
    bypassed: true,
    message: "Glasses detection is temporarily disabled. Auto-passing.",
  });
});

export default visionrouter;
