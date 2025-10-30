// Frontend/src/Components/hooks/useTimer.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { plansAPI } from '../services/api';

export const useTimer = (activeTask = null) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerType, setTimerType] = useState('focus'); // 'focus' or 'break'
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [activeSession, setActiveSession] = useState(null);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // Pomodoro settings
  const FOCUS_TIME = 25 * 60; // 25 minutes in seconds
  const BREAK_TIME = 5 * 60; // 5 minutes in seconds

  // Start timer with backend integration
  const startTimer = useCallback(async (task = activeTask, type = timerType) => {
    if (isRunning) return;

    try {
      // If we have a task and it's focus time, start backend timer
      if (task && task.id && task.planId && type === 'focus') {
        const response = await plansAPI.startTimer(task.planId, task.id, { timerType: type });
        setActiveSession({
          taskId: task.id,
          planId: task.planId,
          timeEntry: response.timeEntry
        });
      }

      setIsRunning(true);
      startTimeRef.current = Date.now() - elapsedTime * 1000;
      
      intervalRef.current = setInterval(() => {
        const currentElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedTime(currentElapsed);
        
        // Check if pomodoro session completed
        if (type === 'focus' && currentElapsed >= FOCUS_TIME) {
          completePomodoro();
        } else if (type === 'break' && currentElapsed >= BREAK_TIME) {
          switchToFocus();
        }
      }, 1000);

    } catch (error) {
      console.error('Error starting timer:', error);
      // Fallback: start timer locally even if backend fails
      setIsRunning(true);
      startTimeRef.current = Date.now() - elapsedTime * 1000;
      intervalRef.current = setInterval(() => {
        const currentElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedTime(currentElapsed);
      }, 1000);
    }
  }, [isRunning, elapsedTime, timerType, activeTask]);

  // Stop timer with backend integration
  const stopTimer = useCallback(async () => {
    if (!isRunning) return;

    try {
      // Stop backend timer if we have an active session
      if (activeSession) {
        const response = await plansAPI.stopTimer(activeSession.planId, activeSession.taskId);
        
        // Update local state with backend data
        if (response.task) {
          setPomodoroCount(prev => response.task.completedPomodoros || prev);
        }
        
        setActiveSession(null);
      }

      setIsRunning(false);
      clearInterval(intervalRef.current);
      return elapsedTime;
    } catch (error) {
      console.error('Error stopping timer:', error);
      // Fallback: stop timer locally
      setIsRunning(false);
      clearInterval(intervalRef.current);
      return elapsedTime;
    }
  }, [isRunning, elapsedTime, activeSession]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setElapsedTime(0);
    setActiveSession(null);
    clearInterval(intervalRef.current);
  }, []);

  const completePomodoro = useCallback(async () => {
    const stoppedTime = await stopTimer();
    const newPomodoroCount = pomodoroCount + 1;
    
    setPomodoroCount(newPomodoroCount);
    setTimerType('break');
    setElapsedTime(0);
    
    // Update task pomodoro count in backend
    if (activeTask && activeTask.id && activeTask.planId) {
      try {
        await plansAPI.updateTaskTime(activeTask.planId, activeTask.id, {
          completedPomodoros: newPomodoroCount
        });
      } catch (error) {
        console.error('Error updating pomodoro count:', error);
      }
    }
  }, [stopTimer, pomodoroCount, activeTask]);

  const switchToFocus = useCallback(() => {
    setTimerType('focus');
    setElapsedTime(0);
    resetTimer();
  }, [resetTimer]);

  const switchToBreak = useCallback(() => {
    setTimerType('break');
    setElapsedTime(0);
    resetTimer();
  }, [resetTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isRunning,
    elapsedTime,
    timerType,
    pomodoroCount,
    activeSession,
    startTimer,
    stopTimer,
    resetTimer,
    switchToFocus,
    switchToBreak,
    FOCUS_TIME,
    BREAK_TIME
  };
};