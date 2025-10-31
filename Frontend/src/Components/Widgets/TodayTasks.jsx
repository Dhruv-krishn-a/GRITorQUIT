import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  Play, 
  Square, 
  Pause, 
  RotateCcw,
  Plus,
  Target
} from 'lucide-react';

function TodayTasks({ 
  tasks = [], 
  totalTasks = 0,
  containerWidth = 0,
  containerHeight = 0,
  isCompact = false,
  isSmall = false,
  onTaskComplete = () => {},
  onTimerUpdate = () => {},
  onAddTask = () => {}
}) {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    // Filter and sort tasks: incomplete first, then by priority and due time
    const todayTasks = tasks.filter(task => {
      if (task.completed) return false;
      
      const taskDate = new Date(task.dueDate || task.date);
      const today = new Date();
      return taskDate.toDateString() === today.toDateString();
    }).sort((a, b) => {
      // Sort by priority first (high > medium > low)
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority?.toLowerCase()] || 0;
      const bPriority = priorityOrder[b.priority?.toLowerCase()] || 0;
      
      if (bPriority !== aPriority) return bPriority - aPriority;
      
      // Then sort by due time
      return new Date(a.dueDate || a.date) - new Date(b.dueDate || b.date);
    });
    
    setPendingTasks(todayTasks);
  }, [tasks]);

  const completedTasks = tasks.filter(task => task.completed).length;
  const completionPercentage = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // Timer logic
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

  const pauseTimer = () => setTimerRunning(false);
  const resumeTimer = () => setTimerRunning(true);

  const stopTimer = () => {
    setTimerRunning(false);
    setActiveTimer(null);
    setTimerSeconds(0);
  };

  const resetTimer = () => {
    setTimerSeconds(0);
  };

  const handleTimerComplete = () => {
    setTimerRunning(false);
    if (activeTimer) {
      onTimerUpdate(activeTimer, 25); // 25 minutes worked
      // Optional: Show completion notification
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTaskComplete = (taskId, e) => {
    e?.stopPropagation();
    onTaskComplete(taskId);
    if (activeTimer === taskId) {
      stopTimer();
    }
  };

  const getPriorityColor = (priority) => {
    const priorityLower = priority?.toLowerCase();
    switch (priorityLower) {
      // --- THEME ---
      // Use opacity instead of hard-coded light/dark colors. This works on any background.
      case 'high': return 'text-red-600 bg-red-500/10';
      case 'medium': return 'text-yellow-600 bg-yellow-500/10';
      case 'low': return 'text-green-600 bg-green-500/10';
      default: return 'text-[var(--text-secondary)] bg-[var(--hover-bg)]';
    }
  };

  const getPriorityIcon = (priority) => {
    const priorityLower = priority?.toLowerCase();
    switch (priorityLower) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const formatTaskTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Compact view for small widgets
  if (isCompact || containerWidth < 400) {
    return (
      <div className="space-y-3 h-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* --- THEME --- */}
            <div className="p-1.5 bg-[var(--accent-color)]/10 rounded-lg">
              <Target size={14} className="text-[var(--accent-color)]" />
            </div>
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Today's Tasks
            </span>
          </div>
          <div className="flex items-center gap-2">
            {activeTimer && (
              // --- THEME --- (This is fine, accent-color is strong for most themes)
              // (If this is also white-on-white, change 'text-white' to 'text-[var(--text-primary)]')
              <div className="text-xs bg-[var(--accent-color)] text-white px-2 py-1 rounded-full font-mono">
                {formatTime(timerSeconds)}
              </div>
            )}
            {/* --- THEME --- */}
            <span className="text-lg font-bold text-[var(--text-primary)]">
              {pendingTasks.length}
            </span>
          </div>
        </div>
        
        {/* Progress */}
        {/* --- THEME --- */}
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>Progress</span>
          <span>{completionPercentage}%</span>
        </div>
        <div className="w-full bg-[var(--hover-bg)] rounded-full h-1.5">
          <div 
            className="bg-[var(--accent-color)] h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        
        {/* Task List */}
        <div className="space-y-2">
          {pendingTasks.slice(0, 3).map((task, index) => (
            <div 
              key={task.id || index}
              // --- THEME ---
              className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer group ${
                activeTimer === task.id
                  ? 'bg-[var(--accent-color)]/10 border-[var(--accent-color)]/50'
                  : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-[var(--accent-color)]/50'
              }`}
              onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
            >
              <button 
                onClick={(e) => handleTaskComplete(task.id, e)}
                className="flex-shrink-0 group/complete"
              >
                {/* --- THEME --- */}
                <Circle 
                  size={16} 
                  className="text-[var(--text-secondary)] group-hover/complete:text-green-500 transition-colors" 
                />
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs">{getPriorityIcon(task.priority)}</span>
                  {/* --- THEME --- */}
                  <span className="text-sm text-[var(--text-primary)] truncate">
                    {task.title}
                  </span>
                </div>
                {task.dueDate && (
                  // --- THEME ---
                  <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
                    <Clock size={10} />
                    {formatTaskTime(task.dueDate)}
                  </div>
                )}
              </div>
              
              {activeTimer === task.id ? (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    timerRunning ? pauseTimer() : resumeTimer();
                  }}
                  // --- THEME --- (Semantic color - red/yellow/green for controls is ok)
                  className={`flex-shrink-0 p-1.5 text-white rounded-lg transition-colors ${
                    timerRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {timerRunning ? <Pause size={12} /> : <Play size={12} />}
                </button>
              ) : (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    startTimer(task.id);
                  }}
                  // --- THEME ---
                  className="flex-shrink-0 p-1.5 bg-[var(--accent-color)] text-white rounded-lg hover:bg-[color-mix(in_srgb,var(--accent-color)_80%_black)] transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Play size={12} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {pendingTasks.length === 0 && (
          // --- THEME ---
          <div className="text-center py-4 text-[var(--text-secondary)]">
            <CheckCircle2 size={24} className="mx-auto mb-2 opacity-50" />
            <div className="text-sm">No tasks for today</div>
          </div>
        )}

        {/* Add Task Button */}
        <button 
          onClick={onAddTask}
          // --- THEME ---
          className="w-full flex items-center justify-center gap-2 p-2 text-sm text-[var(--accent-color)] hover:bg-[var(--accent-color)]/10 rounded-lg border border-dashed border-[var(--border-color)] transition-colors"
        >
          <Plus size={14} />
          Add Task
        </button>
      </div>
    );
  }

  // Full view for larger widgets
  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* ================================================================
        THIS IS THE FIX
        
        I've removed the accent-color gradient and `text-white`.
        Now it uses your theme's secondary background and primary/secondary text.
        This will work perfectly for all your themes.
        ================================================================
      */}
      <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl">
        <div className="text-center">
          <div className="text-2xl font-bold text-[var(--text-primary)]">{pendingTasks.length}</div>
          <div className="text-sm text-[var(--text-secondary)]">Pending</div>
        </div>
        
        {activeTimer && (
          <div className="text-center">
            <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">{formatTime(timerSeconds)}</div>
            <div className="text-sm text-[var(--text-secondary)]">Pomodoro</div>
          </div>
        )}
        
        <div className="text-center">
          <div className="text-2xl font-bold text-[var(--text-primary)]">{completionPercentage}%</div>
          <div className="text-sm text-[var(--text-secondary)]">Complete</div>
        </div>
      </div>
      {/* ======================= END OF FIX ======================= */}


      {/* Progress Section */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          {/* --- THEME --- */}
          <span className="text-[var(--text-primary)] font-medium">Today's Progress</span>
          <span className="text-[var(--text-secondary)]">
            {completedTasks}/{tasks.length} completed
          </span>
        </div>
        {/* --- THEME --- */}
        <div className="w-full bg-[var(--hover-bg)] rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-[var(--accent-color)] to-[color-mix(in_srgb,var(--accent-color)_80%,_black_20%)] h-3 rounded-full transition-all duration-700"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Timer Controls - Only show when timer is active */}
      {activeTimer && (
        // --- THEME ---
        <div className="flex items-center justify-between p-3 bg-[var(--accent-color)]/10 rounded-lg border border-[var(--accent-color)]/30">
          <div className="flex items-center gap-3">
            <div className="font-mono text-lg font-bold text-[var(--accent-color)]">
              {formatTime(timerSeconds)}
            </div>
            <div className="text-sm text-[var(--accent-color)]">
              {timerRunning ? 'Focus Time' : 'Paused'}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {/* --- THEME --- (Semantic colors are OK) */}
            <button
              onClick={timerRunning ? pauseTimer : resumeTimer}
              className={`p-2 rounded-lg transition-all ${
                timerRunning 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {timerRunning ? <Pause size={16} /> : <Play size={16} />}
            </button>
            
            <button
              onClick={resetTimer}
              className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw size={16} />
            </button>
            
            <button
              onClick={stopTimer}
              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              title="Stop Timer"
            >
              <Square size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Task List */}
      {/* --- RESPONSIVE --- (Using containerHeight for a dynamic max-height) */}
      <div 
        className="flex-1 space-y-3 overflow-y-auto"
        style={{ maxHeight: containerHeight > 400 ? containerHeight - 280 : 200 }} // 280px is approx height of other elements
      >
        {pendingTasks.length > 0 ? (
          pendingTasks.map((task, index) => (
            <div 
              key={task.id || index}
              // --- THEME ---
              className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                activeTimer === task.id
                  ? 'bg-[var(--accent-color)]/10 border-[var(--accent-color)]/50 shadow-lg shadow-[var(--accent-color)]/20'
                  : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-[var(--accent-color)]/50 hover:shadow-md'
              } ${selectedTask?.id === task.id ? 'ring-2 ring-[var(--accent-color)]' : ''}`}
              onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
            >
              <div className="flex items-start gap-3">
                {/* Completion Checkbox */}
                <button 
                  onClick={(e) => handleTaskComplete(task.id, e)}
                  className="flex-shrink-0 mt-0.5 group/complete"
                >
                  {/* --- THEME --- */}
                  <Circle 
                    size={18} 
                    className="text-[var(--text-secondary)] group-hover/complete:text-green-500 transition-colors" 
                  />
                </button>
                
                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {/* --- THEME --- */}
                    <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {task.title}
                    </span>
                    {task.priority && (
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    )}
                  </div>
                  
                  {task.description && (
                    // --- THEME ---
                    <div className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-2">
                      {task.description}
                    </div>
                  )}
                  
                  {/* --- THEME --- */}
                  <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatTaskTime(task.dueDate)}
                      </div>
                    )}
                    
                    {task.planTitle && (
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span className="truncate">{task.planTitle}</span>
                      </div>
                    )}
                    
                    {task.estimatedTime && (
                      <div className="flex items-center gap-1">
                        <Target size={12} />
                        {Math.floor(task.estimatedTime / 60)}h {task.estimatedTime % 60}m
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Timer Action */}
                <div className="flex-shrink-0">
                  {activeTimer === task.id ? (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        timerRunning ? pauseTimer() : resumeTimer();
                      }}
                       // --- THEME --- (Semantic colors)
                      className={`p-2 rounded-full text-white transition-all ${
                        timerRunning 
                          ? 'bg-yellow-500 hover:bg-yellow-600' 
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {timerRunning ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        startTimer(task.id);
                      }}
                      // --- THEME ---
                      className="p-2 bg-[var(--accent-color)] text-white rounded-full hover:bg-[color-mix(in_srgb,var(--accent-color)_80%_black)] transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Play size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Expanded Task Details */}
              {selectedTask?.id === task.id && (
                // --- THEME ---
                <div className="mt-3 pt-3 border-t border-[var(--border-color)] space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      {/* --- THEME --- */}
                      <div className="text-[var(--text-secondary)]">Priority</div>
                      <div className="font-medium capitalize text-[var(--text-primary)]">{task.priority || 'Not set'}</div>
                    </div>
                    <div>
                      {/* --- THEME --- */}
                      <div className="text-[var(--text-secondary)]">Due Time</div>
                      <div className="font-medium text-[var(--text-primary)]">
                        {task.dueDate ? formatTaskTime(task.dueDate) : 'Not set'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {/* --- THEME --- (Semantic green) */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskComplete(task.id, e);
                      }}
                      className="flex-1 py-2 px-3 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Mark Complete
                    </button>
                    {/* --- THEME --- */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        startTimer(task.id);
                      }}
                      className="flex-1 py-2 px-3 bg-[var(--accent-color)] text-white text-xs rounded-lg hover:bg-[color-mix(in_srgb,var(--accent-color)_80%_black)] transition-colors"
                    >
                      Start Timer
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          // --- THEME ---
          <div className="text-center py-8 text-[var(--text-secondary)]">
            <CheckCircle2 size={48} className="mx-auto mb-3 opacity-50" />
            <div className="text-sm font-medium mb-1">No tasks for today</div>
            <div className="text-xs">You're all caught up! Enjoy your day.</div>
            {/* --- THEME --- */}
            <button 
              onClick={onAddTask}
              className="mt-4 px-4 py-2 bg-[var(--accent-color)] text-white text-sm rounded-lg hover:bg-[color-mix(in_srgb,var(--accent-color)_80%_black)] transition-colors"
            >
              Add New Task
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions Footer */}
      {pendingTasks.length > 0 && (
        // --- THEME ---
        <div className="flex gap-2 pt-3 border-t border-[var(--border-color)]">
          {/* --- THEME --- (Semantic green) */}
          <button 
            onClick={() => pendingTasks.forEach(task => onTaskComplete(task.id))}
            className="flex-1 py-2 px-3 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
          >
            Complete All
          </button>
          {/* --- THEME --- */}
          <button 
            onClick={onAddTask}
            className="flex-1 py-2 px-3 bg-[var(--accent-color)] text-white text-sm rounded-lg hover:bg-[color-mix(in_srgb,var(--accent-color)_80%_black)] transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={14} />
            Add Task
          </button>
        </div>
      )}
    </div>
  );
}

export default TodayTasks;