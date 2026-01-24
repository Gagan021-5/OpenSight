import express from 'express';
import { requireAuth } from '@clerk/express';
import { submitScore, getStats, getScores } from '../controllers/scoreController.js';
import { attachUser } from '../middleware/auth.js';

const router = express.Router();

// All score routes require authentication
router.use(requireAuth(), attachUser);

// Submit game score
router.post('/', submitScore);

// Get all user scores
router.get('/', getScores);

// Get user statistics (overall or by game type)
router.get('/stats/:gameType?', getStats);

export default router;
