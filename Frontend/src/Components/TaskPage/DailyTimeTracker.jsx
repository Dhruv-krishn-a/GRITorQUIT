import React from 'react';
import { Clock, Play, Square } from 'lucide-react';

const DailyTimeTracker = ({ dailyTime, activeTimer, onStopTimer }) => {
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
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
      
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-white">
          {formatTime(dailyTime)}
        </span>
        {activeTimer && (
          <button
            onClick={onStopTimer}
            className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            title="Stop timer"
          >
            <Square size={14} className="text-white" />
          </button>
        )}
      </div>
      
      <div className="text-xs text-gray-400 mt-1">
        {activeTimer ? 'Timer running...' : 'Ready to focus'}
      </div>
    </div>
  );
};

export default DailyTimeTracker;