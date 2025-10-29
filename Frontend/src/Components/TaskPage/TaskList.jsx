import React from 'react';
import TaskItem from './TaskItem';

export default function TaskList({ 
  tasks, 
  activeView, 
  onTaskUpdate, 
  onTaskDelete, 
  onTaskEdit,
  onStartTimer,
  onStopTimer,
  activeTimer,
  formatTime 
}) {
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

  if (tasks.length === 0) {
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
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Create New Task
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-3xl">{icon}</span>
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="text-gray-400">{description}</p>
          </div>
        </div>
        <div className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm font-medium">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </div>
      </div>
      
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskItem 
            key={task.id} 
            task={task} 
            onTaskUpdate={onTaskUpdate}
            onTaskDelete={onTaskDelete}
            onTaskEdit={onTaskEdit}
            onStartTimer={onStartTimer}
            onStopTimer={onStopTimer}
            activeTimer={activeTimer}
            formatTime={formatTime}
          />
        ))}
      </div>
    </div>
  );
}