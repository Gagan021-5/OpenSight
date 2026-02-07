import express from "express";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const visionrouter = express.Router(); // Fixed variable name

// POST /verify-glasses (The server.js likely handles the /api prefix)
visionrouter.post("/verify-glasses", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: "Image data is required",
      });
    }

    const scriptPath = path.join(
      __dirname,
      "..",
      "scripts",
      "detect_glasses.py",
    );

    const pythonProcess = spawn("python", [scriptPath]);

    let result = "";
    let error = "";

    // 1. Send the huge image string via Standard Input (stdin)
    pythonProcess.stdin.write(image);
    pythonProcess.stdin.end(); // Tell Python we are done sending data

    // 2. Collect stdout (The JSON result from Python)
    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    // 3. Collect stderr (Python errors)
    pythonProcess.stderr.on("data", (data) => {
      error += data.toString();
    });

    // 4. Handle process completion
    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("Python script error log:", error);
        return res.status(500).json({
          success: false,
          error: "Glasses detection failed",
          details: error || "Unknown Python error",
        });
      }

      try {
        // Parse the JSON printed by Python
        const parsedResult = JSON.parse(result);
        res.json({
          success: true,
          ...parsedResult,
        });
      } catch (parseError) {
        console.error("Failed to parse Python output:", parseError);
        console.error("Raw output received:", result);
        res.status(500).json({
          success: false,
          error: "Failed to process detection result",
        });
      }
    });

    // Handle startup errors
    pythonProcess.on("error", (err) => {
      console.error("Failed to start Python process:", err);
      res.status(500).json({
        success: false,
        error: "Failed to start glasses detection system",
      });
    });
  } catch (error) {
    console.error("Glasses verification error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

export default visionrouter;
