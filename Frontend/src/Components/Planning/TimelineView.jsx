import React, { useState } from 'react';

const TimelineView = ({ 
  tasks, 
  startDate, 
  endDate, 
  onTaskToggle, 
  onTaskDelete, 
  onTaskEdit 
}) => {
  const [editingTask, setEditingTask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Not Started',
    tags: []
  });
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');

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

  // Filter and sort tasks
  const getFilteredAndSortedTasks = () => {
    let filteredTasks = [...tasks];
    
    // Apply filter
    if (filter !== 'All') {
      filteredTasks = filteredTasks.filter(task => 
        filter === 'Completed' ? task.completed :
        filter === 'Active' ? !task.completed :
        task.priority === filter
      );
    }
    
    // Apply sort
    filteredTasks.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
        default: // date
          return new Date(a.date) - new Date(b.date);
      }
    });
    
    return groupTasksByDay(filteredTasks);
  };

  const filteredGroupedTasks = getFilteredAndSortedTasks();

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-500/20 border-red-500/50';
      case 'Medium': return 'bg-yellow-500/20 border-yellow-500/50';
      case 'Low': return 'bg-green-500/20 border-green-500/50';
      default: return 'bg-gray-600/20 border-gray-500/50';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-500/20 text-green-300';
      case 'In Progress': return 'bg-yellow-500/20 text-yellow-300';
      case 'Blocked': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const handleEditClick = (task) => {
    setEditingTask(task._id || task.id);
    setEditForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'Medium',
      status: task.status || 'Not Started',
      tags: task.tags || []
    });
  };

  const handleSaveEdit = () => {
    if (editForm.title.trim()) {
      onTaskEdit(editingTask, editForm);
      setEditingTask(null);
      setEditForm({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Not Started',
        tags: []
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditForm({
      title: '',
      description: '',
      priority: 'Medium',
      status: 'Not Started',
      tags: []
    });
  };

  const handleDeleteClick = (taskId) => {
    setDeleteConfirm(taskId);
  };

  const confirmDelete = () => {
    onTaskDelete(deleteConfirm);
    setDeleteConfirm(null);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const addTag = (tagText) => {
    const tag = tagText.trim();
    if (tag && !editForm.tags.includes(tag)) {
      setEditForm(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setEditForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getProgressPercentage = (task) => {
    if (!task.subtasks || task.subtasks.length === 0) {
      return task.completed ? 100 : 0;
    }
    const completed = task.subtasks.filter(st => st.completed).length;
    return (completed / task.subtasks.length) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 mb-6 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Project Timeline
              </h1>
              <p className="text-gray-400 mt-2">
                {days.length} days • {tasks.length} tasks • {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="All">All Tasks</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
              
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="date">Sort by Date</option>
                <option value="priority">Sort by Priority</option>
                <option value="title">Sort by Title</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {days.map((day, index) => {
            const dateKey = day.toDateString();
            const dayTasks = filteredGroupedTasks[dateKey] || [];
            const isToday = day.toDateString() === new Date().toDateString();
            
            if (dayTasks.length === 0 && filter !== 'All') return null;

            return (
              <div 
                key={dateKey} 
                className={`bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-5 transition-all duration-300 hover:shadow-xl hover:border-cyan-500/30 ${
                  isToday ? 'ring-2 ring-cyan-500/50 bg-cyan-500/10' : ''
                } animate-slideIn`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className={`text-sm font-semibold ${
                      isToday ? 'text-cyan-400' : 'text-gray-400'
                    }`}>
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={`text-xl font-bold ${
                      isToday ? 'text-cyan-300' : 'text-white'
                    }`}>
                      {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  
                  {isToday && (
                    <div className="relative">
                      <div className="w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
                      <div className="w-3 h-3 bg-cyan-500 rounded-full absolute top-0"></div>
                    </div>
                  )}
                </div>

                {/* Task Count */}
                {dayTasks.length > 0 ? (
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <span>{dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}</span>
                    <span className="text-green-400">
                      {dayTasks.filter(task => task.completed).length} completed
                    </span>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm">No tasks</p>
                  </div>
                )}

                {/* Tasks Cards */}
                <div className="space-y-3">
                  {dayTasks.map((task, taskIndex) => (
                    <div 
                      key={task._id || task.id}
                      className={`p-4 rounded-xl border-l-4 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                        task.completed 
                          ? 'bg-gray-700/50 border-gray-500' 
                          : getPriorityColor(task.priority)
                      } animate-fadeIn`}
                      style={{ animationDelay: `${taskIndex * 100}ms` }}
                    >
                      {editingTask === (task._id || task.id) ? (
                        /* Edit Form */
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full p-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                            placeholder="Task title"
                            autoFocus
                          />
                          
                          <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full p-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none text-sm"
                            placeholder="Description"
                            rows="2"
                          />
                          
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={editForm.priority}
                              onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value }))}
                              className="p-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                            >
                              <option value="High">High</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                            </select>
                            
                            <select
                              value={editForm.status}
                              onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                              className="p-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                            >
                              <option value="Not Started">Not Started</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                              <option value="Blocked">Blocked</option>
                            </select>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSaveEdit}
                              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Task Card Display */
                        <div className="group">
                          {/* Header with Checkbox and Actions */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start space-x-3 flex-1">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => onTaskToggle(task._id || task.id)}
                                className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 mt-1 flex-shrink-0"
                              />
                              
                              <div className="flex-1 min-w-0">
                                <h3 className={`font-semibold ${
                                  task.completed ? 'text-gray-400 line-through' : 'text-white'
                                }`}>
                                  {task.title}
                                </h3>
                                
                                {task.description && (
                                  <p className="text-gray-300 text-sm mt-1 line-clamp-2">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <button
                                onClick={() => handleEditClick(task)}
                                className="p-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all duration-300 hover:scale-110"
                                title="Edit task"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              
                              <button
                                onClick={() => handleDeleteClick(task._id || task.id)}
                                className="p-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all duration-300 hover:scale-110"
                                title="Delete task"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          {task.subtasks && task.subtasks.length > 0 && (
                            <div className="mb-3">
                              <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Progress</span>
                                <span>{task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${getProgressPercentage(task)}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* Tags and Status */}
                          <div className="flex flex-wrap gap-1">
                            {task.priority && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                task.priority === 'High' ? 'bg-red-500/20 text-red-300' :
                                task.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                'bg-green-500/20 text-green-300'
                              }`}>
                                {task.priority}
                              </span>
                            )}
                            
                            {task.status && task.status !== 'Not Started' && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                {task.status}
                              </span>
                            )}
                            
                            {task.tags && task.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                            
                            {task.tags && task.tags.length > 2 && (
                              <span className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full text-xs">
                                +{task.tags.length - 2}
                              </span>
                            )}
                          </div>

                          {/* Time Estimate */}
                          {task.estimated && (
                            <div className="flex items-center space-x-1 text-xs text-gray-400 mt-2">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{task.estimated}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {Object.keys(filteredGroupedTasks).length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-12">
              <svg className="w-16 h-16 mx-auto text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No tasks found</h3>
              <p className="text-gray-500">Try changing your filters or add new tasks</p>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 max-w-sm mx-4 animate-popIn">
              <h3 className="text-xl font-bold text-white mb-2">Delete Task</h3>
              <p className="text-gray-300 mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
              
              <div className="flex space-x-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Styles */}
        <style jsx>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes popIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-slideIn {
            animation: slideIn 0.5s ease-out forwards;
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
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
    </div>
  );
};

export default TimelineView;