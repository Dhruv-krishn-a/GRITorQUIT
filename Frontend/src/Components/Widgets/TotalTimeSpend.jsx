//Frontend/src/Components/Widgets/TotalTimeSpend.jsx
import React, { useMemo, useState, useEffect } from "react";
import { Clock, TrendingUp, Calendar, Target, Zap, RefreshCw, AlertCircle } from "lucide-react";
import { analyticsAPI } from "../services/api";

export default function TotalTimeSpend({
  containerWidth = 0,
  containerHeight = 0,
  isCompact = false,
  stats = {},
  recentActivity = [],
  pomodoroStats = {},
  onTimeRangeChange = () => {}
}) {
  const [timeRange, setTimeRange] = useState('week');
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState(null);

  // Fetch analytics data when timeRange changes
 // In TotalTimeSpend.jsx - Update the useEffect
useEffect(() => {
  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await analyticsAPI.getTimeStatistics(timeRange);
      
      if (data && data.timeStats) {
        setAnalyticsData(data);
        // Only call onTimeRangeChange if it's provided and we have new data
        if (onTimeRangeChange) {
          onTimeRangeChange(timeRange, data);
        }
      } else {
        throw new Error('Invalid data format from server');
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      // More specific error messages
      if (err.message.includes('Network Error') || err.message.includes('timeout')) {
        setError('Cannot connect to server. Using local data.');
      } else if (err.response?.status === 404) {
        setError('Analytics feature not available yet. Using local data.');
      } else {
        setError('Failed to load time statistics. Using local data.');
      }
      
      setAnalyticsData(null);
    } finally {
      setIsLoading(false);
    }
  };

  fetchAnalyticsData();
}, [timeRange]); // Remove onTimeRangeChange from dependencies to prevent loops

  const size = useMemo(() => {
    if (isCompact || (containerWidth > 0 && containerWidth < 360)) return "compact";
    if (containerWidth > 0 && containerWidth < 640) return "medium";
    return "large";
  }, [containerWidth, isCompact]);

  // Use analytics data if available, otherwise fall back to props
  const currentStats = analyticsData?.timeStats || stats;
  const currentPomodoroStats = analyticsData?.pomodoroStats || pomodoroStats;

  // Parse time string to minutes (e.g., "3h 45m" -> 225)
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    
    // Handle "0m" case
    if (timeStr === '0m') return 0;
    
    const hoursMatch = timeStr.match(/(\d+)h/);
    const minutesMatch = timeStr.match(/(\d+)m/);
    
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
    
    return hours * 60 + minutes;
  };

  // Format minutes to readable time (e.g., 225 -> "3h 45m")
  const formatMinutesToTime = (minutes) => {
    if (!minutes || minutes === 0) return "0m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Calculate progress percentage
  const calculatePercentage = (current, goal) => {
    if (!goal || goal === 0) return 0;
    return Math.min((current / goal) * 100, 100);
  };

  // Enhanced stats with real data and calculated goals
  const enhancedStats = useMemo(() => {
    const todayMinutes = parseTimeToMinutes(currentStats.today);
    const weekMinutes = parseTimeToMinutes(currentStats.week);
    const monthMinutes = parseTimeToMinutes(currentStats.month);
    const totalMinutes = parseTimeToMinutes(currentStats.total);

    // Calculate SMART goals based on period and historical data
    const getGoal = (period, currentMinutes = 0) => {
      const baseGoals = {
        today: 4 * 60, // 4 hours
        week: 20 * 60, // 20 hours
        month: 80 * 60, // 80 hours
        total: null
      };
      
      if (period === 'total') return null;
      
      // If user has historical data, adjust goal accordingly
      let goal = baseGoals[period];
      
      // Increase goal by 10% if consistently meeting it
      if (currentMinutes >= goal * 0.9) {
        goal = Math.round(goal * 1.1);
      }
      
      return goal;
    };

    // Calculate trends based on previous period performance
    const getTrend = (currentMinutes, period) => {
      // Mock previous data - in real app, this would come from backend
      const mockPreviousData = {
        today: Math.max(0, currentMinutes * 0.8),
        week: Math.max(0, currentMinutes * 0.85),
        month: Math.max(0, currentMinutes * 0.75),
        total: Math.max(0, currentMinutes * 0.5)
      };
      
      const previous = mockPreviousData[period] || 0;
      const difference = currentMinutes - previous;
      
      if (difference === 0 || previous === 0) return null;
      
      return difference > 0 
        ? `+${formatMinutesToTime(difference)}` 
        : `${formatMinutesToTime(difference)}`;
    };

    return {
      today: {
        value: currentStats.today || "0m",
        minutes: todayMinutes,
        goal: getGoal('today', todayMinutes),
        trend: getTrend(todayMinutes, 'today')
      },
      week: {
        value: currentStats.week || "0m",
        minutes: weekMinutes,
        goal: getGoal('week', weekMinutes),
        trend: getTrend(weekMinutes, 'week')
      },
      month: {
        value: currentStats.month || "0m",
        minutes: monthMinutes,
        goal: getGoal('month', monthMinutes),
        trend: getTrend(monthMinutes, 'month')
      },
      total: {
        value: currentStats.total || "0m",
        minutes: totalMinutes,
        goal: null,
        trend: getTrend(totalMinutes, 'total')
      }
    };
  }, [currentStats]);

  // Calculate additional insights from real data
  const additionalInsights = useMemo(() => {
    const todayMinutes = enhancedStats.today.minutes;
    const weekMinutes = enhancedStats.week.minutes;
    
    // Average per day (based on current week)
    const avgPerDay = weekMinutes > 0 ? Math.round(weekMinutes / 7) : 0;
    
    // Efficiency (completed tasks per hour)
    const completedTasks = recentActivity.filter(activity => activity.type === 'completed').length;
    const totalTrackedHours = weekMinutes / 60;
    const efficiency = totalTrackedHours > 0 ? Math.round((completedTasks / totalTrackedHours) * 10) : 0;
    
    // Active days this week
    const uniqueDays = new Set(
      recentActivity
        .filter(activity => activity.timeSpent > 0 || activity.type === 'completed')
        .map(activity => new Date(activity.timestamp).toDateString())
    );
    const activeDays = uniqueDays.size;

    return {
      avgPerDay,
      efficiency: Math.min(efficiency, 100),
      activeDays: Math.min(activeDays, 7)
    };
  }, [enhancedStats, recentActivity]);

  // Pomodoro insights
  const pomodoroInsights = useMemo(() => {
    const completed = currentPomodoroStats.completed || 0;
    const weekly = currentPomodoroStats.weekly || 0;
    const daily = currentPomodoroStats.daily || 0;
    const monthly = currentPomodoroStats.monthly || 0;
    
    const avgPerSession = completed > 0 ? Math.round(enhancedStats.total.minutes / completed) : 0;
    const completionRate = weekly > 0 ? Math.round((daily / weekly) * 100) : 0;
    
    return {
      completed,
      weekly,
      daily,
      monthly,
      avgPerSession,
      completionRate: Math.min(completionRate, 100)
    };
  }, [currentPomodoroStats, enhancedStats]);

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 70) return "bg-blue-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getTrendColor = (trend) => {
    if (!trend) return "text-gray-500";
    return trend.startsWith('+') ? "text-green-500" : "text-red-500";
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      const data = await analyticsAPI.getTimeStatistics(timeRange);
      setAnalyticsData(data);
      setError(null);
    } catch (err) {
      console.error('Failed to refresh analytics:', err);
      setError('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
  };

  if (size === "compact") {
    const today = enhancedStats.today;
    const todayPercentage = calculatePercentage(today.minutes, today.goal);
    
    return (
      <div className="bg-white dark:bg-[#141414] p-3 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-purple-500" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {isLoading ? "Loading..." : "Time Today"}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {today.trend && (
              <div className={`text-xs flex items-center gap-1 ${getTrendColor(today.trend)}`}>
                <TrendingUp size={10} />
                {today.trend}
              </div>
            )}
            <button 
              onClick={handleRefresh}
              className={`text-gray-400 hover:text-gray-600 transition-transform ${isLoading ? 'animate-spin' : 'hover:rotate-180'}`}
              disabled={isLoading}
            >
              <RefreshCw size={12} />
            </button>
          </div>
        </div>
        
        <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-1">
          {today.value}
        </div>
        
        <div className="flex justify-between text-xs text-neutral-400 mb-2">
          <span>Today</span>
          {today.goal ? (
            <span>Goal: {formatMinutesToTime(today.goal)}</span>
          ) : (
            <span>&nbsp;</span>
          )}
        </div>
        
        {today.goal && today.goal > 0 && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor(todayPercentage)}`}
              style={{ width: `${todayPercentage}%` }}
            />
          </div>
        )}
        
        {/* Pomodoro mini stats */}
        {pomodoroInsights.daily > 0 && (
          <div className="flex items-center justify-between mt-2 text-xs text-orange-500">
            <div className="flex items-center gap-1">
              <Target size={10} />
              <span>{pomodoroInsights.daily}🍅</span>
            </div>
            <span>Today</span>
          </div>
        )}

        {error && (
          <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
            <AlertCircle size={10} />
            {error}
          </div>
        )}
      </div>
    );
  }

  if (size === "medium") {
    return (
      <div className="bg-white dark:bg-[#141414] p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Clock size={16} className="text-purple-500" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {isLoading ? "Loading Time Data..." : "Time Tracking"}
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRefresh}
              className={`p-1 text-gray-400 hover:text-gray-600 rounded ${isLoading ? 'animate-spin' : 'hover:rotate-180'}`}
              disabled={isLoading}
            >
              <RefreshCw size={14} />
            </button>
            
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {['week', 'month', 'quarter'].map(range => (
                <button
                  key={range}
                  onClick={() => handleTimeRangeChange(range)}
                  disabled={isLoading}
                  className={`px-2 py-1 text-xs rounded-md capitalize transition-all ${
                    timeRange === range 
                      ? 'bg-purple-500 text-white' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          {['today', 'week'].map(key => {
            const stat = enhancedStats[key];
            const percentage = calculatePercentage(stat.minutes, stat.goal);
            
            return (
              <div key={key} className="relative p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {stat.value}
                </div>
                <div className="text-xs text-neutral-400 capitalize mb-2">
                  {key === 'today' ? 'Today' : 'This Week'}
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  {stat.goal ? (
                    <span className="text-gray-500">Goal: {formatMinutesToTime(stat.goal)}</span>
                  ) : (
                    <span>&nbsp;</span>
                  )}
                  {stat.trend && (
                    <span className={`flex items-center gap-1 ${getTrendColor(stat.trend)}`}>
                      <TrendingUp size={10} />
                      {stat.trend}
                    </span>
                  )}
                </div>
                
                {stat.goal && stat.goal > 0 && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-1000 ${getProgressColor(percentage)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}

          <div className="col-span-2 border-t border-neutral-200 dark:border-neutral-700 pt-3 mt-2">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {enhancedStats.month.value}
              </div>
              {enhancedStats.month.trend && (
                <div className={`text-xs flex items-center gap-1 ${getTrendColor(enhancedStats.month.trend)}`}>
                  <TrendingUp size={10} />
                  {enhancedStats.month.trend}
                </div>
              )}
            </div>
            <div className="text-xs text-neutral-400">This Month</div>
            
            {enhancedStats.month.goal && enhancedStats.month.goal > 0 && (
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Goal: {formatMinutesToTime(enhancedStats.month.goal)}</span>
                <span>{Math.round(calculatePercentage(enhancedStats.month.minutes, enhancedStats.month.goal))}%</span>
              </div>
            )}
          </div>

          {/* Pomodoro Stats */}
          {pomodoroInsights.weekly > 0 && (
            <div className="col-span-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 mt-2 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <Target size={14} />
                  <span className="font-medium">Pomodoros</span>
                </div>
                <div className="text-xs text-orange-500">
                  {pomodoroInsights.weekly} this week
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="col-span-2 bg-red-50 dark:bg-red-900/20 rounded-lg p-2 mt-2 border border-red-200 dark:border-red-800">
              <div className="text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle size={12} />
                {error}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#141414] p-5 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Clock size={20} className="text-purple-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Time Analytics {isLoading && "(Loading...)"}
            </h3>
            <p className="text-xs text-neutral-400">
              {timeRange === 'week' ? 'This Week' : 
               timeRange === 'month' ? 'This Month' : 
               'This Quarter'} Overview
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            className={`p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-transform ${
              isLoading ? 'animate-spin' : 'hover:rotate-180'
            }`}
            disabled={isLoading}
            title="Refresh data"
          >
            <RefreshCw size={16} />
          </button>
          
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {['week', 'month', 'quarter'].map(range => (
              <button
                key={range}
                onClick={() => handleTimeRangeChange(range)}
                disabled={isLoading}
                className={`px-3 py-1 text-xs rounded-md capitalize transition-all ${
                  timeRange === range 
                    ? 'bg-purple-500 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle size={16} />
            {error}
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-4 gap-4 text-center mb-6">
        {['today', 'week', 'month', 'total'].map((key, index) => {
          const stat = enhancedStats[key];
          const percentage = calculatePercentage(stat.minutes, stat.goal);
          const icons = [Zap, Target, Calendar, Clock];
          const IconComponent = icons[index];
          const labels = {
            today: 'Today',
            week: 'This Week',
            month: 'This Month',
            total: 'All Time'
          };
          
          return (
            <div key={key} className="relative p-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <IconComponent size={16} className="text-purple-500" />
                </div>
              </div>
              
              <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                {stat.value}
              </div>
              
              <div className="text-xs text-neutral-400 uppercase mb-3">
                {labels[key]}
              </div>

              {stat.goal && stat.goal > 0 && (
                <>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-gray-500">Goal: {formatMinutesToTime(stat.goal)}</span>
                    {stat.trend && (
                      <span className={`flex items-center gap-1 ${getTrendColor(stat.trend)}`}>
                        <TrendingUp size={10} />
                        {stat.trend}
                      </span>
                    )}
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
      <div className="grid grid-cols-3 gap-4 text-center border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
        <div>
          <div className="text-sm font-bold text-blue-600">
            {formatMinutesToTime(additionalInsights.avgPerDay)}
          </div>
          <div className="text-xs text-gray-500">Avg/Day</div>
        </div>
        <div>
          <div className="text-sm font-bold text-green-600">
            {additionalInsights.efficiency}%
          </div>
          <div className="text-xs text-gray-500">Efficiency</div>
        </div>
        <div>
          <div className="text-sm font-bold text-orange-600">
            {additionalInsights.activeDays}
          </div>
          <div className="text-xs text-gray-500">Active Days</div>
        </div>
      </div>

      {/* Pomodoro Insights */}
      {pomodoroInsights.completed > 0 && (
        <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <Target size={16} />
              <span className="font-medium">Pomodoro Analytics</span>
            </div>
            <div className="text-sm font-bold text-orange-600">
              {pomodoroInsights.completed} total
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="font-semibold text-orange-500">{pomodoroInsights.weekly}</div>
              <div className="text-gray-500">This Week</div>
            </div>
            <div>
              <div className="font-semibold text-orange-500">{pomodoroInsights.daily}</div>
              <div className="text-gray-500">Today</div>
            </div>
            <div>
              <div className="font-semibold text-orange-500">{pomodoroInsights.avgPerSession}m</div>
              <div className="text-gray-500">Avg/Session</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity Summary */}
      {recentActivity.length > 0 && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-blue-600 dark:text-blue-400">Recent Activity</span>
            <span className="text-xs text-blue-500">
              {recentActivity.length} activities
            </span>
          </div>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {recentActivity.slice(0, 3).map((activity, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400 truncate">
                  {activity.type === 'completed' ? '✅' : '⏱️'} {activity.task}
                </span>
                <span className="text-gray-500 whitespace-nowrap">
                  {activity.timeSpent ? formatMinutesToTime(activity.timeSpent) : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}