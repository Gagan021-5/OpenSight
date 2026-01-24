import { createContext, useContext, useState } from 'react';

const DevModeContext = createContext();

export const useDevMode = () => {
  const context = useContext(DevModeContext);
  if (!context) {
    throw new Error('useDevMode must be used within DevModeProvider');
  }
  return context;
};

// Mock user profile for development
const mockUserProfile = {
  id: 'dev-user-123',
  clerkId: 'dev-clerk-123',
  email: 'developer@opensight.com',
  name: 'Developer',
  ageGroup: 'adult', // Change to 'kid' to test kids mode
  config: {
    weakEye: 'left',
    condition: 'amblyopia',
    difficulty: 5
  }
};

export const DevModeProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(mockUserProfile);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(mockUserProfile.ageGroup);

  // Mock API functions
  const updateConfig = async (configUpdates) => {
    setUserProfile(prev => ({
      ...prev,
      config: { ...prev.config, ...configUpdates },
      ageGroup: configUpdates.ageGroup || prev.ageGroup
    }));
    setTheme(configUpdates.ageGroup || theme);
    return Promise.resolve({ config: { ...userProfile.config, ...configUpdates } });
  };

  const submitScore = async (gameType, score, duration) => {
    console.log('📊 [DEV] Score submitted:', { gameType, score, duration });
    return Promise.resolve();
  };

  const getStats = async (gameType = null) => {
    console.log('📈 [DEV] Stats requested for:', gameType || 'all games');
    return Promise.resolve({
      totalGames: 10,
      highScore: 500,
      averageScore: 250,
      recentScores: []
    });
  };

  const value = {
    userProfile,
    theme,
    setTheme,
    loading,
    isSignedIn: true, // Always signed in for dev
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
    <DevModeContext.Provider value={value}>
      {children}
    </DevModeContext.Provider>
  );
};
