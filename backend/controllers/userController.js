/**
 * GET /user/profile
 */
export const getProfile = (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      ageGroup: req.user.ageGroup,
      config: req.user.config,
      createdAt: req.user.createdAt,
    },
  });
};

/**
 * PATCH /user/config
 * Body: { weakEye?, condition?, difficulty?, ageGroup? }
 */
export const updateConfig = async (req, res) => {
  try {
    const { weakEye, condition, difficulty, ageGroup } = req.body;
    if (weakEye) req.user.config.weakEye = weakEye;
    if (condition) req.user.config.condition = condition;
    if (difficulty !== undefined) req.user.config.difficulty = Number(difficulty);
    if (ageGroup) req.user.ageGroup = ageGroup;
    await req.user.save();
    res.json({
      message: 'Config updated',
      user: { ageGroup: req.user.ageGroup, config: req.user.config },
    });
  } catch (err) {
    console.error('Config update error:', err);
    res.status(500).json({ error: 'Update failed' });
  }
};
