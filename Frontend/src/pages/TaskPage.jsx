import React, { useState, useEffect } from 'react';
import MainLayout from '../MainLayout';
import Toolbar from '../Components/TaskPage/Toolbar';
import TaskList from '../Components/TaskPage/TaskList';
import AddTaskModal from '../Components/TaskPage/AddTaskModal';
import Fab from '../Components/TaskPage/Fab';
import QuickStats from '../Components/TaskPage/QuickStats';
import DailyTimeTracker from '../Components/TaskPage/DailyTimeTracker';
import { plansAPI } from '../Components/services/api';

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
  const [elapsedTime, setElapsedTime] = useState(0); // NEW: Track elapsed time

  // Timer effect to update elapsed time every second
  useEffect(() => {
    let interval;
    if (activeTimer) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - activeTimer.startTime) / 1000 / 60));
      }, 1000); // Update every second
    } else {
      setElapsedTime(0);
    }
    
    return () => clearInterval(interval);
  }, [activeTimer]);

  // Fetch tasks from all plans
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const plans = await plansAPI.getAll();
      
      // Extract and categorize tasks from all plans
      const allTasks = [];
      
      plans.forEach(plan => {
        if (plan.tasks && Array.isArray(plan.tasks)) {
          plan.tasks.forEach(task => {
            allTasks.push({
              ...task,
              id: task._id || Math.random().toString(36).substr(2, 9),
              planTitle: plan.title,
              planId: plan._id,
              // Ensure time tracking fields exist
              timeSpent: task.timeSpent || 0,
              completedAt: task.completedAt || null
            });
          });
        }
      });

      // Categorize tasks by date
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
      calculateDailyTime(categorizedTasks.today);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const calculateDailyTime = (todayTasks) => {
    const totalTime = todayTasks.reduce((sum, task) => sum + (task.timeSpent || 0), 0);
    setDailyTime(totalTime);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const openModal = (task = null) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    fetchTasks();
  };

  const handleTaskUpdate = async (planId, taskId, updates) => {
    try {
      // If task is being completed, set completion time and stop any active timer
      if (updates.completed && !updates.completedAt) {
        updates.completedAt = new Date().toISOString();
        
        // Stop timer if this task was being tracked
        if (activeTimer && activeTimer.taskId === taskId) {
          setActiveTimer(null);
        }
      }

      await plansAPI.updateTask(planId, taskId, updates);
      fetchTasks();
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
        setActiveTimer(null);
      }

      const plan = await plansAPI.getById(planId);
      const updatedTasks = plan.tasks.filter(task => task._id !== taskId);
      await plansAPI.update(planId, { tasks: updatedTasks });
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
    }
  };

  const handleStartTimer = (task) => {
    // Stop any existing timer
    if (activeTimer) {
      handleStopTimer();
    }

    setActiveTimer({
      taskId: task.id,
      taskTitle: task.title,
      planId: task.planId,
      startTime: Date.now()
    });
  };

  const handleStopTimer = async () => {
    if (!activeTimer) return;

    const timeSpent = Math.floor((Date.now() - activeTimer.startTime) / 1000 / 60); // Convert to minutes
    const task = findTaskById(activeTimer.taskId);
    
    if (task) {
      const updatedTimeSpent = (task.timeSpent || 0) + timeSpent;
      await handleTaskUpdate(activeTimer.planId, activeTimer.taskId, {
        timeSpent: updatedTimeSpent
      });
    }

    setActiveTimer(null);
    setElapsedTime(0); // Reset elapsed time
  };

  const findTaskById = (taskId) => {
    const allTasks = [...tasks.overdue, ...tasks.today, ...tasks.upcoming, ...tasks.all, ...tasks.completed];
    return allTasks.find(task => task.id === taskId);
  };

  // Enhanced filtering and sorting
  const getFilteredTasks = () => {
    let filteredTasks = tasks[activeView] || [];
    
    // Apply search filter
    if (searchQuery) {
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
          return a.title.localeCompare(b.title);
        
        case 'time':
          return (b.timeSpent || 0) - (a.timeSpent || 0);
        
        case 'date':
        default:
          return new Date(a.date) - new Date(b.date);
      }
    });
    
    return filteredTasks;
  };

  const formatTime = (minutes) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
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
              </div>
            </div>
          </header>

          {error && (
            <div className="mb-6 bg-red-900/50 border border-red-700 text-red-200 px-6 py-4 rounded-xl flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError('')} className="text-red-300 hover:text-white">
                ×
              </button>
            </div>
          )}

          {/* Active Timer Display */}
          {activeTimer && (
            <div className="mb-6 bg-blue-900/50 border border-blue-700 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-blue-200 text-sm">Currently timing:</p>
                    <p className="text-white font-medium">{activeTimer.taskTitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-blue-200 font-mono text-lg">
                    {formatTime(elapsedTime)} {/* Use elapsedTime state instead of direct calculation */}
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
              />
            </div>
          </div>
        </div>

        {/* Add/Edit Task Modal */}
        <AddTaskModal 
          isOpen={isModalOpen} 
          onClose={closeModal}
          onTaskAdded={fetchTasks}
          editingTask={editingTask}
        />

        {/* Floating Action Button */}
        <Fab onClick={() => openModal()} />
      </div>
    </MainLayout>
  );
}