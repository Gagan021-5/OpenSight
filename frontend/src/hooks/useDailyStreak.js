import { useState, useEffect } from 'react';

export default function useDailyStreak() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // 1. Get today's date as a simple string (e.g., "2025-01-25")
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
    
    // 2. Retrieve stored values
    const storedStreak = parseInt(localStorage.getItem('opensight_streak') || '0', 10);
    const lastLogin = localStorage.getItem('opensight_last_login');

    // 3. Helper to get yesterday's date string
    const getYesterday = () => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d.toLocaleDateString('en-CA');
    };

    const yesterday = getYesterday();

    if (lastLogin === today) {
      // Case A: User already logged in today -> Keep current streak
      setStreak(storedStreak || 1);
    } 
    else if (lastLogin === yesterday) {
      // Case B: User logged in yesterday -> Increment streak
      const newStreak = storedStreak + 1;
      localStorage.setItem('opensight_streak', newStreak);
      localStorage.setItem('opensight_last_login', today);
      setStreak(newStreak);
    } 
    else {
      // Case C: Broken streak or first visit -> Reset to 1
      const newStreak = 1;
      localStorage.setItem('opensight_streak', 1);
      localStorage.setItem('opensight_last_login', today);
      setStreak(1);
    }
  }, []);

  return streak;
}
