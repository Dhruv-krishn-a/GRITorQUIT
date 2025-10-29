import React, { useState, useEffect } from 'react';
import { Flag, AlertTriangle, CheckCircle2, Clock, Calendar, MoreVertical } from 'lucide-react';

export default function PrioritizationFocus({ 
  highPriorityTasks = [], 
  priorityDistribution = { high: 0, medium: 0, low: 0 },
  containerWidth = 0,
  containerHeight = 0,
  isCompact = false,
  onPriorityFilter = () => {},
  onTaskClick = () => {}
}) {
  const [selectedPriority, setSelectedPriority] = useState('high');
  const [hoveredTask, setHoveredTask] = useState(null);
  const [filteredTasks, setFilteredTasks] = useState(highPriorityTasks);

  useEffect(() => {
    if (selectedPriority === 'high') {
      setFilteredTasks(highPriorityTasks);
    } else {
      // In a real app, you would fetch tasks by priority from the database
      setFilteredTasks(highPriorityTasks.filter(task => 
        task.priority?.toLowerCase() === selectedPriority
      ));
    }
  }, [selectedPriority, highPriorityTasks]);

  const handlePriorityClick = (priority) => {
    setSelectedPriority(priority);
    onPriorityFilter(priority);
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return <AlertTriangle size={12} className="text-red-500" />;
      case 'medium': return <Flag size={12} className="text-yellow-500" />;
      case 'low': return <CheckCircle2 size={12} className="text-green-500" />;
      default: return <Flag size={12} className="text-gray-500" />;
    }
  };

  if (isCompact || containerWidth < 400) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            <span className="text-sm font-medium">Priority</span>
          </div>
          <span className="text-lg font-bold text-red-500">{highPriorityTasks.length}</span>
        </div>
        
        <div className="flex gap-1 mb-2">
          {['high', 'medium', 'low'].map(priority => (
            <button
              key={priority}
              onClick={() => handlePriorityClick(priority)}
              className={`flex-1 text-xs py-1 px-2 rounded capitalize transition-all ${
                selectedPriority === priority 
                  ? `bg-${getPriorityColor(priority)}-500 text-white` 
                  : `bg-${getPriorityColor(priority)}-100 text-${getPriorityColor(priority)}-600`
              }`}
            >
              {priorityDistribution[priority] || 0}
            </button>
          ))}
        </div>
        
        {filteredTasks.slice(0, 3).map((task, index) => (
          <div 
            key={index}
            className="relative flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer"
            onMouseEnter={() => setHoveredTask(task)}
            onMouseLeave={() => setHoveredTask(null)}
            onClick={() => onTaskClick(task)}
          >
            <div className={`w-2 h-2 bg-${getPriorityColor(task.priority)}-500 rounded-full`}></div>
            <span className="text-sm truncate flex-1">{task.title}</span>
            
            {/* Hover Tooltip */}
            {hoveredTask?.id === task.id && (
              <div className="absolute z-10 left-0 top-full mt-1 w-64 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="font-medium text-sm mb-1">{task.title}</div>
                {task.description && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {task.description}
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className={`px-2 py-1 rounded-full bg-${getPriorityColor(task.priority)}-100 text-${getPriorityColor(task.priority)}-600`}>
                    {task.priority} Priority
                  </span>
                  {task.dueDate && (
                    <span className="flex items-center gap-1 text-gray-500">
                      <Clock size={10} />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Priority Filter Buttons */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {['high', 'medium', 'low'].map(priority => (
          <button
            key={priority}
            onClick={() => handlePriorityClick(priority)}
            className={`p-3 rounded-lg transition-all transform hover:scale-105 ${
              selectedPriority === priority
                ? `bg-${getPriorityColor(priority)}-500 text-white shadow-lg`
                : `bg-${getPriorityColor(priority)}-50 dark:bg-${getPriorityColor(priority)}-900/20 hover:bg-${getPriorityColor(priority)}-100`
            }`}
          >
            <div className="text-xl font-bold">{priorityDistribution[priority] || 0}</div>
            <div className="text-xs capitalize">{priority}</div>
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Flag size={16} className="text-red-500" />
          <h4 className="font-medium">
            {selectedPriority.charAt(0).toUpperCase() + selectedPriority.slice(1)} Priority Tasks ({filteredTasks.length})
          </h4>
        </div>
        
        <div className="space-y-2">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task, index) => (
              <div 
                key={index}
                className="relative flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer group"
                onMouseEnter={() => setHoveredTask(task)}
                onMouseLeave={() => setHoveredTask(null)}
                onClick={() => onTaskClick(task)}
              >
                <div className="flex-shrink-0">
                  {getPriorityIcon(task.priority)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{task.title}</div>
                  {task.planTitle && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {task.planTitle}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {task.dueDate && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar size={10} />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                    {task.estimatedTime && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock size={10} />
                        {Math.floor(task.estimatedTime / 60)}h {task.estimatedTime % 60}m
                      </div>
                    )}
                  </div>
                </div>
                
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <MoreVertical size={14} />
                </button>

                {/* Enhanced Hover Card */}
                {hoveredTask?.id === task.id && (
                  <div className="absolute z-20 left-0 top-full mt-2 w-80 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-sm">{task.title}</div>
                      <span className={`px-2 py-1 text-xs rounded-full bg-${getPriorityColor(task.priority)}-100 text-${getPriorityColor(task.priority)}-600`}>
                        {task.priority} Priority
                      </span>
                    </div>
                    
                    {task.description && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        {task.description}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {task.dueDate && (
                        <div>
                          <div className="text-gray-500">Due Date</div>
                          <div className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</div>
                        </div>
                      )}
                      {task.estimatedTime && (
                        <div>
                          <div className="text-gray-500">Estimated Time</div>
                          <div className="font-medium">
                            {Math.floor(task.estimatedTime / 60)}h {task.estimatedTime % 60}m
                          </div>
                        </div>
                      )}
                      {task.planTitle && (
                        <div className="col-span-2">
                          <div className="text-gray-500">Project</div>
                          <div className="font-medium">{task.planTitle}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 py-2 px-3 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors">
                        Start Working
                      </button>
                      <button className="flex-1 py-2 px-3 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors">
                        Mark Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CheckCircle2 size={32} className="mx-auto mb-2 opacity-50" />
              <div className="text-sm">No {selectedPriority} priority tasks</div>
              <div className="text-xs mt-1">Great job keeping priorities manageable!</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}