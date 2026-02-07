import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// POST /api/verify-glasses
router.post('/verify-glasses', async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'Image data is required'
      });
    }
    
    // Path to Python script
    const scriptPath = path.join(__dirname, '..', 'scripts', 'detect_glasses.py');
    
    // Spawn Python process
    const pythonProcess = spawn('python', [scriptPath, image]);
    
    let result = '';
    let error = '';
    
    // Collect stdout
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    // Collect stderr
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    // Handle process completion
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script error:', error);
        return res.status(500).json({
          success: false,
          error: 'Glasses detection failed',
          details: error
        });
      }
      
      try {
        const parsedResult = JSON.parse(result);
        res.json({
          success: true,
          ...parsedResult
        });
      } catch (parseError) {
        console.error('Failed to parse Python output:', parseError);
        console.error('Raw output:', result);
        res.status(500).json({
          success: false,
          error: 'Failed to process detection result'
        });
      }
    });
    
    // Handle process errors
    pythonProcess.on('error', (err) => {
      console.error('Failed to start Python process:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to start glasses detection'
      });
    });
    
    // Set timeout to prevent hanging
    const timeout = setTimeout(() => {
      pythonProcess.kill('SIGTERM');
      res.status(500).json({
        success: false,
        error: 'Glasses detection timeout'
      });
    }, 10000); // 10 second timeout
    
    pythonProcess.on('close', () => {
      clearTimeout(timeout);
    });
    
  } catch (error) {
    console.error('Glasses verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
