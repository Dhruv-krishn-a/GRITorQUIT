import React, { useMemo, useState, useEffect } from "react";
import { Clock, TrendingUp, Calendar, Target, Zap } from "lucide-react";

export default function TotalTimeSpend({
  containerWidth = 0,
  containerHeight = 0,
  isCompact = false,
  stats = {},
  onTimeRangeChange = () => {}
}) {
  const [timeRange, setTimeRange] = useState('week');
  const [animatedStats, setAnimatedStats] = useState({});
  const [progress, setProgress] = useState(0);

  const size = useMemo(() => {
    if (isCompact || (containerWidth > 0 && containerWidth < 360)) return "compact";
    if (containerWidth > 0 && containerWidth < 640) return "medium";
    return "large";
  }, [containerWidth, isCompact]);

  // Enhanced stats with goals and trends
  const enhancedStats = useMemo(() => ({
    today: { value: "3h 45m", goal: "4h", trend: "+15m" },
    week: { value: "28h 15m", goal: "30h", trend: "+2h" },
    month: { value: "112h 30m", goal: "120h", trend: "+8h" },
    total: { value: "1450h 05m", goal: null, trend: "+45h" },
    ...stats
  }), [stats]);

  useEffect(() => {
    // Animation for numbers
    const timer = setTimeout(() => {
      setAnimatedStats(enhancedStats);
      setProgress(75); // This would be calculated from actual vs goal
    }, 300);

    return () => clearTimeout(timer);
  }, [enhancedStats]);

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 70) return "bg-blue-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const calculatePercentage = (current, goal) => {
    if (!goal) return 0;
    const currentNum = parseInt(current);
    const goalNum = parseInt(goal);
    return Math.min((currentNum / goalNum) * 100, 100);
  };

  if (size === "compact") {
    const today = enhancedStats.today;
    const todayPercentage = calculatePercentage(today.value, today.goal);
    
    return (
      <div className="bg-white dark:bg-[#141414] p-3 rounded-xl shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-purple-500" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Time</h3>
          </div>
          <div className="text-xs text-green-500 flex items-center gap-1">
            <TrendingUp size={10} />
            {today.trend}
          </div>
        </div>
        
        <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-1">
          {today.value}
        </div>
        
        <div className="flex justify-between text-xs text-neutral-400 mb-2">
          <span>Today</span>
          <span>Goal: {today.goal}</span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor(todayPercentage)}`}
            style={{ width: `${todayPercentage}%` }}
          />
        </div>
      </div>
    );
  }

  if (size === "medium") {
    return (
      <div className="bg-white dark:bg-[#141414] p-4 rounded-xl shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Clock size={16} className="text-purple-500" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Time Tracking</h3>
          </div>
          
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {['day', 'week', 'month'].map(range => (
              <button
                key={range}
                onClick={() => {
                  setTimeRange(range);
                  onTimeRangeChange(range);
                }}
                className={`px-2 py-1 text-xs rounded-md capitalize transition-all ${
                  timeRange === range 
                    ? 'bg-purple-500 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          {['today', 'week'].map(key => {
            const stat = enhancedStats[key];
            const percentage = calculatePercentage(stat.value, stat.goal);
            
            return (
              <div key={key} className="relative p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {stat.value}
                </div>
                <div className="text-xs text-neutral-400 capitalize mb-2">{key}</div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Goal: {stat.goal}</span>
                  <span className="text-green-500 flex items-center gap-1">
                    <TrendingUp size={10} />
                    {stat.trend}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-1000 ${getProgressColor(percentage)}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}

          <div className="col-span-2 border-t border-neutral-200 dark:border-neutral-700 pt-3 mt-2">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {enhancedStats.month.value}
              </div>
              <div className="text-green-500 text-xs flex items-center gap-1">
                <TrendingUp size={10} />
                {enhancedStats.month.trend}
              </div>
            </div>
            <div className="text-xs text-neutral-400">Past Month</div>
            
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Goal: {enhancedStats.month.goal}</span>
              <span>{Math.round(calculatePercentage(enhancedStats.month.value, enhancedStats.month.goal))}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#141414] p-5 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Clock size={20} className="text-purple-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Time Analytics</h3>
            <p className="text-xs text-neutral-400">Track your productivity</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {['week', 'month', 'quarter'].map(range => (
              <button
                key={range}
                onClick={() => {
                  setTimeRange(range);
                  onTimeRangeChange(range);
                }}
                className={`px-3 py-1 text-xs rounded-md capitalize transition-all ${
                  timeRange === range 
                    ? 'bg-purple-500 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-4 gap-4 text-center mb-6">
        {['today', 'week', 'month', 'total'].map((key, index) => {
          const stat = enhancedStats[key];
          const percentage = calculatePercentage(stat.value, stat.goal);
          const icons = [Zap, Target, Calendar, Clock];
          const IconComponent = icons[index];
          
          return (
            <div key={key} className="relative p-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex justify-center mb-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <IconComponent size={16} className="text-purple-500" />
                </div>
              </div>
              
              <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                {stat.value}
              </div>
              
              <div className="text-xs text-neutral-400 uppercase mb-3">
                {key === 'today' ? 'Today' : key === 'week' ? 'This Week' : key === 'month' ? 'This Month' : 'Total'}
              </div>

              {stat.goal && (
                <>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-gray-500">Goal: {stat.goal}</span>
                    <span className="text-green-500 flex items-center gap-1">
                      <TrendingUp size={10} />
                      {stat.trend}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor(percentage)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {Math.round(percentage)}%
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-3 gap-4 text-center border-t border-gray-200 dark:border-gray-700 pt-4">
        <div>
          <div className="text-sm font-bold text-blue-600">4.2h</div>
          <div className="text-xs text-gray-500">Avg/Day</div>
        </div>
        <div>
          <div className="text-sm font-bold text-green-600">87%</div>
          <div className="text-xs text-gray-500">Efficiency</div>
        </div>
        <div>
          <div className="text-sm font-bold text-orange-600">12</div>
          <div className="text-xs text-gray-500">Active Days</div>
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Weekly Trend</span>
          <span className="text-green-500 flex items-center gap-1">
            <TrendingUp size={12} />
            +12% from last week
          </span>
        </div>
        <div className="flex items-end justify-between h-8 mt-2">
          {[4, 6, 5, 7, 8, 6, 9].map((height, index) => (
            <div
              key={index}
              className="flex-1 mx-1 bg-blue-400 rounded-t transition-all hover:bg-blue-500"
              style={{ height: `${height * 8}%` }}
              title={`${height}h`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}