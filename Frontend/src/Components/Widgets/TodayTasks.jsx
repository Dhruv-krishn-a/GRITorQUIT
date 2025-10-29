import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Clock, Calendar, Play, Square, Pause, RotateCcw } from 'lucide-react';

export default function TodayTasks({ 
  tasks = [], 
  totalTasks = 0,
  containerWidth = 0,
  containerHeight = 0,
  isCompact = false,
  onTaskComplete = () => {},
  onTimerUpdate = () => {}
}) {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    setPendingTasks(tasks.filter(task => !task.completed));
  }, [tasks]);

  const completedTasks = tasks.filter(task => task.completed).length;
  const completionPercentage = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // Pomodoro timer logic
  useEffect(() => {
    let interval;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev >= 25 * 60) { // 25 minutes
            handleTimerComplete();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const startTimer = (taskId) => {
    setActiveTimer(taskId);
    setTimerSeconds(0);
    setTimerRunning(true);
  };

  const pauseTimer = () => {
    setTimerRunning(false);
  };

  const resumeTimer = () => {
    setTimerRunning(true);
  };

  const stopTimer = () => {
    setTimerRunning(false);
    setActiveTimer(null);
    setTimerSeconds(0);
  };

  const handleTimerComplete = () => {
    setTimerRunning(false);
    if (activeTimer) {
      onTimerUpdate(activeTimer, 25); // 25 minutes worked
    }
    // You could add a break timer here
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTaskComplete = (taskId) => {
    onTaskComplete(taskId);
    if (activeTimer === taskId) {
      stopTimer();
    }
  };

  if (isCompact || containerWidth < 400) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-blue-500" />
            <span className="text-sm font-medium">Today</span>
          </div>
          <div className="flex items-center gap-2">
            {activeTimer && (
              <div className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                {formatTime(timerSeconds)}
              </div>
            )}
            <span className="text-lg font-bold">{tasks.length}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          {pendingTasks.slice(0, 3).map((task, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => handleTaskComplete(task.id)}
                className="flex-shrink-0"
              >
                <Circle size={14} className="text-gray-400 hover:text-green-500 transition-colors" />
              </button>
              <span className="text-sm truncate flex-1">{task.title}</span>
              {activeTimer === task.id ? (
                <button 
                  onClick={timerRunning ? pauseTimer : resumeTimer}
                  className="flex-shrink-0 p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  {timerRunning ? <Square size={10} /> : <Play size={10} />}
                </button>
              ) : (
                <button 
                  onClick={() => startTimer(task.id)}
                  className="flex-shrink-0 p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  <Play size={10} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary with Timer */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white">
        <div>
          <div className="text-2xl font-bold">{tasks.length}</div>
          <div className="text-sm opacity-90">Tasks Today</div>
        </div>
        
        {activeTimer && (
          <div className="text-center">
            <div className="text-2xl font-bold font-mono">{formatTime(timerSeconds)}</div>
            <div className="text-sm opacity-90">Pomodoro Timer</div>
          </div>
        )}
        
        <div className="text-right">
          <div className="text-2xl font-bold">{completionPercentage}%</div>
          <div className="text-sm opacity-90">Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{completedTasks}/{tasks.length}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Timer Controls */}
      {activeTimer && (
        <div className="flex justify-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <button
            onClick={timerRunning ? pauseTimer : resumeTimer}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all ${
              timerRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {timerRunning ? <Pause size={16} /> : <Play size={16} />}
            {timerRunning ? 'Pause' : 'Resume'}
          </button>
          <button
            onClick={stopTimer}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Square size={16} />
            Stop
          </button>
          <button
            onClick={() => setTimerSeconds(0)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {pendingTasks.length > 0 ? (
          pendingTasks.map((task, index) => (
            <div 
              key={index} 
              className={`flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border transition-all ${
                activeTimer === task.id 
                  ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
              }`}
            >
              <button 
                onClick={() => handleTaskComplete(task.id)}
                className="flex-shrink-0 group"
              >
                <Circle 
                  size={18} 
                  className="text-gray-400 group-hover:text-green-500 transition-colors" 
                />
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{task.title}</div>
                {task.planTitle && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {task.planTitle}
                  </div>
                )}
                {task.estimatedTime && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Estimated: {Math.floor(task.estimatedTime / 60)}h {task.estimatedTime % 60}m
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                {task.actualTime > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Clock size={12} />
                    <span>{Math.floor(task.actualTime / 60)}h {task.actualTime % 60}m</span>
                  </div>
                )}
                
                {activeTimer === task.id ? (
                  <button 
                    onClick={timerRunning ? pauseTimer : resumeTimer}
                    className={`p-2 rounded-full text-white transition-all ${
                      timerRunning 
                        ? 'bg-yellow-500 hover:bg-yellow-600' 
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    {timerRunning ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                ) : (
                  <button 
                    onClick={() => startTimer(task.id)}
                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                  >
                    <Play size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <CheckCircle2 size={32} className="mx-auto mb-2 opacity-50" />
            <div className="text-sm">No tasks for today</div>
            <div className="text-xs mt-1">Great job! You're all caught up.</div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {tasks.length > 0 && (
        <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={() => pendingTasks.forEach(task => handleTaskComplete(task.id))}
            className="flex-1 py-2 px-3 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
          >
            Complete All
          </button>
          <button className="flex-1 py-2 px-3 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors">
            Add Task
          </button>
        </div>
      )}
    </div>
  );
}