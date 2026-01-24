import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { submitScore, getHistory } from '../controllers/gameController.js';

const router = express.Router();

router.use(requireAuth);

router.post('/score', submitScore);
router.get('/history', getHistory);

export default router;
