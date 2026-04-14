import { useState, useEffect, useRef } from 'react';

export const useSessionTimer = (initialDuration = 1200) => { // 20 minutes = 1200 seconds
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isSessionOver, setIsSessionOver] = useState(false);
  const intervalRef = useRef(null);

  const startTimer = () => {
    setTimeLeft(initialDuration);
    setIsSessionOver(false);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (timeLeft > 0 && !isSessionOver) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsSessionOver(true);
            stopTimer();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      stopTimer();
    }

    return () => stopTimer();
  }, [timeLeft, isSessionOver]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timeLeft,
    isSessionOver,
    formattedTime: formatTime(timeLeft),
    startTimer,
    stopTimer
  };
};
