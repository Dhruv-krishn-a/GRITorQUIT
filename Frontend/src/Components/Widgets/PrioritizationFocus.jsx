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

  // This helper function is fine, as priority colors are semantic (status-based)
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
      // --- THEME --- Replaced gray-500 with theme variable
      default: return <Flag size={12} className="text-[var(--text-secondary)]" />;
    }
  };
  
  // --- THEME --- 
  // This new helper creates theme-safe classes. 
  // 10% opacity (e.g., bg-red-500/10) works on all light/dark backgrounds.
  const getPriorityClasses = (priority, active = false) => {
    const color = getPriorityColor(priority);
    if (active) {
      // Add a contrast fix for yellow, which needs black text
      const textColor = color === 'yellow' ? 'text-black' : 'text-white';
      return `bg-${color}-500 ${textColor}`;
    } else {
      // Use opacity for inactive state
      return `bg-${color}-500/10 text-${color}-600`;
    }
  };


  if (isCompact || containerWidth < 400) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            {/* --- THEME --- Added text color */}
            <span className="text-sm font-medium text-[var(--text-primary)]">Priority</span>
          </div>
          <span className="text-lg font-bold text-red-500">{highPriorityTasks.length}</span>
        </div>
        
        <div className="flex gap-1 mb-2">
          {['high', 'medium', 'low'].map(priority => (
            <button
              key={priority}
              onClick={() => handlePriorityClick(priority)}
              // --- THEME --- Using our new class function
              className={`flex-1 text-xs py-1 px-2 rounded capitalize transition-all ${
                getPriorityClasses(priority, selectedPriority === priority)
              }`}
            >
              {priorityDistribution[priority] || 0}
            </button>
          ))}
        </div>
        
        {/* --- RESPONSIVE --- List will scroll if content is too tall for widget */}
        <div 
          className="space-y-2 overflow-y-auto"
          style={{ maxHeight: containerHeight > 150 ? containerHeight - 80 : 100 }} // 80px = approx header height
        >
          {filteredTasks.slice(0, 3).map((task, index) => (
            <div 
              key={index}
              // --- THEME --- Replaced all hard-coded colors
              className="relative flex items-center gap-2 p-2 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] hover:shadow-md transition-all cursor-pointer"
              onMouseEnter={() => setHoveredTask(task)}
              onMouseLeave={() => setHoveredTask(null)}
              onClick={() => onTaskClick(task)}
            >
              <div className={`w-2 h-2 bg-${getPriorityColor(task.priority)}-500 rounded-full`}></div>
              {/* --- THEME --- Added text color */}
              <span className="text-sm truncate flex-1 text-[var(--text-primary)]">{task.title}</span>
              
              {/* Hover Tooltip */}
              {hoveredTask?.id === task.id && (
                // --- THEME ---
                <div className="absolute z-10 left-0 top-full mt-1 w-64 p-3 bg-[var(--bg-card)] rounded-lg shadow-xl border border-[var(--border-color)]">
                  {/* --- THEME --- */}
                  <div className="font-medium text-sm mb-1 text-[var(--text-primary)]">{task.title}</div>
                  {task.description && (
                    // --- THEME ---
                    <div className="text-xs text-[var(--text-secondary)] mb-2">
                      {task.description}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    {/* --- THEME --- */}
                    <span className={`px-2 py-1 rounded-full ${getPriorityClasses(task.priority)}`}>
                      {task.priority} Priority
                    </span>
                    {task.dueDate && (
                      // --- THEME ---
                      <span className="flex items-center gap-1 text-[var(--text-secondary)]">
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
      </div>
    );
  }

  // --- FULL VIEW ---
  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Priority Filter Buttons */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {['high', 'medium', 'low'].map(priority => (
          <button
            key={priority}
            onClick={() => handlePriorityClick(priority)}
            // --- THEME --- Using new class functions
            className={`p-3 rounded-lg transition-all transform hover:scale-105 ${
              selectedPriority === priority
                ? `${getPriorityClasses(priority, true)} shadow-lg`
                : `${getPriorityClasses(priority, false)} hover:bg-${getPriorityColor(priority)}-500/20`
            }`}
          >
            {/* --- THEME --- Added text color for inactive state */}
            <div className={`text-xl font-bold ${selectedPriority !== priority ? `text-${getPriorityColor(priority)}-600` : ''}`}>
              {priorityDistribution[priority] || 0}
            </div>
            <div className={`text-xs capitalize ${selectedPriority !== priority ? `text-${getPriorityColor(priority)}-700` : ''}`}>
              {priority}
            </div>
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-3">
          <Flag size={16} className="text-red-500" />
          {/* --- THEME --- Added text color */}
          <h4 className="font-medium text-[var(--text-primary)]">
            {selectedPriority.charAt(0).toUpperCase() + selectedPriority.slice(1)} Priority Tasks ({filteredTasks.length})
          </h4>
        </div>
        
        {/* --- RESPONSIVE --- This list now scrolls and respects widget height */}
        <div 
          className="flex-1 space-y-2 overflow-y-auto"
          style={{ maxHeight: containerHeight > 200 ? containerHeight - 140 : 150 }} // 140px = approx height of other elements
        >
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task, index) => (
              <div 
                key={index}
                // --- THEME ---
                className="relative flex items-center gap-3 p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] hover:shadow-md transition-all cursor-pointer group"
                onMouseEnter={() => setHoveredTask(task)}
                onMouseLeave={() => setHoveredTask(null)}
                onClick={() => onTaskClick(task)}
              >
                <div className="flex-shrink-0">
                  {getPriorityIcon(task.priority)}
                </div>
                <div className="flex-1 min-w-0">
                  {/* --- THEME --- */}
                  <div className="font-medium text-sm truncate text-[var(--text-primary)]">{task.title}</div>
                  {task.planTitle && (
                    // --- THEME ---
                    <div className="text-xs text-[var(--text-secondary)] truncate">
                      {task.planTitle}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {task.dueDate && (
                      // --- THEME ---
                      <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                        <Calendar size={10} />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                    {task.estimatedTime && (
                      // --- THEME ---
                      <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                        <Clock size={10} />
                        {Math.floor(task.estimatedTime / 60)}h {task.estimatedTime % 60}m
                      </div>
                    )}
                  </div>
                </div>
                
                {/* --- THEME --- */}
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[var(--hover-bg)] text-[var(--text-secondary)] rounded">
                  <MoreVertical size={14} />
                </button>

                {/* Enhanced Hover Card */}
                {hoveredTask?.id === task.id && (
                  // --- THEME ---
                  <div className="absolute z-20 left-0 top-full mt-2 w-80 p-4 bg-[var(--bg-card)] rounded-lg shadow-2xl border border-[var(--border-color)]">
                    <div className="flex items-start justify-between mb-2">
                      {/* --- THEME --- */}
                      <div className="font-medium text-sm text-[var(--text-primary)]">{task.title}</div>
                      {/* --- THEME --- */}
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityClasses(task.priority)}`}>
                        {task.priority} Priority
                      </span>
                    </div>
                    
                    {task.description && (
                      // --- THEME ---
                      <div className="text-xs text-[var(--text-secondary)] mb-3">
                        {task.description}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {task.dueDate && (
                        <div>
                          {/* --- THEME --- */}
                          <div className="text-[var(--text-secondary)]">Due Date</div>
                          <div className="font-medium text-[var(--text-primary)]">{new Date(task.dueDate).toLocaleDateString()}</div>
                        </div>
                      )}
                      {task.estimatedTime && (
                        <div>
                          {/* --- THEME --- */}
                          <div className="text-[var(--text-secondary)]">Estimated Time</div>
                          <div className="font-medium text-[var(--text-primary)]">
                            {Math.floor(task.estimatedTime / 60)}h {task.estimatedTime % 60}m
                          </div>
                        </div>
                      )}
                      {task.planTitle && (
                        <div className="col-span-2">
                          {/* --- THEME --- */}
                          <div className="text-[var(--text-secondary)]">Project</div>
                          <div className="font-medium text-[var(--text-primary)]">{task.planTitle}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      {/* --- THEME --- Use accent color */}
                      <button className="flex-1 py-2 px-3 bg-[var(--accent-color)] text-white text-xs rounded hover:bg-[color-mix(in_srgb,var(--accent-color)_80%_black)] transition-colors">
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
            // --- THEME ---
            <div className="text-center py-8 text-[var(--text-secondary)]">
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