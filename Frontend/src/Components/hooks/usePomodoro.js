//Frontend/src/Components/hooks/usePomodoro.js
import { useState, useEffect, useCallback } from 'react';

export const usePomodoro = (workDuration = 25 * 60, breakDuration = 5 * 60) => {
  const [timeLeft, setTimeLeft] = useState(workDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState('work');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  useEffect(() => {
    let interval;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Session completed
      if (currentSession === 'work') {
        setSessionsCompleted((prev) => prev + 1);
        setCurrentSession('break');
        setTimeLeft(breakDuration);
      } else {
        setCurrentSession('work');
        setTimeLeft(workDuration);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, currentSession, workDuration, breakDuration]);

  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(currentSession === 'work' ? workDuration : breakDuration);
  }, [currentSession, workDuration, breakDuration]);

  return {
    timeLeft,
    isRunning,
    currentSession,
    sessionsCompleted,
    startTimer,
    pauseTimer,
    resetTimer
  };
};