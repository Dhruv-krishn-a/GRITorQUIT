import React from 'react';
import { Calendar, Flag } from 'lucide-react';
import Progress from './Progress';

// Helper component for Priority
const PriorityFlag = ({ priority }) => {
  const priorityColors = {
    High: 'text-red-400',
    Medium: 'text-yellow-400',
    Low: 'text-green-400',
  };
  return (
    <div className={`flex items-center space-x-1 ${priorityColors[priority]}`}>
      <Flag size={14} />
      <span className="text-sm">{priority}</span>
    </div>
  );
};

export default function TaskItem({ task }) {
  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-b-0">
      {/* Checkbox */}
      <button className="mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 border-blue-400 hover:bg-blue-900 transition-colors focus:outline-none"></button>

      {/* Task Content */}
      <div className="flex-1">
        <p className="text-base text-gray-100">{task.title}</p>
        
        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-gray-400">
          <div className="flex items-center space-x-1">
            <Calendar size={14} />
            <span className="text-sm">{task.date}</span>
          </div>

          <PriorityFlag priority={task.priority} />

          {task.progress && (
            <Progress 
              current={task.progress.current} 
              total={task.progress.total} 
            />
          )}

          {task.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}