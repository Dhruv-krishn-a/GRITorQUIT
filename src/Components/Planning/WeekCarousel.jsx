import React, { useState } from 'react';
import TaskCard from './TaskCard';

const WeekCarousel = ({ tasks, onTaskToggle, onSubtaskToggle }) => {
  const [currentWeek, setCurrentWeek] = useState(0);

  const groupTasksByDay = (tasks) => {
    const grouped = {};
    
    tasks.forEach(task => {
      const dateKey = new Date(task.date).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(task);
    });
    
    return grouped;
  };

  const groupedTasks = groupTasksByDay(tasks);
  const days = Object.keys(groupedTasks).sort();

  const currentWeekDays = days.slice(currentWeek * 7, (currentWeek + 1) * 7);

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">This Week's Tasks</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentWeek(prev => Math.max(0, prev - 1))}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
            disabled={currentWeek === 0}
          >
            ←
          </button>
          <button
            onClick={() => setCurrentWeek(prev => prev + 1)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
            disabled={(currentWeek + 1) * 7 >= days.length}
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
        {currentWeekDays.map(date => {
          const dayTasks = groupedTasks[date];
          const dateObj = new Date(date);
          
          return (
            <div key={date} className="bg-gray-750 rounded-lg border border-gray-700 p-4">
              <div className="text-center mb-4">
                <div className="text-lg font-semibold text-white">
                  {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-sm text-gray-400">
                  {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
              
              <div className="space-y-3">
                {dayTasks.map(task => (
                  <TaskCard
                    key={task._id || task.id}
                    task={task}
                    onToggle={onTaskToggle}
                    onSubtaskToggle={onSubtaskToggle}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {currentWeekDays.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No tasks scheduled for this week
        </div>
      )}
    </div>
  );
};

export default WeekCarousel;