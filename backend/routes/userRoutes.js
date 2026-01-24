import express from 'express';
import { requireAuth } from '@clerk/express';
import { updateConfig, getProfile } from '../controllers/userController.js';
import { attachUser } from '../middleware/auth.js';

const router = express.Router();

// All user routes require authentication
router.use(requireAuth(), attachUser);

// Update user therapy configuration
router.patch('/config', updateConfig);

// Get user profile
router.get('/profile', getProfile);

export default router;
