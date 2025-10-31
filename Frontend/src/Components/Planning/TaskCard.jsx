// Frontend/src/Components/Planning/TaskCard.jsx
import React from 'react';
import PomodoroTimer from './PomodoroTimer';

const TaskCard = ({ task, onToggle, onSubtaskToggle }) => {
  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-600';
      case 'Medium': return 'bg-yellow-600';
      case 'Low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-400';
      case 'In Progress': return 'text-yellow-400';
      case 'Not Started': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggle(task.id)}
            className="mt-1 w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
          />
          <div className="flex-1">
            <h4 className={`font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
              {task.title}
            </h4>
            {task.description && (
              <p className="text-gray-400 text-sm mt-1">{task.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          {task.priority && (
            <span className={`${getPriorityColor(task.priority)} text-white px-2 py-1 rounded text-xs`}>
              {task.priority}
            </span>
          )}
          {task.status && (
            <span className={`${getStatusColor(task.status)} text-xs`}>
              {task.status}
            </span>
          )}
        </div>
      </div>

      {task.subtasks && task.subtasks.length > 0 && (
        <div className="ml-7 mb-3 space-y-2">
          <div className="text-xs text-gray-500 mb-2">
            Subtasks: {completedSubtasks}/{totalSubtasks}
          </div>
          {task.subtasks.map((subtask) => (
            <div key={subtask._id || subtask.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={subtask.completed}
                onChange={() => onSubtaskToggle(task._id || task.id, subtask._id || subtask.id)}
                className="w-3 h-3 text-red-600 bg-gray-700 border-gray-600 rounded"
              />
              <span className={`text-sm ${subtask.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                {subtask.title}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <PomodoroTimer 
          taskId={task._id || task.id} 
          estimatedTime={task.estimatedTime}
        />
      </div>
    </div>
  );
};

export default TaskCard;