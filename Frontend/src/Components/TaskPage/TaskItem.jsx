import React from 'react';
import { Check, Clock, Play, Square, Target, Edit, Trash2 } from 'lucide-react';
// We no longer need plansAPI here
// import { plansAPI } from '../services/api'; 

const TaskItem = ({ 
  task, 
  planId, 
  onUpdate, 
  onEdit, 
  onDelete, 
  onStartTimer,
  isTimerRunning 
}) => {
  // Debug: log the props to see what's being passed
  console.log('TaskItem props:', { planId, taskId: task._id, taskTitle: task.title });

  const toggleComplete = () => {
    // No longer async, no try...catch needed
    console.log('Toggling task completion:', { planId, taskId: task._id });
    
    if (!planId) {
      console.error('planId is undefined! Cannot update task.');
      return;
    }

    if (!task._id) {
      console.error('task._id is undefined! Cannot update task.');
      return;
    }

    // REMOVED the broken API call:
    // await plansAPI.toggleTaskCompletion(planId, task._id);
    
    // Call the onUpdate callback to refresh the parent component.
    // This (onUpdate) is what triggers the API call in TaskPage.jsx
    if (onUpdate) {
      const newCompletedState = !task.completed;
      onUpdate(planId, task._id, { 
        completed: newCompletedState,
        completedAt: newCompletedState ? new Date().toISOString() : null,
        status: newCompletedState ? 'Completed' : 'Not Started'
      });
    }
  };

  const formatTime = (minutes) => {
    if (!minutes) return "0m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-500';
      case 'In Progress': return 'text-blue-500';
      case 'Not Started': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-all duration-200 ${
      task.completed ? 'opacity-70' : 'hover:shadow-md'
    }`}>
      <div className="flex items-start justify-between">
        {/* Left side - Checkbox and Task Info */}
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          {/* Checkbox */}
          <button
            onClick={toggleComplete}
            className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center transition-all ${
              task.completed
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
            }`}
          >
            {task.completed && <Check size={12} />}
          </button>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className={`font-medium truncate ${
                task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'
              }`}>
                {task.title}
              </h3>
              
              {/* Priority Badge */}
              {task.priority && (
                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)} bg-opacity-10`}>
                  {task.priority}
                </span>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Task Metadata */}
            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              {/* Time Spent */}
              {(task.timeSpent > 0) && (
                <div className="flex items-center space-x-1">
                  <Clock size={12} />
                  <span>{formatTime(task.timeSpent)}</span>
                </div>
              )}

              {/* Pomodoros */}
              {(task.completedPomodoros > 0) && (
                <div className="flex items-center space-x-1">
                  <Target size={12} />
                  <span>{task.completedPomodoros}🍅</span>
                </div>
              )}

              {/* Status */}
              {task.status && task.status !== 'Not Started' && (
                <span className={getStatusColor(task.status)}>
                  {task.status}
                </span>
              )}

              {/* Due Date */}
              {task.date && (
                <span>
                  {new Date(task.date).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Subtasks Progress */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Subtasks</span>
                  <span>
                    {task.subtasks.filter(st => st.completed).length} / {task.subtasks.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                  <div 
                    className="bg-blue-500 h-1 rounded-full transition-all"
                    style={{
                      width: `${(task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
          {/* Timer Button */}
          {!task.completed && onStartTimer && (
            <button
              onClick={() => onStartTimer(task)}
              disabled={isTimerRunning}
              className={`p-2 rounded-lg transition-colors ${
                isTimerRunning
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              title="Start timer for this task"
            >
              {isTimerRunning ? <Square size={16} /> : <Play size={16} />}
            </button>
          )}

          {/* Edit Button */}
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Edit task"
            >
              <Edit size={16} />
            </button>
          )}

          {/* Delete Button */}
          {onDelete && (
            <button
              onClick={() => onDelete(planId, task._id)}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete task"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {task.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskItem;