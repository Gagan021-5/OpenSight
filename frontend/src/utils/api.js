import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => api.post('/auth/login', { email, password }),
};

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateConfig: (config) => api.patch('/user/config', config),
};

export const gameAPI = {
  submitScore: (game, score, duration) =>
    api.post('/game/score', { game, score, duration }),
  getHistory: (limit = 50) => api.get(`/game/history?limit=${limit}`),
};

export default api;
