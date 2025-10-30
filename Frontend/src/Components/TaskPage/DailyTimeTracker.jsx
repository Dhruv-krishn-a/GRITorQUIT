// Frontend/src/Components/TaskPage/DailyTimeTracker.jsx
import React, { useState, useEffect } from 'react';
import { Clock, Play, Square, TrendingUp } from 'lucide-react';
import { analyticsAPI } from '../services/api';

const DailyTimeTracker = ({ 
  activeTimer, 
  onStopTimer, 
  dailyTime: propDailyTime,
  showTodayStats = true 
}) => {
  const [todayTime, setTodayTime] = useState(propDailyTime || 0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch today's time from analytics if not provided
  useEffect(() => {
    if (!propDailyTime && showTodayStats) {
      fetchTodayTime();
    }
  }, [propDailyTime, showTodayStats]);

  const fetchTodayTime = async () => {
    try {
      setIsLoading(true);
      const data = await analyticsAPI.getTimeStatistics('today');
      if (data.timeStats && data.timeStats.today) {
        // Convert time string like "2h 30m" to minutes
        const timeStr = data.timeStats.today;
        let minutes = 0;
        
        const hoursMatch = timeStr.match(/(\d+)h/);
        const minsMatch = timeStr.match(/(\d+)m/);
        
        if (hoursMatch) minutes += parseInt(hoursMatch[1]) * 60;
        if (minsMatch) minutes += parseInt(minsMatch[1]);
        
        setTodayTime(minutes);
      }
    } catch (error) {
      console.error('Error fetching today time:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (minutes) => {
    if (!minutes && minutes !== 0) return "00:00";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const getTimeDisplay = () => {
    if (activeTimer && propDailyTime !== undefined) {
      return formatTime(propDailyTime);
    }
    return formatTime(todayTime);
  };

  const getStatusText = () => {
    if (activeTimer) return 'Timer running...';
    if (isLoading) return 'Loading...';
    return 'Ready to focus';
  };

  return (
    <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-4 min-w-[200px]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-blue-400" />
          <span className="text-sm font-medium text-gray-300">Today's Focus</span>
        </div>
        {activeTimer && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-red-400">Live</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between mb-1">
        <span className="text-2xl font-bold text-white">
          {getTimeDisplay()}
        </span>
        {activeTimer ? (
          <button
            onClick={onStopTimer}
            className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            title="Stop timer"
          >
            <Square size={14} className="text-white" />
          </button>
        ) : (
          <div className="p-2 bg-gray-700 rounded-lg">
            <TrendingUp size={14} className="text-gray-400" />
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-400">
        {getStatusText()}
      </div>

      {/* Progress indicator for daily goal */}
      {todayTime > 0 && !activeTimer && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Daily Progress</span>
            <span>{Math.min(Math.round((todayTime / (8 * 60)) * 100), 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1">
            <div 
              className="bg-green-500 h-1 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((todayTime / (8 * 60)) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyTimeTracker;