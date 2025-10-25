import React from 'react';
import { usePomodoro } from '../hooks/usePomodoro';
import Button from '../ui/Button';

const PomodoroTimer = ({ taskId, estimatedTime, onTimeUpdate }) => {
  const {
    timeLeft,
    isRunning,
    currentSession,
    sessionsCompleted,
    startTimer,
    pauseTimer,
    resetTimer
  } = usePomodoro(25 * 60, 5 * 60);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionColor = () => {
    return currentSession === 'work' ? 'text-red-400' : 'text-green-400';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="text-center">
        <div className={`text-3xl font-mono font-bold ${getSessionColor()} mb-2`}>
          {formatTime(timeLeft)}
        </div>
        
        <div className="text-sm text-gray-400 mb-4">
          {currentSession === 'work' ? 'Work Session' : 'Break Time'} • 
          Sessions: {sessionsCompleted}
        </div>
        
        <div className="flex justify-center space-x-2">
          {!isRunning ? (
            <Button onClick={startTimer} variant="primary" size="sm">
              Start
            </Button>
          ) : (
            <Button onClick={pauseTimer} variant="secondary" size="sm">
              Pause
            </Button>
          )}
          <Button onClick={resetTimer} variant="ghost" size="sm">
            Reset
          </Button>
        </div>
        
        {estimatedTime && (
          <div className="mt-3 text-xs text-gray-500">
            Estimated: {estimatedTime}min
          </div>
        )}
      </div>
    </div>
  );
};

export default PomodoroTimer;