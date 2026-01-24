import { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { authAPI, userAPI, scoreAPI, setAuthToken } from '../utils/api';

const GlobalContext = createContext();

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobal must be used within GlobalProvider');
  }
  return context;
};

export const GlobalProvider = ({ children }) => {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('adult'); // 'kid' or 'adult'

  // Sync user profile when Clerk user loads
  useEffect(() => {
    const syncUserProfile = async () => {
      if (!isLoaded) return;
      
      if (!isSignedIn) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      try {
        // Get Clerk session token
        const token = await clerkUser.getToken();
        setAuthToken(token);
        
        // Check if user exists in MongoDB, create if not
        const response = await authAPI.sync();

        const profile = response.data.user;
        setUserProfile(profile);
        setTheme(profile.ageGroup || 'adult');
      } catch (error) {
        console.error('Failed to sync user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    syncUserProfile();
  }, [isLoaded, isSignedIn, clerkUser]);

  // Update user config in MongoDB
  const updateConfig = async (configUpdates) => {
    if (!isSignedIn) return;

    try {
      const token = await clerkUser.getToken();
      setAuthToken(token);
      
      const response = await userAPI.updateConfig(configUpdates);

      setUserProfile(prev => ({
        ...prev,
        ...response.data.user
      }));

      return response.data.user.config;
    } catch (error) {
      console.error('Failed to update config:', error);
      throw error;
    }
  };

  // Submit game score
  const submitScore = async (gameType, score, duration) => {
    if (!isSignedIn || !userProfile) return;

    try {
      const token = await clerkUser.getToken();
      setAuthToken(token);
      
      await scoreAPI.submit(gameType, score, duration);
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  };

  // Get user statistics
  const getStats = async (gameType = null) => {
    if (!isSignedIn) return null;

    try {
      const token = await clerkUser.getToken();
      setAuthToken(token);
      
      const response = await scoreAPI.getStats(gameType);

      return response.data.stats;
    } catch (error) {
      console.error('Failed to get stats:', error);
      return null;
    }
  };

  const value = {
    userProfile,
    theme,
    setTheme,
    loading,
    isSignedIn,
    updateConfig,
    submitScore,
    getStats,
    // Convenience getters
    weakEye: userProfile?.config?.weakEye || 'left',
    condition: userProfile?.config?.condition || 'amblyopia',
    difficulty: userProfile?.config?.difficulty || 5,
    ageGroup: userProfile?.ageGroup || 'adult'
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
};
