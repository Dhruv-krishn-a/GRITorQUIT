import React, { useState, useEffect, useRef } from 'react';

const WeekCarousel = ({ tasks, onTaskToggle, onSubtaskToggle }) => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredTask, setHoveredTask] = useState(null);
  const [weeks, setWeeks] = useState([]);
  
  const hoverTimeoutRef = useRef(null);
  const taskRefs = useRef({});

  // Process tasks and group into proper weeks
  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      setWeeks([]);
      return;
    }

    // Parse and sort dates properly
    const tasksWithDates = tasks.map(task => ({
      ...task,
      dateObj: new Date(task.date)
    })).sort((a, b) => a.dateObj - b.dateObj);

    // Group tasks by date
    const tasksByDate = {};
    tasksWithDates.forEach(task => {
      const dateKey = task.dateObj.toDateString();
      if (!tasksByDate[dateKey]) {
        tasksByDate[dateKey] = [];
      }
      tasksByDate[dateKey].push(task);
    });

    // Get all unique dates and sort them
    const allDates = Object.keys(tasksByDate).sort((a, b) => new Date(a) - new Date(b));
    
    if (allDates.length === 0) {
      setWeeks([]);
      return;
    }

    // Create proper weeks (Sunday to Saturday)
    const groupedWeeks = [];
    let currentWeekDates = [];
    
    allDates.forEach((dateStr, index) => {
      const currentDate = new Date(dateStr);
      
      if (currentWeekDates.length === 0) {
        currentWeekDates.push(dateStr);
        return;
      }

      const lastDateInWeek = new Date(currentWeekDates[currentWeekDates.length - 1]);
      const daysDifference = Math.floor((currentDate - lastDateInWeek) / (1000 * 60 * 60 * 24));

      if (currentWeekDates.length >= 7 || daysDifference > 1) {
        const filledWeek = fillMissingDays(currentWeekDates);
        groupedWeeks.push(filledWeek);
        currentWeekDates = [dateStr];
      } else {
        currentWeekDates.push(dateStr);
      }

      if (index === allDates.length - 1) {
        const filledWeek = fillMissingDays(currentWeekDates);
        groupedWeeks.push(filledWeek);
      }
    });

    const weeksWithTasks = groupedWeeks.map(weekDates => 
      weekDates.map(dateStr => ({
        date: dateStr,
        tasks: tasksByDate[dateStr] || [],
        dateObj: new Date(dateStr)
      }))
    );

    setWeeks(weeksWithTasks);
  }, [tasks]);

  // Fill missing days in a week to always show 7 days
  const fillMissingDays = (dateStrings) => {
    if (dateStrings.length >= 7) return dateStrings;

    const dates = dateStrings.map(str => new Date(str));
    const firstDate = new Date(Math.min(...dates));
    const lastDate = new Date(Math.max(...dates));
    
    const startOfWeek = new Date(firstDate);
    startOfWeek.setDate(firstDate.getDate() - firstDate.getDay());
    
    const fullWeek = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      const dateKey = currentDate.toDateString();
      
      if (dateStrings.includes(dateKey)) {
        fullWeek.push(dateKey);
      } else {
        fullWeek.push(dateKey);
      }
    }
    
    return fullWeek.sort((a, b) => new Date(a) - new Date(b));
  };

  const handleWeekChange = (direction) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    if (direction === 'next' && currentWeek < weeks.length - 1) {
      setCurrentWeek(prev => prev + 1);
    } else if (direction === 'prev' && currentWeek > 0) {
      setCurrentWeek(prev => prev - 1);
    }
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleTaskMouseEnter = (task, taskId) => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Set timeout to show popup
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredTask({ ...task, elementId: taskId });
    }, 200); // Reduced delay for better UX
  };

  const handleTaskMouseLeave = () => {
    // Clear timeout if mouse leaves quickly
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredTask(null);
  };

  const handlePopupMouseEnter = () => {
    // Keep popup open when mouse moves into it
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handlePopupMouseLeave = () => {
    setHoveredTask(null);
  };

  const closePopup = () => {
    setHoveredTask(null);
  };

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-500/20 border-red-500/50';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/50';
      case 'low': return 'bg-green-500/20 border-green-500/50';
      default: return 'bg-gray-600/20 border-gray-500/50';
    }
  };

  const getPriorityDot = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Calculate popup position based on current hovered task
  const getPopupPosition = () => {
    if (!hoveredTask?.elementId) return { x: 0, y: 0, placement: 'top' };

    const taskElement = document.getElementById(hoveredTask.elementId);
    if (!taskElement) return { x: 0, y: 0, placement: 'top' };

    const rect = taskElement.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    const popupWidth = 320;
    const popupHeight = 400;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Default position above the task
    let x = rect.left + scrollX + (rect.width / 2) - (popupWidth / 2);
    let y = rect.top + scrollY - popupHeight - 10;
    let placement = 'top';

    // Adjust if popup would go off-screen to the left
    if (x < 20) {
      x = 20;
    }

    // Adjust if popup would go off-screen to the right
    if (x + popupWidth > viewportWidth - 20) {
      x = viewportWidth - popupWidth - 20;
    }

    // If popup would go off-screen at the top, show below instead
    if (y < 20) {
      y = rect.bottom + scrollY + 10;
      placement = 'bottom';
    }

    // If still off-screen at bottom, adjust to stay in viewport
    if (y + popupHeight > viewportHeight + scrollY - 20) {
      y = viewportHeight + scrollY - popupHeight - 20;
    }

    return { x, y, placement };
  };

  const popupPosition = getPopupPosition();

  const currentWeekDays = weeks[currentWeek] || [];

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 p-6 shadow-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Weekly Overview
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Week {currentWeek + 1} of {weeks.length} • {currentWeekDays.length} days
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => handleWeekChange('prev')}
            disabled={currentWeek === 0 || isAnimating}
            className="group relative bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:opacity-30 text-white p-3 rounded-xl border border-gray-600/50 transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:hover:scale-100"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => handleWeekChange('next')}
            disabled={currentWeek >= weeks.length - 1 || isAnimating}
            className="group relative bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:opacity-30 text-white p-3 rounded-xl border border-gray-600/50 transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:hover:scale-100"
          >
            <svg className="w-5 h-5 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Week Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 transition-all duration-300 ${
        isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}>
        {currentWeekDays.map((dayData, index) => {
          const { date, tasks: dayTasks, dateObj } = dayData;
          const today = new Date();
          const isToday = dateObj.toDateString() === today.toDateString();
          
          return (
            <div 
              key={date} 
              className={`bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 transition-all duration-300 hover:scale-105 hover:bg-gray-800/80 hover:border-cyan-500/30 hover:shadow-xl ${
                isToday ? 'ring-2 ring-cyan-500/50 bg-cyan-500/10' : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Date Header */}
              <div className="text-center mb-4 relative">
                <div className={`text-sm font-semibold mb-1 ${
                  isToday ? 'text-cyan-400' : 'text-gray-300'
                }`}>
                  {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-lg font-bold ${
                  isToday ? 'text-cyan-300' : 'text-white'
                }`}>
                  {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                {isToday && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                    <div className="w-2 h-2 bg-cyan-500 rounded-full absolute top-0 right-0"></div>
                  </div>
                )}
              </div>
              
              {/* Tasks */}
              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                {dayTasks.map((task, taskIndex) => {
                  const taskId = `task-${task._id || task.id}-${index}-${taskIndex}`;
                  return (
                    <div 
                      key={taskId}
                      id={taskId}
                      className="transform transition-all duration-300 hover:scale-[1.02]"
                      style={{ animationDelay: `${taskIndex * 50}ms` }}
                      onMouseEnter={() => handleTaskMouseEnter(task, taskId)}
                      onMouseLeave={handleTaskMouseLeave}
                    >
                      <div className={`relative p-3 rounded-lg border-l-4 backdrop-blur-sm cursor-pointer ${getPriorityColor(task.priority)}`}>
                        {/* Priority Dot */}
                        <div className={`absolute -left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full ${getPriorityDot(task.priority)}`}></div>
                        
                        {/* Task Header */}
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-white text-sm leading-tight pr-2 line-clamp-2">
                            {task.title}
                          </h4>
                          {task.estimated && (
                            <span className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full whitespace-nowrap shrink-0">
                              {task.estimated}
                            </span>
                          )}
                        </div>
                        
                        {/* Subtasks Progress */}
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex-1 bg-gray-700/50 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${((task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100)}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-400 shrink-0">
                              {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
                            </span>
                          </div>
                        )}
                        
                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {task.tags.slice(0, 2).map((tag, tagIndex) => (
                              <span 
                                key={tagIndex}
                                className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {task.tags.length > 2 && (
                              <span className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full">
                                +{task.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {dayTasks.length === 0 && (
                <div className="text-center py-6">
                  <div className="text-gray-500 text-sm">No tasks</div>
                  <div className="text-gray-600 text-xs mt-1">Enjoy your day!</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Task Detail Popup */}
      {hoveredTask && (
        <div 
          className="fixed z-50 bg-gray-800/95 backdrop-blur-md rounded-xl border border-cyan-500/30 shadow-2xl p-4 w-80 animate-popIn"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
          }}
          onMouseEnter={handlePopupMouseEnter}
          onMouseLeave={handlePopupMouseLeave}
        >
          {/* Popup arrow */}
          <div className={`absolute ${
            popupPosition.placement === 'top' 
              ? 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full' 
              : 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-full'
          }`}>
            <div className="w-4 h-4 bg-cyan-500/30 transform rotate-45 border border-cyan-500/50"></div>
          </div>

          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-white text-lg pr-4">{hoveredTask.title}</h3>
            <button 
              onClick={closePopup}
              className="text-gray-400 hover:text-white transition-colors flex-shrink-0 ml-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {hoveredTask.description && (
            <p className="text-gray-300 text-sm mb-3">{hoveredTask.description}</p>
          )}
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Priority:</span>
              <span className={`font-semibold ${
                hoveredTask.priority?.toLowerCase() === 'high' ? 'text-red-400' :
                hoveredTask.priority?.toLowerCase() === 'medium' ? 'text-yellow-400' :
                hoveredTask.priority?.toLowerCase() === 'low' ? 'text-green-400' : 'text-gray-400'
              }`}>
                {hoveredTask.priority || 'Not set'}
              </span>
            </div>
            
            {hoveredTask.estimated && (
              <div className="flex justify-between">
                <span className="text-gray-400">Estimated:</span>
                <span className="text-white">{hoveredTask.estimated}</span>
              </div>
            )}
            
            {hoveredTask.subtasks && hoveredTask.subtasks.length > 0 && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Subtasks:</span>
                  <span className="text-white">
                    {hoveredTask.subtasks.filter(st => st.completed).length}/{hoveredTask.subtasks.length}
                  </span>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {hoveredTask.subtasks.map((subtask, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        subtask.completed ? 'bg-green-500' : 'bg-gray-500'
                      }`}></div>
                      <span className={`text-xs flex-1 ${
                        subtask.completed ? 'text-green-400 line-through' : 'text-gray-300'
                      }`}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {hoveredTask.tags && hoveredTask.tags.length > 0 && (
              <div>
                <span className="text-gray-400 block mb-1">Tags:</span>
                <div className="flex flex-wrap gap-1">
                  {hoveredTask.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {currentWeekDays.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No tasks scheduled</div>
          <div className="text-gray-600 text-sm">Add some tasks to see your weekly overview</div>
        </div>
      )}

      {/* Week Indicator */}
      {weeks.length > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {weeks.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAnimating(true);
                setCurrentWeek(index);
                setTimeout(() => setIsAnimating(false), 300);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentWeek 
                  ? 'bg-cyan-400 w-6' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(75, 85, 99, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-popIn {
          animation: popIn 0.2s ease-out forwards;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default WeekCarousel;