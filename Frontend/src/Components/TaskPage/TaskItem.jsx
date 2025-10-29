import React, { useState } from 'react';
import { Calendar, Flag, Tag, ChevronDown, ChevronRight, CheckCircle2, Circle, Edit2, Trash2, MoreVertical, Play, Square, Clock } from 'lucide-react';
import Progress from './Progress';

const PriorityFlag = ({ priority }) => {
  const priorityConfig = {
    High: { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
    Medium: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
    Low: { color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
  };

  const config = priorityConfig[priority] || priorityConfig.Medium;

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${config.bg} ${config.border} border ${config.color}`}>
      <Flag size={12} />
      <span>{priority}</span>
    </div>
  );
};

export default function TaskItem({ 
  task, 
  onTaskUpdate, 
  onTaskDelete, 
  onTaskEdit, 
  onStartTimer, 
  onStopTimer, 
  activeTimer,
  formatTime 
}) {
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isTimerActive = activeTimer && activeTimer.taskId === task.id;

  const toggleComplete = async () => {
    try {
      await onTaskUpdate(task.planId, task._id || task.id, {
        completed: !task.completed,
        status: !task.completed ? 'Completed' : 'Not Started'
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const toggleSubtask = async (subtaskIndex) => {
    const updatedSubtasks = task.subtasks.map((subtask, index) => 
      index === subtaskIndex 
        ? { ...subtask, completed: !subtask.completed }
        : subtask
    );

    try {
      await onTaskUpdate(task.planId, task._id || task.id, {
        subtasks: updatedSubtasks
      });
    } catch (error) {
      console.error('Error updating subtask:', error);
    }
  };

  const handleTimerToggle = () => {
    if (isTimerActive) {
      onStopTimer();
    } else {
      onStartTimer(task);
    }
  };

  const handleEdit = () => {
    setShowMenu(false);
    onTaskEdit(task);
  };

  const handleDelete = () => {
    setShowMenu(false);
    onTaskDelete(task.planId, task._id || task.id);
  };

  return (
    <div className={`bg-gray-800/50 rounded-xl border transition-all duration-300 ${
      task.completed 
        ? 'border-green-400/20 bg-green-400/5' 
        : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/70'
    }`}>
      {/* Main Task Row */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Complete Button */}
          <button
            onClick={toggleComplete}
            className={`mt-1 flex-shrink-0 transition-all ${
              task.completed 
                ? 'text-green-400 hover:text-green-300' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
          </button>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-medium mb-2 ${
                  task.completed ? 'text-gray-400 line-through' : 'text-white'
                }`}>
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className="text-gray-400 text-sm mb-3">
                    {task.description}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded-md text-xs text-gray-300">
                    <Calendar size={12} />
                    <span>{formatDate(task.date)}</span>
                  </div>

                  <PriorityFlag priority={task.priority} />

                  {/* Time Spent */}
                  {(task.timeSpent > 0 || isTimerActive) && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                      isTimerActive 
                        ? 'bg-red-400/10 text-red-400 border border-red-400/20' 
                        : 'bg-blue-400/10 text-blue-400 border border-blue-400/20'
                    }`}>
                      <Clock size={12} />
                      <span>
                        {formatTime(task.timeSpent || 0)}
                        {isTimerActive && ' +'}
                      </span>
                    </div>
                  )}

                  {task.planTitle && (
                    <div className="px-2 py-1 bg-blue-400/10 text-blue-400 rounded-md text-xs border border-blue-400/20">
                      {task.planTitle}
                    </div>
                  )}

                  {task.subtasks && task.subtasks.length > 0 && (
                    <Progress 
                      current={task.subtasks.filter(st => st.completed).length} 
                      total={task.subtasks.length} 
                    />
                  )}

                  {task.tags && task.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-700 text-gray-300 rounded-md text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Completed task time info */}
                {task.completed && task.completedAt && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <span>Completed: {new Date(task.completedAt).toLocaleDateString()}</span>
                    {task.timeSpent > 0 && (
                      <span>• Time spent: {formatTime(task.timeSpent)}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {/* Timer Button */}
                {!task.completed && (
                  <button
                    onClick={handleTimerToggle}
                    className={`p-2 rounded-lg transition-all ${
                      isTimerActive
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
                    }`}
                    title={isTimerActive ? 'Stop timer' : 'Start timer'}
                  >
                    {isTimerActive ? <Square size={16} /> : <Play size={16} />}
                  </button>
                )}
                
                {task.subtasks && task.subtasks.length > 0 && (
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                )}
                
                <div className="relative">
                  <button 
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <MoreVertical size={16} />
                  </button>
                  
                  {showMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 min-w-32">
                      <button
                        onClick={handleEdit}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-t-lg"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-b-lg"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtasks Section */}
      {expanded && task.subtasks && task.subtasks.length > 0 && (
        <div className="px-4 pb-4 border-t border-gray-700 pt-4">
          <div className="space-y-2">
            {task.subtasks.map((subtask, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-gray-700/50 rounded-lg">
                <button
                  onClick={() => toggleSubtask(index)}
                  className={`flex-shrink-0 transition-all ${
                    subtask.completed 
                      ? 'text-green-400' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {subtask.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                </button>
                
                <span className={`text-sm flex-1 ${
                  subtask.completed ? 'text-gray-400 line-through' : 'text-gray-200'
                }`}>
                  {subtask.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
    </div>
    
  );
}