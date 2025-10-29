import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { Plus, RefreshCw } from "lucide-react";
import { plansAPI } from "../Components/services/api";

const ResponsiveGridLayout = WidthProvider(Responsive);
const LAYOUT_STORAGE_KEY = "grit_dashboard_layout_v3";

export default function Dashboard({ username, onLogout }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentBreakpoint, setCurrentBreakpoint] = useState("lg");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    plans: [],
    tasks: [],
    stats: {
      totalTimeSpent: { today: "0h 0m", week: "0h 0m", month: "0h 0m", total: "0h 0m" },
      taskCompletion: { completed: 0, total: 0, percentage: 0 },
      priorityDistribution: { high: 0, medium: 0, low: 0 },
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

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const plans = await plansAPI.getAll();
      
      // Extract all tasks from plans
      const allTasks = [];
      let totalTimeSpent = 0;
      let completedTasks = 0;
      let totalTasks = 0;
      const priorityDistribution = { high: 0, medium: 0, low: 0 };
      const recentActivity = [];

      plans.forEach(plan => {
        if (plan.tasks && Array.isArray(plan.tasks)) {
          plan.tasks.forEach(task => {
            const taskWithPlan = {
              ...task,
              id: task._id || Math.random().toString(36).substr(2, 9),
              planTitle: plan.title,
              planId: plan._id,
              timeSpent: task.timeSpent || 0,
              completedAt: task.completedAt || null
            };
            
            allTasks.push(taskWithPlan);
            
            // Calculate statistics
            totalTimeSpent += task.timeSpent || 0;
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
            if (task.completedAt) {
              const completedDate = new Date(task.completedAt);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              
              if (completedDate > weekAgo) {
                recentActivity.push({
                  type: 'completed',
                  task: task.title,
                  plan: plan.title,
                  timestamp: task.completedAt,
                  timeSpent: task.timeSpent || 0
                });
              }
            }
          });
        }
      });

      // Calculate time statistics
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);

      const formatTimeStats = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
      };

      // For now, we'll use total time for all periods (you can enhance this with date filtering)
      const timeStats = {
        today: formatTimeStats(totalTimeSpent), // This should be filtered by today
        week: formatTimeStats(totalTimeSpent),  // This should be filtered by week
        month: formatTimeStats(totalTimeSpent), // This should be filtered by month
        total: formatTimeStats(totalTimeSpent)
      };

      const taskCompletion = {
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
          totalTimeSpent: timeStats,
          taskCompletion,
          priorityDistribution,
          recentActivity: recentActivity.slice(0, 10) // Last 10 activities
        }
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layouts));
    } catch (e) {
      console.warn("Failed to save layout:", e);
    }
  }, [layouts]);

  const resetLayout = () => setLayouts(defaultLayouts);

  // Process data for specific widgets
  const getTodayTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dashboardData.tasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate.toDateString() === today.toDateString() && !task.completed;
    });
  };

  const getUpcomingDeadlines = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return dashboardData.tasks
      .filter(task => {
        const taskDate = new Date(task.date);
        return taskDate > today && taskDate <= nextWeek && !task.completed;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5); // Top 5 upcoming
  };

  const getHighPriorityTasks = () => {
    return dashboardData.tasks
      .filter(task => task.priority?.toLowerCase() === 'high' && !task.completed)
      .slice(0, 5); // Top 5 high priority
  };

  const getSevenDayOverview = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayTasks = dashboardData.tasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate.toDateString() === date.toDateString();
      });
      
      days.push({
        date: date.toDateString(),
        tasks: dayTasks.length,
        completed: dayTasks.filter(t => t.completed).length
      });
    }
    
    return days;
  };

  const getTaskHeatmapData = () => {
    // This would typically be more complex time-based data
    // For now, we'll create a simple distribution by priority and status
    return {
      high: dashboardData.tasks.filter(t => t.priority?.toLowerCase() === 'high').length,
      medium: dashboardData.tasks.filter(t => t.priority?.toLowerCase() === 'medium').length,
      low: dashboardData.tasks.filter(t => t.priority?.toLowerCase() === 'low').length,
      completed: dashboardData.tasks.filter(t => t.completed).length,
      pending: dashboardData.tasks.filter(t => !t.completed).length
    };
  };

  // WidgetCard component
  const WidgetCard = ({ title, children }) => {
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
        className="h-full w-full bg-white dark:bg-[#141414] rounded-xl shadow-md transition-all duration-200"
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
  };

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
                onClick={fetchDashboardData}
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

        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-700 text-red-200 px-6 py-4 rounded-xl flex items-center justify-between">
            <span>{error}</span>
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
              <WidgetCard title="Total Time Spent">
                <TotalTimeSpend 
                  stats={dashboardData.stats.totalTimeSpent}
                  recentActivity={dashboardData.stats.recentActivity}
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