/**
 * POST /game/score
 * Body: { game, score, duration }
 */
export const submitScore = async (req, res) => {
  try {
    const { game, score, duration } = req.body;
    if (!game || score === undefined || duration === undefined) {
      return res.status(400).json({ error: 'Missing required fields: game, score, duration' });
    }
    await req.user.addScore(String(game), Number(score), Number(duration));
    res.status(201).json({ message: 'Score saved', score: { game, score, duration } });
  } catch (err) {
    console.error('Score submission error:', err);
    res.status(500).json({ error: 'Failed to save score' });
  }
};

/**
 * GET /game/history
 * Query: limit (optional)
 */
export const getHistory = (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 200);
  const scores = req.user.scores.slice(-limit).reverse();
  res.json({ scores });
};
