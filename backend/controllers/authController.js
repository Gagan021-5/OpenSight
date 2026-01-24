import { getAuth } from '@clerk/express';
import { clerkClient } from '@clerk/express';
import User from '../models/User.js';

/**
 * Sync Clerk user to MongoDB
 * Creates user profile if doesn't exist
 */
export const syncUser = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { ageGroup, config } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      // Get Clerk user data
      const clerkUser = await clerkClient.users.getUser(userId);
      
      // Create new user profile
      user = new User({
        clerkId: userId,
        email: clerkUser.emailAddresses[0].emailAddress,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
        ageGroup: ageGroup || 'adult',
        config: config || {
          weakEye: 'left',
          condition: 'amblyopia',
          difficulty: 5
        }
      });
      
      await user.save();
    }
    
    res.status(200).json({
      user: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        name: user.name,
        ageGroup: user.ageGroup,
        config: user.config
      }
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      clerkId: req.user.clerkId,
      email: req.user.email,
      name: req.user.name,
      ageGroup: req.user.ageGroup,
      config: req.user.config
    }
  });
};
