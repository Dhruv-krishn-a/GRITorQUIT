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

  // Semantic colors - these are OK to keep
  const getProgressColor = (percentage) => {
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 70) return "bg-blue-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getTrendColor = (trend) => {
    if (!trend) return "text-[var(--text-secondary)]";
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
      // --- THEME ---
      <div className="bg-[var(--bg-card)] p-3 rounded-xl shadow-md border border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* --- THEME --- */}
            <Clock size={14} className="text-[var(--accent-color)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
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
              // --- THEME ---
              className={`text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-transform ${isLoading ? 'animate-spin' : 'hover:rotate-180'}`}
              disabled={isLoading}
            >
              <RefreshCw size={12} />
            </button>
          </div>
        </div>
        
        {/* --- THEME --- */}
        <div className="text-lg font-bold text-[var(--text-primary)] mb-1">
          {today.value}
        </div>
        
        {/* --- THEME --- */}
        <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-2">
          <span>Today</span>
          {today.goal ? (
            <span>Goal: {formatMinutesToTime(today.goal)}</span>
          ) : (
            <span>&nbsp;</span>
          )}
        </div>
        
        {today.goal && today.goal > 0 && (
          // --- THEME ---
          <div className="w-full bg-[var(--hover-bg)] rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor(todayPercentage)}`}
              style={{ width: `${todayPercentage}%` }}
            />
          </div>
        )}
        
        {/* Pomodoro mini stats (Semantic color OK) */}
        {pomodoroInsights.daily > 0 && (
          <div className="flex items-center justify-between mt-2 text-xs text-orange-500">
            <div className="flex items-center gap-1">
              <Target size={10} />
              <span>{pomodoroInsights.daily}🍅</span>
            </div>
            <span>Today</span>
          </div>
        )}

        {/* Error (Semantic color OK) */}
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
      // --- THEME ---
      <div className="bg-[var(--bg-card)] p-4 rounded-xl shadow-md border border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* --- THEME --- */}
            <Clock size={16} className="text-[var(--accent-color)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              {isLoading ? "Loading Time Data..." : "Time Tracking"}
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRefresh}
              // --- THEME ---
              className={`p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded ${isLoading ? 'animate-spin' : 'hover:rotate-180'}`}
              disabled={isLoading}
            >
              <RefreshCw size={14} />
            </button>
            
            {/* --- THEME --- */}
            <div className="flex gap-1 bg-[var(--hover-bg)] rounded-lg p-1">
              {['week', 'month', 'quarter'].map(range => (
                <button
                  key={range}
                  onClick={() => handleTimeRangeChange(range)}
                  disabled={isLoading}
                  className={`px-2 py-1 text-xs rounded-md capitalize transition-all ${
                    timeRange === range 
                      // --- THEME ---
                      ? 'bg-[var(--accent-color)] text-white' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
              // --- THEME ---
              <div key={key} className="relative p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                {/* --- THEME --- */}
                <div className="text-lg font-bold text-[var(--text-primary)]">
                  {stat.value}
                </div>
                <div className="text-xs text-[var(--text-secondary)] capitalize mb-2">
                  {key === 'today' ? 'Today' : 'This Week'}
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  {/* --- THEME --- */}
                  {stat.goal ? (
                    <span className="text-[var(--text-secondary)]">Goal: {formatMinutesToTime(stat.goal)}</span>
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
                  // --- THEME ---
                  <div className="w-full bg-[var(--hover-bg)] rounded-full h-1.5 mt-2">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-1000 ${getProgressColor(percentage)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* --- THEME --- */}
          <div className="col-span-2 border-t border-[var(--border-color)] pt-3 mt-2">
            <div className="flex items-center justify-between mb-2">
              {/* --- THEME --- */}
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                {enhancedStats.month.value}
              </div>
              {enhancedStats.month.trend && (
                <div className={`text-xs flex items-center gap-1 ${getTrendColor(enhancedStats.month.trend)}`}>
                  <TrendingUp size={10} />
                  {enhancedStats.month.trend}
                </div>
              )}
            </div>
            {/* --- THEME --- */}
            <div className="text-xs text-[var(--text-secondary)]">This Month</div>
            
            {enhancedStats.month.goal && enhancedStats.month.goal > 0 && (
              // --- THEME ---
              <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-1">
                <span>Goal: {formatMinutesToTime(enhancedStats.month.goal)}</span>
                <span>{Math.round(calculatePercentage(enhancedStats.month.minutes, enhancedStats.month.goal))}%</span>
              </div>
            )}
          </div>

          {/* Pomodoro Stats (Theme-agnostic opacity) */}
          {pomodoroInsights.weekly > 0 && (
            // --- THEME ---
            <div className="col-span-2 bg-orange-500/10 rounded-lg p-3 mt-2 border border-orange-500/30">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-orange-500">
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
            // --- THEME ---
            <div className="col-span-2 bg-red-500/10 rounded-lg p-2 mt-2 border border-red-500/30">
              <div className="text-xs text-red-500 flex items-center gap-2">
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
    // --- THEME ---
    <div className="bg-[var(--bg-card)] p-5 rounded-xl shadow-md border border-[var(--border-color)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* --- THEME --- */}
          <div className="p-2 bg-[var(--accent-color)]/10 rounded-lg">
            <Clock size={20} className="text-[var(--accent-color)]" />
          </div>
          <div>
            {/* --- THEME --- */}
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Time Analytics {isLoading && "(Loading...)"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {timeRange === 'week' ? 'This Week' : 
               timeRange === 'month' ? 'This Month' : 
               'This Quarter'} Overview
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            // --- THEME ---
            className={`p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-transform ${
              isLoading ? 'animate-spin' : 'hover:rotate-180'
            }`}
            disabled={isLoading}
            title="Refresh data"
          >
            <RefreshCw size={16} />
          </button>
          
          {/* --- THEME --- */}
          <div className="flex gap-1 bg-[var(--hover-bg)] rounded-lg p-1">
            {['week', 'month', 'quarter'].map(range => (
              <button
                key={range}
                onClick={() => handleTimeRangeChange(range)}
                disabled={isLoading}
                className={`px-3 py-1 text-xs rounded-md capitalize transition-all ${
                  timeRange === range 
                    // --- THEME ---
                    ? 'bg-[var(--accent-color)] text-white' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display (Theme-agnostic opacity) */}
      {error && (
        // --- THEME ---
        <div className="mb-4 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
          <div className="flex items-center gap-2 text-sm text-red-500">
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
            // --- THEME ---
            <div key={key} className="relative p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-3">
                {/* --- THEME --- */}
                <div className="p-2 bg-[var(--accent-color)]/10 rounded-lg">
                  <IconComponent size={16} className="text-[var(--accent-color)]" />
                </div>
              </div>
              
              {/* --- THEME --- */}
              <div className="text-xl font-bold text-[var(--text-primary)] mb-1">
                {stat.value}
              </div>
              
              {/* --- THEME --- */}
              <div className="text-xs text-[var(--text-secondary)] uppercase mb-3">
                {labels[key]}
              </div>

              {stat.goal && stat.goal > 0 && (
                <>
                  <div className="flex items-center justify-between text-xs mb-2">
                    {/* --- THEME --- */}
                    <span className="text-[var(--text-secondary)]">Goal: {formatMinutesToTime(stat.goal)}</span>
                    {stat.trend && (
                      <span className={`flex items-center gap-1 ${getTrendColor(stat.trend)}`}>
                        <TrendingUp size={10} />
                        {stat.trend}
                      </span>
                    )}
                  </div>
                  
                  {/* --- THEME --- */}
                  <div className="w-full bg-[var(--hover-bg)] rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor(percentage)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  {/* --- THEME --- */}
                  <div className="text-xs text-[var(--text-secondary)] mt-1 text-right">
                    {Math.round(percentage)}%
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Additional Insights */}
      {/* --- THEME --- */}
      <div className="grid grid-cols-3 gap-4 text-center border-t border-[var(--border-color)] pt-4 mb-4">
        <div>
          {/* Semantic colors OK */}
          <div className="text-sm font-bold text-blue-600">
            {formatMinutesToTime(additionalInsights.avgPerDay)}
          </div>
          {/* --- THEME --- */}
          <div className="text-xs text-[var(--text-secondary)]">Avg/Day</div>
        </div>
        <div>
          {/* Semantic colors OK */}
          <div className="text-sm font-bold text-green-600">
            {additionalInsights.efficiency}%
          </div>
          {/* --- THEME --- */}
          <div className="text-xs text-[var(--text-secondary)]">Efficiency</div>
        </div>
        <div>
          {/* Semantic colors OK */}
          <div className="text-sm font-bold text-orange-600">
            {additionalInsights.activeDays}
          </div>
          {/* --- THEME --- */}
          <div className="text-xs text-[var(--text-secondary)]">Active Days</div>
        </div>
      </div>

      {/* Pomodoro Insights (Theme-agnostic opacity) */}
      {pomodoroInsights.completed > 0 && (
        // --- THEME ---
        <div className="mb-4 p-3 bg-orange-500/10 rounded-lg border border-orange-500/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-orange-600">
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
              {/* --- THEME --- */}
              <div className="text-[var(--text-secondary)]">This Week</div>
            </div>
            <div>
              <div className="font-semibold text-orange-500">{pomodoroInsights.daily}</div>
              {/* --- THEME --- */}
              <div className="text-[var(--text-secondary)]">Today</div>
            </div>
            <div>
              <div className="font-semibold text-orange-500">{pomodoroInsights.avgPerSession}m</div>
              {/* --- THEME --- */}
              <div className="text-[var(--text-secondary)]">Avg/Session</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity Summary (Theme-agnostic opacity) */}
      {recentActivity.length > 0 && (
        // --- THEME ---
        <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-blue-500">Recent Activity</span>
            <span className="text-xs text-blue-500">
              {recentActivity.length} activities
            </span>
          </div>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {recentActivity.slice(0, 3).map((activity, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                {/* --- THEME --- */}
                <span className="text-[var(--text-secondary)] truncate">
                  {activity.type === 'completed' ? '✅' : '⏱️'} {activity.task}
                </span>
                {/* --- THEME --- */}
                <span className="text-[var(--text-secondary)] whitespace-nowrap">
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