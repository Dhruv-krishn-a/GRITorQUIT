import React from 'react';

const TimelineView = ({ tasks, startDate, endDate, onTaskToggle }) => {
  const getDaysArray = () => {
    const days = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

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

  const days = getDaysArray();
  const groupedTasks = groupTasksByDay(tasks);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'border-l-red-500';
      case 'Medium': return 'border-l-yellow-500';
      case 'Low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h3 className="text-xl font-bold text-white mb-6">Full Timeline</h3>
      
      <div className="space-y-4">
        {days.map(day => {
          const dateKey = day.toDateString();
          const dayTasks = groupedTasks[dateKey] || [];
          
          return (
            <div key={dateKey} className="border-b border-gray-700 pb-4 last:border-b-0">
              <div className="flex items-center space-x-4 mb-3">
                <h4 className="text-lg font-semibold text-white min-w-32">
                  {day.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    weekday: 'short'
                  })}
                </h4>
                <div className="flex-1">
                  {dayTasks.length === 0 ? (
                    <span className="text-gray-500 text-sm">No tasks planned</span>
                  ) : (
                    <span className="text-gray-400 text-sm">
                      {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-32">
                {dayTasks.map(task => (
                  <div
                    key={task._id || task.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      task.completed 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-gray-750 border-gray-600'
                    } ${getPriorityColor(task.priority)}`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => onTaskToggle(task._id || task.id)}
                        className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded"
                      />
                      <span className={`flex-1 ${task.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                        {task.title}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-400 text-sm mt-2 ml-7">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mt-2 ml-7">
                      {task.status && task.status !== 'Not Started' && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          task.status === 'Completed' ? 'bg-green-900 text-green-300' :
                          task.status === 'In Progress' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {task.status}
                        </span>
                      )}
                      
                      {task.tags && task.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineView;