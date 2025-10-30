//Frontend/src/Components/TaskPage/Toolbar.jsx
import React, { useState, useRef, useEffect } from 'react'; // Added useRef and useEffect
import {
  Inbox,
  Calendar,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Search,
  CheckCircle2,
  List
} from 'lucide-react';

export default function Toolbar({ 
  onQuickAddClick, 
  activeView, 
  onViewChange, 
  searchQuery, 
  onSearchChange,
  priorityFilter,
  onPriorityFilter,
  sortBy,
  onSortBy
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const filterRef = useRef(null);
  const sortRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSort(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navItems = [
    { id: 'all', icon: List, label: 'All Tasks' },
    { id: 'today', icon: Calendar, label: 'Today' },
    { id: 'upcoming', icon: ChevronRight, label: 'Upcoming' },
    { id: 'overdue', icon: Inbox, label: 'Overdue' },
    { id: 'completed', icon: CheckCircle2, label: 'Completed' },
  ];

  const sortOptions = [
    { value: 'date', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'title', label: 'Title' },
    { value: 'time', label: 'Time Spent' },
  ];

  const priorityFilters = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const dateFilters = [
    { value: 'all', label: 'Any Date' },
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'week', label: 'This Week' },
    { value: 'next-week', label: 'Next Week' },
  ];

  const handleApplyFilters = () => {
    setShowFilters(false);
  };

  const handleCloseFilters = () => {
    setShowFilters(false);
  };

  const handleSortChange = (value) => {
    onSortBy(value);
    setShowSort(false);
  };

  // Stop propagation for filter panel clicks
  const handleFilterPanelClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
      {/* Main Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-6">
        {/* Navigation */}
        <nav className="flex items-center space-x-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-80">
            <Search 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            />
            <input
              type="text"
              placeholder="Search tasks by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                  showFilters
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800 border-gray-700'
                }`}
              >
                <Filter size={18} />
                <span>Filter</span>
              </button>
            </div>
            
            {/* Sort Dropdown */}
            <div className="relative" ref={sortRef}>
              <button 
                onClick={() => setShowSort(!showSort)}
                className="flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all border border-gray-700"
              >
                <ArrowUpDown size={18} />
                <span>Sort</span>
              </button>
              
              {showSort && (
                <div 
                  className="absolute right-0 top-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20 min-w-48 py-2"
                  onClick={handleFilterPanelClick}
                >
                  {sortOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`flex items-center justify-between w-full px-4 py-2 text-sm text-left transition-colors ${
                        sortBy === option.value
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <span>{option.label}</span>
                      {sortBy === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div 
          ref={filterRef}
          className="px-6 pb-6 border-t border-gray-800 pt-4"
          onClick={handleFilterPanelClick}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => onSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {sortOptions.map(option => (
                  <option 
                    key={option.value} 
                    value={option.value}
                    className="bg-gray-800 text-white"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => onPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {priorityFilters.map(filter => (
                  <option 
                    key={filter.value} 
                    value={filter.value}
                    className="bg-gray-800 text-white"
                  >
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Due Date
              </label>
              <select 
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {dateFilters.map(filter => (
                  <option 
                    key={filter.value} 
                    value={filter.value}
                    className="bg-gray-800 text-white"
                  >
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-end gap-2">
              <button 
                onClick={handleApplyFilters}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Apply Filters
              </button>
              <button 
                onClick={handleCloseFilters}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          <div className="mt-4 flex flex-wrap gap-2">
            {priorityFilter !== 'all' && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm border border-blue-500/30">
                <span>Priority: {priorityFilter}</span>
                <button 
                  onClick={() => onPriorityFilter('all')}
                  className="text-blue-300 hover:text-blue-100"
                >
                  ×
                </button>
              </div>
            )}
            {sortBy !== 'date' && (
              <div className="flex items-center gap-2 px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm border border-purple-500/30">
                <span>Sort: {sortOptions.find(opt => opt.value === sortBy)?.label}</span>
                <button 
                  onClick={() => onSortBy('date')}
                  className="text-purple-300 hover:text-purple-100"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}