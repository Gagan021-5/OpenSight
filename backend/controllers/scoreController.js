/**
 * Submit game score
 */
export const submitScore = async (req, res) => {
  try {
    const { gameType, score, duration, difficulty } = req.body;
    
    if (!gameType || score === undefined || !duration) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    await req.user.addScore({
      gameType,
      score,
      duration,
      difficulty: difficulty || req.user.config.difficulty
    });
    
    res.status(201).json({ 
      message: 'Score saved',
      score: { gameType, score, duration }
    });
  } catch (error) {
    console.error('Score submission error:', error);
    res.status(500).json({ error: 'Failed to save score' });
  }
};

/**
 * Get user statistics
 */
export const getStats = (req, res) => {
  try {
    const { gameType } = req.params;
    const stats = req.user.getStats(gameType);
    
    if (!stats) {
      return res.json({ message: 'No scores yet' });
    }
    
    res.json({ stats });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
};

/**
 * Get all user scores
 */
export const getScores = (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const scores = req.user.scores.slice(-limit).reverse();
  
  res.json({ scores });
};
