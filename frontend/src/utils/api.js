import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Create axios instance with default config
 */
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Add auth token to requests
 */
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

/**
 * Auth API calls
 */
export const authAPI = {
  sync: (data = {}) => api.post('/auth/sync', data),
  getMe: () => api.get('/auth/me'),
};

/**
 * User API calls
 */
export const userAPI = {
  updateConfig: (config) => api.patch('/user/config', config),
  getProfile: () => api.get('/user/profile'),
};

/**
 * Score API calls
 */
export const scoreAPI = {
  submit: (gameType, score, duration) => 
    api.post('/scores', { gameType, score, duration }),
  getAll: (limit = 50) => api.get(`/scores?limit=${limit}`),
  getStats: (gameType = null) => 
    api.get(gameType ? `/scores/stats/${gameType}` : '/scores/stats'),
};

export default api;
