import React from 'react';
import TaskItem from './TaskItem';

export default function TaskList({ 
  tasks = [], // Default to empty array to prevent undefined errors
  activeView, 
  onTaskUpdate, // This is received from TaskPage
  onTaskDelete, // This is received from TaskPage
  onTaskEdit,   // This is received from TaskPage
  onStartTimer,
  onStopTimer,
  activeTimer,
  formatTime,
  isTimerRunning = false
}) {
  // Safely get section configuration
  const getSectionConfig = (view) => {
    const configs = {
      all: { icon: '📝', title: 'All Tasks', description: 'All your tasks in one place' },
      today: { icon: '🎯', title: 'Due Today', description: 'Tasks that need your attention today' },
      upcoming: { icon: '📅', title: 'Upcoming', description: 'Tasks scheduled for the coming days' },
      overdue: { icon: '⏰', title: 'Overdue', description: 'Tasks that are past their due date' },
      completed: { icon: '✅', title: 'Completed', description: 'Tasks you have finished' }
    };
    return configs[view] || configs.all;
  };

  const { icon, title, description } = getSectionConfig(activeView);

  // Ensure tasks is always an array
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  if (!safeTasks || safeTasks.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-8xl mb-6 opacity-50">{icon}</div>
        <h3 className="text-2xl font-semibold text-white mb-3">No {title.toLowerCase()} found</h3>
        <p className="text-gray-400 text-lg max-w-md mx-auto mb-8">
          {description}. {activeView === 'all' ? 'Get started by creating your first task!' : 'All clear for now!'}
        </p>
        {activeView !== 'all' && (
          <button
            onClick={() => onTaskEdit(null)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25"
          >
            Create New Task
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-3xl">{icon}</span>
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="text-gray-400">{description}</p>
          </div>
        </div>
        
        {/* Enhanced stats */}
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm font-medium border border-gray-700">
            {safeTasks.length} {safeTasks.length === 1 ? 'task' : 'tasks'}
          </div>
          
          {/* Additional stats for specific views */}
          {activeView === 'today' && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>
                {safeTasks.filter(task => task.priority === 'High').length} high priority
              </span>
            </div>
          )}
          
          {activeView === 'completed' && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>
                {safeTasks.reduce((total, task) => total + (task.timeSpent || 0), 0)}min total
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Tasks grid */}
      <div className="space-y-4">
        {safeTasks.map((task) => (
          <TaskItem 
            key={task.id || task._id} 
            planId={task.planId} 
            task={task} 
            onUpdate={onTaskUpdate}     // <-- FIX: Was onTaskUpdate
            onDelete={onTaskDelete}     // <-- FIX: Was onTaskDelete
            onEdit={onTaskEdit}         // <-- This one was correct
            onStartTimer={onStartTimer}
            onStopTimer={onStopTimer}
            activeTimer={activeTimer}
            formatTime={formatTime}
            isTimerRunning={isTimerRunning}
          />
        ))}
      </div>
      
      {/* Load more indicator (optional) */}
      {safeTasks.length > 10 && (
        <div className="text-center pt-6 border-t border-gray-700/50 mt-6">
          <p className="text-gray-400 text-sm">
            Showing {safeTasks.length} tasks
          </p>
        </div>
      )}
    </div>
  );
}