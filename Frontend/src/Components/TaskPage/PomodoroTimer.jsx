//Frontend/src/Components/TaskPage/PomodoroTimer.jsx
import React, { useState } from 'react';
import { Play, Square, RotateCcw, Clock, Target } from 'lucide-react';

const PomodoroTimer = ({
  isRunning,
  elapsedTime,
  timerType,
  pomodoroCount,
  activeTask,
  onStartTimer,
  onStopTimer,
  onResetTimer,
  onSwitchToFocus,
  onSwitchToBreak,
  FOCUS_TIME,
  BREAK_TIME,
  tasks
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const currentTime = timerType === 'focus' ? FOCUS_TIME : BREAK_TIME;
  const remainingTime = currentTime - elapsedTime;
  const progress = (elapsedTime / currentTime) * 100;

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  const handleStart = () => {
    if (!selectedTaskId && timerType === 'focus') {
      alert('Please select a task for focus time');
      return;
    }

    const task = tasks.find(t => t.id === selectedTaskId);
    if (task) {
      onStartTimer(task, timerType);
    } else if (timerType === 'break') {
      onStartTimer({ id: 'break', title: 'Break Time' }, 'break');
    }
  };

  const getTimerColor = () => {
    if (timerType === 'focus') {
      if (progress > 75) return 'text-red-400';
      if (progress > 50) return 'text-orange-400';
      return 'text-green-400';
    }
    return 'text-blue-400';
  };

  const getProgressColor = () => {
    if (timerType === 'focus') {
      if (progress > 75) return 'bg-red-500';
      if (progress > 50) return 'bg-orange-500';
      return 'bg-green-500';
    }
    return 'bg-blue-500';
  };

  return (
    <div className="mb-6 bg-gray-800/80 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        {/* Timer Circle */}
        <div className="relative">
          <div className="w-48 h-48 rounded-full border-4 border-gray-600 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getTimerColor()} mb-2`}>
                {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
              </div>
              <div className="text-gray-400 text-sm uppercase">
                {timerType === 'focus' ? 'Focus Time' : 'Break Time'}
              </div>
              <div className="text-gray-500 text-xs mt-1">
                Pomodoro {pomodoroCount + 1}
              </div>
            </div>
          </div>
          
          {/* Progress Ring */}
          <div 
            className="absolute inset-0 rounded-full border-4 border-transparent"
            style={{
              background: `conic-gradient(${getProgressColor().replace('bg-', '')} ${progress}%, transparent 0%)`
            }}
          />
        </div>

        {/* Controls and Info */}
        <div className="flex-1 space-y-4">
          {/* Session Type */}
          <div className="flex gap-2">
            <button
              onClick={onSwitchToFocus}
              className={`px-4 py-2 rounded-lg transition-all ${
                timerType === 'focus' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Focus ({Math.floor(FOCUS_TIME / 60)}min)
            </button>
            <button
              onClick={onSwitchToBreak}
              className={`px-4 py-2 rounded-lg transition-all ${
                timerType === 'break' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Break ({Math.floor(BREAK_TIME / 60)}min)
            </button>
          </div>

          {/* Task Selection (only for focus time) */}
          {timerType === 'focus' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Task for Focus Session
              </label>
              <select
                value={selectedTaskId || ''}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Choose a task...</option>
                {tasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.title} {task.completedPomodoros > 0 && `(${task.completedPomodoros}🍅)`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Timer Controls */}
          <div className="flex gap-3">
            {!isRunning ? (
              <button
                onClick={handleStart}
                disabled={timerType === 'focus' && !selectedTaskId}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play size={20} />
                Start {timerType === 'focus' ? 'Focus' : 'Break'}
              </button>
            ) : (
              <button
                onClick={onStopTimer}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                <Square size={20} />
                Stop
              </button>
            )}
            
            <button
              onClick={onResetTimer}
              className="flex items-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <RotateCcw size={20} />
              Reset
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Target size={16} />
              <span>{pomodoroCount} pomodoros completed</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{Math.floor((pomodoroCount * FOCUS_TIME) / 60)}min focused</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;