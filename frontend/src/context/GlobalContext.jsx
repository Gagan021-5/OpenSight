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
const VISUAL_MODE_KEY = 'opensight_visual_mode';

export const GlobalProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(() => {
    // Check localStorage IMMEDIATELY during initialization
    const savedToken = localStorage.getItem(TOKEN_KEY);
    return savedToken ? { token: savedToken } : null;
  });
  const [loading, setLoading] = useState(() => {
    // Only loading if we have a token to verify
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
    } catch {
      // If API fails, keep the token-based user state for navigation
      // Don't clear token on network errors
      console.warn('Failed to load profile, keeping token for navigation');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const register = async (formData) => {
    setLoading(true);
    try {
      const { data } = await authAPI.register(formData);
      if (!data?.token || !data?.user) {
        throw new Error('Registration response missing token or user');
      }
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
      if (!data?.token || !data?.user) {
        throw new Error('Login response missing token or user');
      }
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
  };

  const updateConfig = async (config) => {
    try {
      // 1. CRITICAL: Update Local State immediately (Optimistic Update)
      setUserProfile((prevUser) => ({
        ...prevUser,
        config: { ...prevUser.config, ...config }
      }));

      // 2. Call Backend to persist changes
      const { data } = await userAPI.updateConfig(config);
      
      // 3. Optional: Sync with server response if needed (for validation/defaults)
      if (data.config) {
        setUserProfile((prevUser) => ({
          ...prevUser,
          config: { ...prevUser.config, ...data.config }
        }));
      }
      
      return data;
    } catch (error) {
      console.error('Config update failed, reverting optimistic update:', error);
      // Revert optimistic update on error
      await loadProfile(); // Reload from server to get accurate state
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
        loginWithToken,
        logout,
        updateConfig,
        refreshProfile: loadProfile,
        toggleLanguage,
        submitScore,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
