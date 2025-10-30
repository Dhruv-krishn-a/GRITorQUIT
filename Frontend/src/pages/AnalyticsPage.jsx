// Frontend/src/pages/AnalyticsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  PieChart, 
  Activity,
  Zap,
  Award,
  Download,
  Filter
} from 'lucide-react';
import MainLayout from '../MainLayout';
import { analyticsAPI, plansAPI } from '../Components/services/api';

export default function AnalyticsPage({ username, onLogout }) {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyticsData, setAnalyticsData] = useState({
    timeStats: { today: "0m", week: "0m", month: "0m", total: "0m" },
    pomodoroStats: { completed: 0, weekly: 0, daily: 0, monthly: 0 },
    productivity: { efficiency: 0, consistency: 0, focusTime: "0m", completedTasks: 0, totalTasks: 0 },
    taskDistribution: { high: 0, medium: 0, low: 0, completed: 0, pending: 0 },
    weeklyTrend: [],
    peakHours: [],
    projectStats: []
  });

  // Fetch analytics data for the Analytics Page
  const fetchAnalyticsData = async (period = 'month') => {
    try {
      setLoading(true);
      setError('');

      // Fetch all analytics data
      const [timeData, productivityData, pomodoroData, plansData] = await Promise.all([
        analyticsAPI.getTimeStatistics(period),
        analyticsAPI.getProductivityData(period),
        analyticsAPI.getPomodoroStats(period),
        plansAPI.getAll()
      ]);

      // Calculate additional analytics from plans
      const taskDistribution = calculateTaskDistribution(plansData);
      const weeklyTrend = calculateWeeklyTrend(plansData);
      const peakHours = calculatePeakHours(plansData);
      const projectStats = calculateProjectStats(plansData);

      setAnalyticsData({
        timeStats: timeData.timeStats,
        pomodoroStats: timeData.pomodoroStats,
        productivity: productivityData,
        taskDistribution,
        weeklyTrend,
        peakHours,
        projectStats
      });

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Calculate task distribution from plans
  const calculateTaskDistribution = (plans) => {
    const distribution = { high: 0, medium: 0, low: 0, completed: 0, pending: 0 };
    
    plans.forEach(plan => {
      if (plan.tasks && Array.isArray(plan.tasks)) {
        plan.tasks.forEach(task => {
          // Priority distribution
          const priority = task.priority?.toLowerCase() || 'medium';
          if (distribution[priority] !== undefined) {
            distribution[priority]++;
          }
          
          // Completion status
          if (task.completed) {
            distribution.completed++;
          } else {
            distribution.pending++;
          }
        });
      }
    });
    
    return distribution;
  };

  // Calculate weekly trend
  const calculateWeeklyTrend = (plans) => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      let tasksCompleted = 0;
      let timeSpent = 0;
      let pomodoros = 0;
      
      plans.forEach(plan => {
        if (plan.tasks && Array.isArray(plan.tasks)) {
          plan.tasks.forEach(task => {
            if (task.completedAt) {
              const completedDate = new Date(task.completedAt);
              if (completedDate.toDateString() === date.toDateString()) {
                tasksCompleted++;
                timeSpent += task.timeSpent || 0;
                pomodoros += task.completedPomodoros || 0;
              }
            }
            
            // Also check time entries for this day
            if (task.timeEntries && Array.isArray(task.timeEntries)) {
              task.timeEntries.forEach(entry => {
                const entryDate = new Date(entry.startTime);
                if (entryDate.toDateString() === date.toDateString()) {
                  timeSpent += entry.duration || 0;
                }
              });
            }
          });
        }
      });
      
      days.push({
        date: date.toDateString(),
        tasksCompleted,
        timeSpent,
        pomodoros,
        efficiency: tasksCompleted > 0 ? Math.min(Math.round((timeSpent / tasksCompleted) / 60 * 100), 100) : 0
      });
    }
    
    return days;
  };

  // Calculate peak productive hours
  const calculatePeakHours = (plans) => {
    const hours = Array(24).fill(0).map((_, i) => ({ hour: i, count: 0 }));
    
    plans.forEach(plan => {
      if (plan.tasks && Array.isArray(plan.tasks)) {
        plan.tasks.forEach(task => {
          if (task.timeEntries && Array.isArray(task.timeEntries)) {
            task.timeEntries.forEach(entry => {
              const entryHour = new Date(entry.startTime).getHours();
              hours[entryHour].count += entry.duration || 0;
            });
          }
          
          // Also consider completion times
          if (task.completedAt) {
            const completedHour = new Date(task.completedAt).getHours();
            hours[completedHour].count += 30; // Assume 30 minutes per task
          }
        });
      }
    });
    
    return hours.sort((a, b) => b.count - a.count).slice(0, 6);
  };

  // Calculate project statistics
  const calculateProjectStats = (plans) => {
    return plans.map(plan => {
      const totalTasks = plan.tasks?.length || 0;
      const completedTasks = plan.tasks?.filter(task => task.completed).length || 0;
      const totalTime = plan.tasks?.reduce((sum, task) => sum + (task.timeSpent || 0), 0) || 0;
      const totalPomodoros = plan.tasks?.reduce((sum, task) => sum + (task.completedPomodoros || 0), 0) || 0;
      
      return {
        title: plan.title,
        progress: plan.progress || 0,
        totalTasks,
        completedTasks,
        totalTime,
        totalPomodoros,
        efficiency: completedTasks > 0 ? Math.round(totalTime / completedTasks) : 0
      };
    }).sort((a, b) => b.totalTime - a.totalTime);
  };

  useEffect(() => {
    fetchAnalyticsData(timeRange);
  }, [timeRange]);

  // Format time for display
  const formatTime = (timeStr) => {
    if (!timeStr || timeStr === "0m") return "0m";
    return timeStr;
  };

  // Calculate productivity score
  const productivityScore = useMemo(() => {
    const { efficiency, consistency } = analyticsData.productivity;
    return Math.round((efficiency + consistency) / 2);
  }, [analyticsData.productivity]);

  if (loading) {
    return (
      <MainLayout username={username} onLogout={onLogout}>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout username={username} onLogout={onLogout}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
        {/* Header */}
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Deep insights into your productivity and performance
              </p>
            </div>
            
            <div className="flex items-center gap-4 mt-4 lg:mt-0">
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
                <Filter size={16} className="text-gray-500" />
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300"
                >
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="quarter">Last 90 Days</option>
                </select>
              </div>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                <Download size={16} />
                <span className="text-sm">Export</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Focus Time */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Clock className="text-blue-500" size={20} />
                </div>
                <TrendingUp className="text-green-500" size={16} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {formatTime(analyticsData.timeStats[timeRange])}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Total Focus Time
              </p>
              <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                +12% from last period
              </div>
            </div>

            {/* Pomodoros Completed */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Target className="text-orange-500" size={20} />
                </div>
                <TrendingUp className="text-green-500" size={16} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {analyticsData.pomodoroStats.completed}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Pomodoros Completed
              </p>
              <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                +8% from last period
              </div>
            </div>

            {/* Productivity Score */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Zap className="text-green-500" size={20} />
                </div>
                <TrendingUp className="text-green-500" size={16} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {productivityScore}%
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Productivity Score
              </p>
              <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                +5% from last period
              </div>
            </div>

            {/* Tasks Completed */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Award className="text-purple-500" size={20} />
                </div>
                <TrendingUp className="text-green-500" size={16} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {analyticsData.productivity.completedTasks}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Tasks Completed
              </p>
              <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                +15% from last period
              </div>
            </div>
          </div>

          {/* Charts and Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Time Distribution Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Time Distribution
                </h3>
                <BarChart3 className="text-gray-500" size={20} />
              </div>
              
              <div className="space-y-4">
                {Object.entries(analyticsData.timeStats).map(([period, time]) => (
                  <div key={period} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {period}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatTime(time)}
                      </span>
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min((parseInt(time) || 0) / 480 * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Task Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Task Distribution
                </h3>
                <PieChart className="text-gray-500" size={20} />
              </div>
              
              <div className="space-y-4">
                {Object.entries(analyticsData.taskDistribution).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {type === 'completed' ? 'Completed' : 
                       type === 'pending' ? 'Pending' : 
                       `${type} Priority`}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {count}
                      </span>
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            type === 'completed' ? 'bg-green-500' :
                            type === 'pending' ? 'bg-yellow-500' :
                            type === 'high' ? 'bg-red-500' :
                            type === 'medium' ? 'bg-blue-500' : 'bg-gray-500'
                          }`}
                          style={{ 
                            width: `${Math.min((count / Math.max(1, Object.values(analyticsData.taskDistribution).reduce((a, b) => a + b, 0))) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Trend and Peak Hours */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Weekly Trend */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Weekly Trend
                </h3>
                <Activity className="text-gray-500" size={20} />
              </div>
              
              <div className="space-y-3">
                {analyticsData.weeklyTrend.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-20">
                      {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                    </span>
                    <div className="flex-1 mx-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>{day.tasksCompleted} tasks</span>
                        <span>{Math.round(day.timeSpent / 60)}h focused</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${day.efficiency}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white w-12 text-right">
                      {day.efficiency}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Peak Productive Hours */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Peak Productive Hours
                </h3>
                <TrendingUp className="text-gray-500" size={20} />
              </div>
              
              <div className="space-y-4">
                {analyticsData.peakHours.map((hourData, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {hourData.hour === 0 ? '12 AM' : 
                       hourData.hour < 12 ? `${hourData.hour} AM` :
                       hourData.hour === 12 ? '12 PM' : 
                       `${hourData.hour - 12} PM`}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">
                        {Math.round(hourData.count / 60)}h
                      </span>
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min((hourData.count / Math.max(1, analyticsData.peakHours[0]?.count || 1)) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Project Performance
              </h3>
              <BarChart3 className="text-gray-500" size={20} />
            </div>
            
            <div className="space-y-4">
              {analyticsData.projectStats.slice(0, 5).map((project, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {project.title}
                    </h4>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{project.completedTasks}/{project.totalTasks} tasks</span>
                      <span>{Math.round(project.totalTime / 60)}h spent</span>
                      <span>{project.totalPomodoros} pomodoros</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-500 mb-1">
                      {project.progress}%
                    </div>
                    <div className="text-xs text-gray-500">Progress</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <Target className="text-blue-500 mb-3" size={24} />
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Focus Efficiency
              </h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                You're most productive between {analyticsData.peakHours[0]?.hour || 10}-{analyticsData.peakHours[0]?.hour + 1 || 11} AM. Schedule important tasks during this time.
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <TrendingUp className="text-green-500 mb-3" size={24} />
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                Consistency Score
              </h4>
              <p className="text-green-700 dark:text-green-300 text-sm">
                Your consistency is {analyticsData.productivity.consistency}%. Try to maintain at least 5 productive days per week.
              </p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
              <Zap className="text-purple-500 mb-3" size={24} />
              <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                Task Completion
              </h4>
              <p className="text-purple-700 dark:text-purple-300 text-sm">
                You complete {analyticsData.productivity.completedTasks} tasks on average. Focus on breaking down larger tasks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}