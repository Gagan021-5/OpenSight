export const saveGameSession = (gameId, score, duration) => {
  const history = JSON.parse(localStorage.getItem('opensight_history') || '{}');
  const previousBest = history[gameId]?.bestScore || 0;
  
  const sessionData = {
    lastScore: score,
    lastDuration: duration,
    bestScore: Math.max(previousBest, score),
    lastDate: new Date().toLocaleDateString('en-CA')
  };
  
  history[gameId] = sessionData;
  localStorage.setItem('opensight_history', JSON.stringify(history));
  return history[gameId];
};

export const getGameHistory = (gameId) => {
  const history = JSON.parse(localStorage.getItem('opensight_history') || '{}');
  return history[gameId] || null;
};
