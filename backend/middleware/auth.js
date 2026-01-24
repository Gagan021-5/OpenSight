import { getAuth } from '@clerk/express';
import User from '../models/User.js';

/**
 * Middleware to attach MongoDB user to request
 * Must be used after requireAuth() from Clerk
 */
export const attachUser = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Find user in MongoDB by Clerk ID
    req.user = await User.findOne({ clerkId: userId });
    
    if (!req.user) {
      return res.status(404).json({ 
        error: 'User profile not found. Please complete setup.',
        needsSetup: true 
      });
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};
