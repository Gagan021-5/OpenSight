import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, userAPI, gameAPI, setAuthToken } from '../utils/api.js';
import i18n from '../i18n.js';

const GlobalContext = createContext();

export const useGlobal = () => {
  const c = useContext(GlobalContext);
  if (!c) throw new Error('useGlobal must be used within GlobalProvider');
  return c;
};

const TOKEN_KEY = 'opensight_token';

export const GlobalProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    return savedToken ? { token: savedToken } : null;
  });
  const [loading, setLoading] = useState(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    return !!savedToken;
  });
  const [theme, setTheme] = useState('adult');

  const loginWithToken = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    setAuthToken(token);
    setUserProfile(user);
    setTheme(user?.ageGroup || 'adult');
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
      setTheme(data.user.ageGroup || 'adult');
    } catch (e) {
      console.warn('Failed to load profile');
      // Optional: Clear token if invalid, but usually better to keep for retry
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Wrappers to expose the API through context if needed
  const register = async (formData) => {
    setLoading(true);
    try {
      const { data } = await authAPI.register(formData);
      loginWithToken(data.token, data.user);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await authAPI.login(email, password);
      loginWithToken(data.token, data.user);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setUserProfile(null);
    setTheme('adult');
    // Force reload to clear any memory states or redirect
    window.location.href = '/'; 
  };

  const updateConfig = async (config) => {
    try {
      setUserProfile((prevUser) => ({
        ...prevUser,
        config: { ...prevUser.config, ...config }
      }));
      const { data } = await userAPI.updateConfig(config);
      if (data.config) {
        setUserProfile((prevUser) => ({
          ...prevUser,
          config: { ...prevUser.config, ...data.config }
        }));
      }
      return data;
    } catch (error) {
      await loadProfile();
      throw error;
    }
  };

  const toggleLanguage = () => {
    const next = i18n.language === 'hi' ? 'en' : 'hi';
    i18n.changeLanguage(next);
  };

  const submitScore = async (game, score, duration) => {
    if (!userProfile) return;
    await gameAPI.submitScore(game, score, duration);
  };

  return (
    <GlobalContext.Provider
      value={{
        userProfile,
        isSignedIn: !!userProfile,
        loading,
        theme,
        ageGroup: theme,
        setTheme,
        weakEye: userProfile?.config?.weakEye || 'left',
        condition: userProfile?.config?.condition || 'amblyopia',
        difficulty: userProfile?.config?.difficulty ?? 5,
        register,
        login,
        logout,
        updateConfig,
        refreshProfile: loadProfile,
        checkAuth: loadProfile, // 🟢 FIX: Added this alias so SignInPage works!
        toggleLanguage,
        submitScore,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};