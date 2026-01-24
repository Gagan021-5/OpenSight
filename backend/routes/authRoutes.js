import express from 'express';
import { requireAuth } from '@clerk/express';
import { syncUser, getCurrentUser } from '../controllers/authController.js';
import { attachUser } from '../middleware/auth.js';

const router = express.Router();

// Sync Clerk user to MongoDB (creates profile if doesn't exist)
router.post('/sync', requireAuth(), syncUser);

// Get current user profile
router.get('/me', requireAuth(), attachUser, getCurrentUser);

export default router;
