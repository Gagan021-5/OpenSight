import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, userAPI, gameAPI, setAuthToken } from '../utils/api';
import i18n from '../i18n'; // Ensure this is imported

const GlobalContext = createContext();

export const useGlobal = () => {
  const c = useContext(GlobalContext);
  if (!c) throw new Error('useGlobal must be used within GlobalProvider');
  return c;
};

const TOKEN_KEY = 'opensight_token';

export const GlobalProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  // ageGroupTheme tracks 'kid' vs 'adult' UI style
  const [ageGroupTheme, setAgeGroupTheme] = useState('adult');
  
  // visualMode tracks 'light' vs 'dark'
  const [visualMode, setVisualMode] = useState(() => localStorage.getItem('theme') || 'light');

  // Sync visualMode with DOM and localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (visualMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', visualMode);
  }, [visualMode]);

  const toggleVisualMode = () => {
    setVisualMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang);
  };

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUserProfile(null);
      setLoading(false);
      return;
    }
    setAuthToken(token);
    try {
      const { data } = await userAPI.getProfile();
      setUserProfile(data.user);
      setAgeGroupTheme(data.user.ageGroup || 'adult');
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setAuthToken(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const login = async (email, password) => {
    const { data } = await authAPI.login(email, password);
    localStorage.setItem(TOKEN_KEY, data.token);
    setAuthToken(data.token);
    setUserProfile(data.user);
    setAgeGroupTheme(data.user.ageGroup || 'adult');
    return data.user;
  };

  const register = async (body) => {
    const { data } = await authAPI.register(body);
    localStorage.setItem(TOKEN_KEY, data.token);
    setAuthToken(data.token);
    setUserProfile(data.user);
    setAgeGroupTheme(data.user.ageGroup || 'adult');
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setUserProfile(null);
  };

  const updateConfig = async (updates) => {
    const { data } = await userAPI.updateConfig(updates);
    setUserProfile((p) => ({ ...p, ...data.user }));
    if (updates.ageGroup) setAgeGroupTheme(updates.ageGroup);
    return data.user?.config;
  };

  const submitScore = async (game, score, duration) => {
    if (!userProfile) return;
    await gameAPI.submitScore(game, score, duration);
  };

  const getHistory = async (limit = 50) => {
    const { data } = await gameAPI.getHistory(limit);
    return data.scores;
  };

  const refreshProfile = useCallback(async () => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) return;
    setAuthToken(t);
    try {
      const { data } = await userAPI.getProfile();
      setUserProfile(data.user);
      setAgeGroupTheme(data.user.ageGroup || 'adult');
    } catch {
      /* keep existing */
    }
  }, []);

  const value = {
    userProfile,
    // Theme for Age Group (Kids/Adults)
    theme: ageGroupTheme, 
    setTheme: setAgeGroupTheme,
    // Theme for Visual Mode (Dark/Light)
    visualMode,
    toggleVisualMode,
    toggleLanguage,
    // Auth & User
    loading,
    isSignedIn: !!userProfile,
    login,
    register,
    logout,
    updateConfig,
    submitScore,
    getHistory,
    refreshProfile,
    weakEye: userProfile?.config?.weakEye || 'left',
    condition: userProfile?.config?.condition || 'amblyopia',
    difficulty: userProfile?.config?.difficulty ?? 5,
    ageGroup: userProfile?.ageGroup || 'adult',
  };

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};
