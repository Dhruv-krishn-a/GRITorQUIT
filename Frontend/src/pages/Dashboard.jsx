import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import PrioritizationFocus from "../Components/Widgets/PrioritizationFocus";
import SevenDayOverview from "../Components/Widgets/SevenDayOverview";
import TodayTasks from "../Components/Widgets/TodayTasks";
import TotalTimeSpend from "../Components/Widgets/TotalTimeSpend";
import UpcomingDeadlines from "../Components/Widgets/UpcomingDeadlines";
import ProjectProgress from "../Components/Widgets/ProjectProgress";
import TaskHeatmap from "../Components/Widgets/TaskHeatmap";
import ActivityNotes from "../Components/Widgets/ActivityNotes";
import MainLayout from "../MainLayout";
import { Plus, RefreshCw, Target, Clock, Calendar, Zap } from "lucide-react";
import { plansAPI, analyticsAPI } from "../Components/services/api";

const ResponsiveGridLayout = WidthProvider(Responsive);
const LAYOUT_STORAGE_KEY = "grit_dashboard_layout_v6";

// Move stable functions outside component to prevent recreation
const calculateTimeStatsFromPlans = (plans) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  
  const monthAgo = new Date(today);
  monthAgo.setMonth(today.getMonth() - 1);

  let totalTimeSpent = 0;
  let todayTimeSpent = 0;
  let weekTimeSpent = 0;
  let monthTimeSpent = 0;
  let totalPomodoros = 0;
  let todayPomodoros = 0;
  let weekPomodoros = 0;
  let monthPomodoros = 0;

  plans.forEach(plan => {
    if (plan.tasks && Array.isArray(plan.tasks)) {
      plan.tasks.forEach(task => {
        const taskTime = task.timeSpent || 0;
        const taskPomodoros = task.completedPomodoros || 0;

        totalTimeSpent += taskTime;
        totalPomodoros += taskPomodoros;

        if (task.completedAt) {
          const completedDate = new Date(task.completedAt);
          
          if (completedDate >= today) {
            todayTimeSpent += taskTime;
            todayPomodoros += taskPomodoros;
          }
          if (completedDate >= weekAgo) {
            weekTimeSpent += taskTime;
            weekPomodoros += taskPomodoros;
          }
          if (completedDate >= monthAgo) {
            monthTimeSpent += taskTime;
            monthPomodoros += taskPomodoros;
          }
        } else {
          weekTimeSpent += taskTime;
          weekPomodoros += taskPomodoros;
        }
      });
    }
  });

  const formatTime = (minutes) => {
    if (!minutes || minutes === 0) return "0m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return {
    timeStats: {
      today: formatTime(todayTimeSpent),
      week: formatTime(weekTimeSpent),
      month: formatTime(monthTimeSpent),
      total: formatTime(totalTimeSpent)
    },
    pomodoroStats: {
      completed: totalPomodoros,
      weekly: weekPomodoros,
      daily: todayPomodoros,
      monthly: monthPomodoros
    }
  };
};

