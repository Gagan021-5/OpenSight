/**
 * Update user therapy configuration
 */
export const updateConfig = async (req, res) => {
  try {
    const { weakEye, condition, difficulty, ageGroup } = req.body;
    
    if (weakEye) req.user.config.weakEye = weakEye;
    if (condition) req.user.config.condition = condition;
    if (difficulty !== undefined) req.user.config.difficulty = difficulty;
    if (ageGroup) req.user.ageGroup = ageGroup;
    
    await req.user.save();
    
    res.json({ 
      message: 'Config updated',
      user: {
        ageGroup: req.user.ageGroup,
        config: req.user.config
      }
    });
  } catch (error) {
    console.error('Config update error:', error);
    res.status(500).json({ error: 'Update failed' });
  }
};

/**
 * Get user profile
 */
export const getProfile = (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      clerkId: req.user.clerkId,
      email: req.user.email,
      name: req.user.name,
      ageGroup: req.user.ageGroup,
      config: req.user.config,
      createdAt: req.user.createdAt
    }
  });
};
