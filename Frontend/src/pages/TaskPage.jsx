// TaskPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '../MainLayout';
import Toolbar from '../Components/TaskPage/Toolbar';
import TaskList from '../Components/TaskPage/TaskList';
import AddTaskModal from '../Components/TaskPage/AddTaskModal';
import Fab from '../Components/TaskPage/Fab';
import QuickStats from '../Components/TaskPage/QuickStats';
import DailyTimeTracker from '../Components/TaskPage/DailyTimeTracker';
import PomodoroTimer from '../Components/TaskPage/PomodoroTimer';
import { plansAPI } from '../Components/services/api';
import { useTimer } from '../Components/hooks/useTimer';

export default function TaskPage({ username, onLogout }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState({ 
    overdue: [], 
    today: [], 
    upcoming: [], 
    all: [], 
    completed: [] 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [activeTimer, setActiveTimer] = useState(null);
  const [dailyTime, setDailyTime] = useState(0);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showPomodoro, setShowPomodoro] = useState(false);

  // Timer functionality
  const {
    isRunning,
    elapsedTime,
    timerType,
    pomodoroCount,
    startTimer,
    stopTimer,
    resetTimer,
    switchToFocus,
    switchToBreak,
    FOCUS_TIME,
    BREAK_TIME
  } = useTimer(
    // onTimeUpdate
    (currentElapsed) => {
      if (activeTimer) {
        setActiveTimer(prev => ({
          ...prev,
          elapsedTime: currentElapsed
        }));
      }
    },
    // onPomodoroComplete
    (newCount) => {
      if (activeTimer) {
        handlePomodoroComplete(activeTimer.taskId, newCount);
      }
    }
  );

  // Fetch tasks from all plans with proper error handling
  // ---- MODIFIED THIS FUNCTION ----
  const fetchTasks = useCallback(async (isRefresh = false) => {
    try {
      // Only set loading on the *initial* load, not on refreshes
      if (!isRefresh) {
        setLoading(true);
      }
      setError('');
      const plans = await plansAPI.getAll();
      
      const allTasks = [];
      let todayTotalTime = 0;
      
      plans.forEach(plan => {
        if (plan.tasks && Array.isArray(plan.tasks)) {
          plan.tasks.forEach(task => {
            const taskWithPlan = {
              ...task,
              id: task._id || Math.random().toString(36).substr(2, 9),
              planTitle: plan.title,
              planId: plan._id, 
              timeSpent: task.timeSpent || 0,
              completedPomodoros: task.completedPomodoros || 0,
              pomodoroTarget: task.pomodoroTarget || 4,
              completedAt: task.completedAt || null
            };
            
            allTasks.push(taskWithPlan);
            
            // Calculate today's time
            const taskDate = new Date(task.date);
            const today = new Date();
            if (taskDate.toDateString() === today.toDateString()) {
              todayTotalTime += task.timeSpent || 0;
            }
          });
        }
      });

      // Categorize tasks with safety checks
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const categorizedTasks = {
        overdue: allTasks.filter(task => {
          const taskDate = new Date(task.date);
          return taskDate < today && !task.completed;
        }),
        today: allTasks.filter(task => {
          const taskDate = new Date(task.date);
          return taskDate.toDateString() === today.toDateString() && !task.completed;
        }),
        upcoming: allTasks.filter(task => {
          const taskDate = new Date(task.date);
          return taskDate > today && taskDate <= nextWeek && !task.completed;
        }),
        all: allTasks.filter(task => !task.completed),
        completed: allTasks.filter(task => task.completed)
      };

      setTasks(categorizedTasks);
      setDailyTime(todayTotalTime);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try refreshing the page.');
    } finally {
      // Only set loading on the *initial* load
      if (!isRefresh) {
        setLoading(false);
      }
    }
  }, []); // Empty dependency array is correct here

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const openModal = (task = null) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    fetchTasks(true); // <-- MODIFIED: Pass true for refresh
  };

  const handleTaskUpdate = async (planId, taskId, updates) => {
    try {
      console.log('Updating task:', { planId, taskId, updates });
      
      // If task is being completed, set completion time and stop any active timer
      if (updates.completed && !updates.completedAt) {
        updates.completedAt = new Date().toISOString();
        
        // Stop timer if this task was being tracked
        if (activeTimer && activeTimer.taskId === taskId) {
          await handleStopTimer();
        }
      }

      await plansAPI.updateTask(planId, taskId, updates);
      await fetchTasks(true); // <-- MODIFIED: Pass true for refresh
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task');
    }
  };

  const handleTaskDelete = async (planId, taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      // Stop timer if this task was being tracked
      if (activeTimer && activeTimer.taskId === taskId) {
        await handleStopTimer();
      }

      const plan = await plansAPI.getById(planId);
      const updatedTasks = plan.tasks.filter(task => task._id !== taskId);
      await plansAPI.update(planId, { tasks: updatedTasks });
      await fetchTasks(true); // <-- MODIFIED: Pass true for refresh
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
    }
  };

  const handleStartTimer = async (task, timerType = 'focus') => {
    // Stop any existing timer
    if (isRunning) {
      await handleStopTimer();
    }

    setActiveTimer({
      taskId: task.id,
      taskTitle: task.title,
      planId: task.planId,
      startTime: Date.now(),
      elapsedTime: 0,
      timerType: timerType
    });

    // Start the timer
    if (timerType === 'focus') {
      switchToFocus();
    } else {
      switchToBreak();
    }
    startTimer();
  };

  const handleStopTimer = async () => {
    if (!activeTimer || !isRunning) return;

    const timeSpentMinutes = Math.floor(elapsedTime / 60);
    
    if (timeSpentMinutes > 0) {
      const task = findTaskById(activeTimer.taskId);
      
      if (task) {
        const updatedTimeSpent = (task.timeSpent || 0) + timeSpentMinutes;
        
        // Create time entry
        const timeEntry = {
          startTime: new Date(activeTimer.startTime),
          endTime: new Date(),
          duration: timeSpentMinutes,
          type: activeTimer.timerType
        };

        try {
          await plansAPI.updateTaskTime(activeTimer.planId, activeTimer.taskId, {
            timeSpent: updatedTimeSpent,
            timeEntry: timeEntry
          });
        } catch (err) {
          console.error('Error saving time entry:', err);
          setError('Failed to save time data');
        }
      }
    }

    stopTimer();
    setActiveTimer(null);
    resetTimer();
  };

  const handlePomodoroComplete = async (taskId, newCount) => {
    const task = findTaskById(taskId);
    if (task) {
      try {
        await plansAPI.updateTaskTime(task.planId, taskId, {
          completedPomodoros: newCount
        });
        fetchTasks(true); // <-- MODIFIED: Pass true for refresh
      } catch (err) {
        console.error('Error updating pomodoro count:', err);
      }
    }
  };

  const findTaskById = (taskId) => {
    const allTasks = [
      ...(tasks.overdue || []),
      ...(tasks.today || []),
      ...(tasks.upcoming || []),
      ...(tasks.all || []),
      ...(tasks.completed || [])
    ];
    return allTasks.find(task => task.id === taskId);
  };

  const formatTime = (minutes) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Enhanced filtering and sorting with safety checks
  const getFilteredTasks = () => {
    let filteredTasks = tasks[activeView] || [];
    
    // Apply search filter
    if (searchQuery) {
      filteredTasks = filteredTasks.filter(task =>
        task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filteredTasks = filteredTasks.filter(task => 
        task.priority?.toLowerCase() === priorityFilter.toLowerCase()
      );
    }

    // Apply sorting
    filteredTasks = [...filteredTasks].sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority?.toLowerCase()] || 0) - (priorityOrder[a.priority?.toLowerCase()] || 0);
        
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        
        case 'time':
          return (b.timeSpent || 0) - (a.timeSpent || 0);
        
        case 'date':
        default:
          return new Date(a.date || 0) - new Date(b.date || 0);
      }
    });
    
    return filteredTasks;
  };

  if (loading) {
    return (
      <MainLayout username={username} onLogout={onLogout}>
        <div className="flex justify-center items-center min-h-screen bg-gray-950">
          <div className="text-white text-lg flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            Loading tasks...
          </div>
        </div>
      </MainLayout>
    );
  }

  const filteredTasks = getFilteredTasks();

  return (
    <MainLayout username={username} onLogout={onLogout}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <header className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Task Manager
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl">
                  Organize your work and life. Track progress, set priorities, and stay productive.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                {/* Daily Time Tracker */}
                <DailyTimeTracker 
                  dailyTime={dailyTime}
                  activeTimer={activeTimer}
                  onStopTimer={handleStopTimer}
                />
                
                {/* Quick Stats */}
                <QuickStats tasks={tasks} activeView={activeView} />

                {/* Pomodoro Toggle */}
                <button
                  onClick={() => setShowPomodoro(!showPomodoro)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors flex items-center gap-2"
                >
                  <span>🍅</span>
                  {showPomodoro ? 'Hide Timer' : 'Show Timer'}
                </button>
              </div>
            </div>
          </header>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-900/50 border border-red-700 text-red-200 px-6 py-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>{error}</span>
              </div>
              <button 
                onClick={() => setError('')} 
                className="text-red-300 hover:text-white p-1"
              >
                ×
              </button>
            </div>
          )}

          {/* Pomodoro Timer */}
          {showPomodoro && (
            <PomodoroTimer
              isRunning={isRunning}
              elapsedTime={elapsedTime}
              timerType={timerType}
              pomodoroCount={pomodoroCount}
              activeTask={activeTimer}
              onStartTimer={handleStartTimer}
              onStopTimer={handleStopTimer}
              onResetTimer={resetTimer}
              onSwitchToFocus={switchToFocus}
              onSwitchToBreak={switchToBreak}
              FOCUS_TIME={FOCUS_TIME}
              BREAK_TIME={BREAK_TIME}
              tasks={tasks.today || []}
            />
          )}

          {/* Active Timer Display */}
          {activeTimer && isRunning && (
            <div className="mb-6 bg-blue-900/50 border border-blue-700 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-blue-200 text-sm">Currently timing:</p>
                    <p className="text-white font-medium">{activeTimer.taskTitle}</p>
                    <p className="text-blue-300 text-xs">
                      {timerType === 'focus' ? 'Focus Time' : 'Break Time'} • 
                      Pomodoro {pomodoroCount + 1}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-blue-200 font-mono text-lg">
                    {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                  </span>
                  <button
                    onClick={handleStopTimer}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Stop Timer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Task Area */}
          <div className="bg-gray-900/50 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden backdrop-blur-sm">
            <Toolbar 
              onQuickAddClick={() => openModal()}
              activeView={activeView}
              onViewChange={setActiveView}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              priorityFilter={priorityFilter}
              onPriorityFilter={setPriorityFilter}
              sortBy={sortBy}
              onSortBy={setSortBy}
            />
            
            <div className="p-6 lg:p-8">
              <TaskList 
                activeView={activeView}
                tasks={filteredTasks}
                onTaskUpdate={handleTaskUpdate}
                onTaskDelete={handleTaskDelete}
                onTaskEdit={openModal}
                onStartTimer={handleStartTimer}
                onStopTimer={handleStopTimer}
                activeTimer={activeTimer}
                formatTime={formatTime}
                isTimerRunning={isRunning}
              />
            </div>
          </div>
        </div>

        {/* Add/Edit Task Modal */}
        <AddTaskModal 
          isOpen={isModalOpen} 
          onClose={closeModal}
          onTaskAdded={() => fetchTasks(true)} // <-- MODIFIED
          editingTask={editingTask}
        />

        {/* Floating Action Button */}
        <Fab onClick={() => openModal()} />
      </div>
    </MainLayout>
  );
}