export default function Dashboard({ username, onLogout }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentBreakpoint, setCurrentBreakpoint] = useState("lg");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('week');
  const [dashboardData, setDashboardData] = useState({
    plans: [],
    tasks: [],
    stats: {
      totalTimeSpent: { today: "0m", week: "0m", month: "0m", total: "0m" },
      taskCompletion: { completed: 0, total: 0, percentage: 0 },
      priorityDistribution: { high: 0, medium: 0, low: 0 },
      pomodoroStats: { completed: 0, weekly: 0, daily: 0, monthly: 0 },
      recentActivity: []
    }
  });

  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

  const defaultLgLayout = [
    { i: "prioritization", x: 0, y: 0, w: 6, h: 8 },
    { i: "overview", x: 6, y: 0, w: 6, h: 8 },
    { i: "today", x: 0, y: 8, w: 12, h: 6 },
    { i: "time", x: 0, y: 14, w: 12, h: 4 },
    { i: "deadlines", x: 0, y: 18, w: 6, h: 5 },
    { i: "projects", x: 6, y: 18, w: 6, h: 5 },
    { i: "heatmap", x: 0, y: 23, w: 6, h: 6 },
    { i: "notes", x: 6, y: 23, w: 6, h: 6 },
  ];

  const defaultLayouts = useMemo(() => {
    return {
      lg: defaultLgLayout,
      md: defaultLgLayout,
      sm: defaultLgLayout.map(item => ({ ...item, w: Math.min(item.w, 6), x: 0 })),
      xs: defaultLgLayout.map((item, idx) => ({ ...item, w: 4, x: 0, y: idx * 4 })),
      xxs: defaultLgLayout.map((item, idx) => ({ ...item, w: 2, x: 0, y: idx * 4 })),
    };
  }, []);

  const [layouts, setLayouts] = useState(() => {
    try {
      const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Could not parse saved layout:", e);
    }
    return defaultLayouts;
  });

  // Stable fetchDashboardData function with proper dependencies
  const fetchDashboardData = useCallback(async (period = 'week') => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch plans data
      const plans = await plansAPI.getAll();
      
      let timeAnalytics;
      let dashboardStats;
      
      // Try to fetch analytics data
      try {
        timeAnalytics = await analyticsAPI.getTimeStatistics(period);
        dashboardStats = await analyticsAPI.getDashboardStats();
      } catch (analyticsError) {
        console.warn('Analytics API not available, calculating from plans:', analyticsError.message);
        timeAnalytics = calculateTimeStatsFromPlans(plans);
        
        // Calculate dashboard stats from plans
        const totalTasks = plans.reduce((sum, plan) => sum + (plan.tasks?.length || 0), 0);
        const completedTasks = plans.reduce((sum, plan) => sum + (plan.tasks?.filter(task => task.completed).length || 0), 0);
        
        dashboardStats = {
          totalTasks,
          completedTasks,
          totalTime: timeAnalytics.timeStats.total,
          productivityScore: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          upcomingDeadlines: []
        };
      }
      
      // Extract all tasks from plans and calculate stats
      const allTasks = [];
      let completedTasks = 0;
      let totalTasks = 0;
      const priorityDistribution = { high: 0, medium: 0, low: 0 };
      const recentActivity = [];

      plans.forEach(plan => {
        if (plan.tasks && Array.isArray(plan.tasks)) {
          plan.tasks.forEach(task => {
            const taskWithPlan = {
              ...task.toObject ? task.toObject() : task,
              id: task._id || task.id || Math.random().toString(36).substr(2, 9),
              planTitle: plan.title,
              planId: plan._id || plan.id,
              timeSpent: task.timeSpent || 0,
              completedPomodoros: task.completedPomodoros || 0,
              completedAt: task.completedAt || null
            };
            
            allTasks.push(taskWithPlan);
            
            // Calculate statistics
            totalTasks++;
            if (task.completed) completedTasks++;
            
            // Priority distribution
            if (task.priority) {
              const priority = task.priority.toLowerCase();
              if (priorityDistribution[priority] !== undefined) {
                priorityDistribution[priority]++;
              }
            }
            
            // Recent activity (last 7 days)
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            
            if (task.completedAt) {
              const completedDate = new Date(task.completedAt);
              if (completedDate > weekAgo) {
                recentActivity.push({
                  type: 'completed',
                  task: task.title,
                  plan: plan.title,
                  timestamp: task.completedAt,
                  timeSpent: task.timeSpent || 0,
                  pomodoros: task.completedPomodoros || 0
                });
              }
            }

            // Add time tracking activities
            if (task.timeEntries && Array.isArray(task.timeEntries)) {
              task.timeEntries.forEach(entry => {
                const entryDate = new Date(entry.startTime);
                if (entryDate > weekAgo) {
                  recentActivity.push({
                    type: 'time_tracked',
                    task: task.title,
                    plan: plan.title,
                    timestamp: entry.startTime,
                    timeSpent: entry.duration,
                    sessionType: entry.type
                  });
                }
              });
            }
          });
        }
      });

      // Use dashboard stats from API or calculate locally
      const taskCompletion = dashboardStats.totalTasks > 0 ? {
        completed: dashboardStats.completedTasks,
        total: dashboardStats.totalTasks,
        percentage: Math.round((dashboardStats.completedTasks / dashboardStats.totalTasks) * 100)
      } : {
        completed: completedTasks,
        total: totalTasks,
        percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      };

      // Sort recent activity by timestamp
      recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setDashboardData({
        plans,
        tasks: allTasks,
        stats: {
          totalTimeSpent: timeAnalytics.timeStats,
          taskCompletion,
          priorityDistribution,
          pomodoroStats: timeAnalytics.pomodoroStats,
          recentActivity: recentActivity.slice(0, 15),
          dashboardStats
        }
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchDashboardData(timeRange);
  }, [timeRange, fetchDashboardData]);

  useEffect(() => {
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layouts));
    } catch (e) {
      console.warn("Failed to save layout:", e);
    }
  }, [layouts]);

  const resetLayout = () => setLayouts(defaultLayouts);

  const handleTimeRangeChange = useCallback((newRange, analyticsData) => {
    setTimeRange(newRange);
    if (analyticsData) {
      setDashboardData(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          totalTimeSpent: analyticsData.timeStats,
          pomodoroStats: analyticsData.pomodoroStats
        }
      }));
    }
  }, []);

  // Process data for specific widgets
  const getTodayTasks = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dashboardData.tasks.filter(task => {
      if (!task.date) return false;
      const taskDate = new Date(task.date);
      return taskDate.toDateString() === today.toDateString() && !task.completed;
    });
  }, [dashboardData.tasks]);

  const getUpcomingDeadlines = useCallback(() => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return dashboardData.tasks
      .filter(task => {
        if (!task.date || task.completed) return false;
        const taskDate = new Date(task.date);
        return taskDate > today && taskDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  }, [dashboardData.tasks]);

  const getHighPriorityTasks = useCallback(() => {
    return dashboardData.tasks
      .filter(task => task.priority?.toLowerCase() === 'high' && !task.completed)
      .slice(0, 5);
  }, [dashboardData.tasks]);

  const getSevenDayOverview = useCallback(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const dayTasks = dashboardData.tasks.filter(task => {
        if (!task.date) return false;
        const taskDate = new Date(task.date);
        return taskDate.toDateString() === date.toDateString();
      });
      
      const dayTime = dashboardData.tasks
        .filter(task => {
          if (task.completedAt) {
            const completedDate = new Date(task.completedAt);
            return completedDate.toDateString() === date.toDateString();
          }
          return false;
        })
        .reduce((sum, task) => sum + (task.timeSpent || 0), 0);
      
      days.unshift({
        date: date.toDateString(),
        tasks: dayTasks.length,
        completed: dayTasks.filter(t => t.completed).length,
        timeSpent: dayTime
      });
    }
    
    return days;
  }, [dashboardData.tasks]);

  const getTaskHeatmapData = useCallback(() => {
    return {
      high: dashboardData.tasks.filter(t => t.priority?.toLowerCase() === 'high').length,
      medium: dashboardData.tasks.filter(t => t.priority?.toLowerCase() === 'medium').length,
      low: dashboardData.tasks.filter(t => t.priority?.toLowerCase() === 'low').length,
      completed: dashboardData.tasks.filter(t => t.completed).length,
      pending: dashboardData.tasks.filter(t => !t.completed).length,
      withTime: dashboardData.tasks.filter(t => (t.timeSpent || 0) > 0).length,
      withPomodoros: dashboardData.tasks.filter(t => (t.completedPomodoros || 0) > 0).length
    };
  }, [dashboardData.tasks]);

  // WidgetCard component
  const WidgetCard = React.useCallback(({ title, children }) => {
    const ref = useRef(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
      if (!ref.current) return;
      const el = ref.current;
      
      const measure = () => {
        const contentRect = el.getBoundingClientRect();
        setSize({ 
          width: contentRect.width, 
          height: contentRect.height 
        });
      };
      
      measure();
      
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      
      return () => ro.disconnect();
    }, []);

    const isCompact = size.width > 0 && size.width < 400;

    const childWithProps = React.isValidElement(children)
      ? React.cloneElement(children, {
          containerWidth: size.width,
          containerHeight: size.height,
          isCompact: isCompact,
        })
      : children;

    return (
      <div
        ref={ref}
        className="h-full w-full bg-white dark:bg-[#141414] rounded-xl shadow-md transition-all duration-200 hover:shadow-lg"
      >
        <div
          className={`drag-handle flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 ${isEditMode ? "cursor-move" : "cursor-default"}`}
        >
          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{title}</div>
          <div className="text-xs text-neutral-400">{isEditMode ? "Drag to move" : ""}</div>
        </div>

        <div className="p-4 h-[calc(100%-52px)] overflow-hidden">
          {childWithProps}
        </div>
      </div>
    );
  }, [isEditMode]);

  // Enhanced header stats
  const HeaderStats = useCallback(() => {
    const formatTime = (timeStr) => {
      if (!timeStr || timeStr === "0m") return "0m";
      return timeStr;
    };

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="flex items-center gap-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Clock className="text-blue-400" size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">
              {formatTime(dashboardData.stats.totalTimeSpent[timeRange])}
            </div>
            <div className="text-sm text-blue-300 capitalize">
              {timeRange === 'week' ? 'This Week' : 
               timeRange === 'month' ? 'This Month' : 
               'This Quarter'}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Target className="text-green-400" size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {dashboardData.stats.pomodoroStats.weekly || 0}
            </div>
            <div className="text-sm text-green-300">Pomodoros This Week</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Zap className="text-purple-400" size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">
              {dashboardData.stats.taskCompletion.percentage}%
            </div>
            <div className="text-sm text-purple-300">Completion Rate</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <Calendar className="text-orange-400" size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-400">
              {dashboardData.tasks.length}
            </div>
            <div className="text-sm text-orange-300">Total Tasks</div>
          </div>
        </div>
      </div>
    );
  }, [dashboardData.stats, dashboardData.tasks.length, timeRange]);

  if (loading) {
    return (
      <MainLayout username={username} onLogout={onLogout}>
        <div className="flex justify-center items-center min-h-screen bg-[var(--bg-primary)]">
          <div className="text-[var(--text-primary)] text-lg flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            Loading dashboard...
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout username={username} onLogout={onLogout}>
      <div className="min-h-screen w-full bg-[var(--bg-primary)] text-[var(--text-primary)] px-4 sm:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
              Hello, {username || "User"}!
            </h1>
            <p className="text-sm text-gray-400">
              {dashboardData.tasks.length} tasks across {dashboardData.plans.length} plans • 
              {dashboardData.stats.taskCompletion.percentage}% completed
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchDashboardData(timeRange)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-[var(--hover-bg)] text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors"
              >
                <RefreshCw size={16} />
                Refresh
              </button>

              <button
                onClick={() => setIsEditMode((s) => !s)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isEditMode 
                    ? "bg-[var(--accent-color)] hover:opacity-90 text-white" 
                    : "bg-[var(--hover-bg)] text-[var(--text-primary)] hover:bg-[var(--border-color)]"
                }`}
              >
                {isEditMode ? "Exit Edit" : "Edit Layout"}
              </button>

              <button 
                onClick={resetLayout} 
                className="px-3 py-2 rounded-lg text-sm font-medium bg-[var(--hover-bg)] text-[var(--text-primary)] hover:bg-[var(--border-color)]"
              >
                Reset Layout
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Header Stats */}
        <HeaderStats />

        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-700 text-red-200 px-6 py-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-red-300 hover:text-white">
              ×
            </button>
          </div>
        )}

        {mounted ? (
          <ResponsiveGridLayout
            className="layout"
            breakpoints={breakpoints}
            cols={cols}
            layouts={layouts}
            rowHeight={30}
            margin={[16, 16]}
            isDraggable={isEditMode}
            isResizable={isEditMode}
            onLayoutChange={(layout, allLayouts) => setLayouts(allLayouts)}
            onBreakpointChange={setCurrentBreakpoint}
            measureBeforeMount={false}
            useCSSTransforms={mounted}
            draggableHandle=".drag-handle"
            compactType="vertical"
            preventCollision={false}
          >
            <div key="prioritization">
              <WidgetCard title="Prioritization Focus">
                <PrioritizationFocus 
                  highPriorityTasks={getHighPriorityTasks()}
                  priorityDistribution={dashboardData.stats.priorityDistribution}
                  pomodoroStats={dashboardData.stats.pomodoroStats}
                />
              </WidgetCard>
            </div>

            <div key="overview">
              <WidgetCard title="7-Day Overview">
                <SevenDayOverview 
                  weekData={getSevenDayOverview()}
                  totalTasks={dashboardData.tasks.length}
                />
              </WidgetCard>
            </div>

            <div key="today">
              <WidgetCard title="Today's Tasks">
                <TodayTasks 
                  tasks={getTodayTasks()}
                  totalTasks={dashboardData.tasks.length}
                />
              </WidgetCard>
            </div>

            <div key="time">
              <WidgetCard title="Time Analytics">
                <TotalTimeSpend 
                  stats={dashboardData.stats.totalTimeSpent}
                  recentActivity={dashboardData.stats.recentActivity}
                  pomodoroStats={dashboardData.stats.pomodoroStats}
                  onTimeRangeChange={handleTimeRangeChange}
                />
              </WidgetCard>
            </div>

            <div key="deadlines">
              <WidgetCard title="Upcoming Deadlines">
                <UpcomingDeadlines 
                  tasks={getUpcomingDeadlines()}
                  totalUpcoming={dashboardData.tasks.filter(t => !t.completed && new Date(t.date) > new Date()).length}
                />
              </WidgetCard>
            </div>

            <div key="projects">
              <WidgetCard title="Project Progress">
                <ProjectProgress 
                  plans={dashboardData.plans}
                  completionStats={dashboardData.stats.taskCompletion}
                />
              </WidgetCard>
            </div>

            <div key="heatmap">
              <WidgetCard title="Task Heatmap">
                <TaskHeatmap 
                  heatmapData={getTaskHeatmapData()}
                  totalTasks={dashboardData.tasks.length}
                />
              </WidgetCard>
            </div>

            <div key="notes">
              <WidgetCard title="Activity Notes">
                <ActivityNotes 
                  activities={dashboardData.stats.recentActivity}
                  totalActivities={dashboardData.stats.recentActivity.length}
                />
              </WidgetCard>
            </div>
          </ResponsiveGridLayout>
        ) : (
          <div className="text-gray-400">Loading layout…</div>
        )}
      </div>
    </MainLayout>
  );
}