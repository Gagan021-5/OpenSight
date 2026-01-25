import axios from 'axios';

// 🛑 FORCE PRODUCTION URL
// We are intentionally ignoring import.meta.env to prevent localhost from sneaking in.
const API_BASE = 'https://visionback.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const isAuthRoute = error?.config?.url?.includes('/auth/login') || error?.config?.url?.includes('/auth/register');
    if (status === 401 && !isAuthRoute) {
      localStorage.removeItem('opensight_token');
      delete api.defaults.headers.common['Authorization'];
      const p = window.location?.pathname || '';
      if (p !== '/sign-in' && p !== '/sign-up') {
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

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