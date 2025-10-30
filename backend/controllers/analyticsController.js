// backend/controllers/analyticsController.js
import Plan from "../models/Plan.js";

export const getTimeAnalytics = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    const userId = req.user._id;

    console.log(`Fetching analytics for user ${userId}, period: ${period}`);

    // Get all plans for the user
    const plans = await Plan.find({ createdBy: userId });

    const now = new Date();
    let startDate;

    switch (period) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      default:
        startDate = new Date(0); // All time
    }

    let totalTimeSpent = 0;
    let todayTimeSpent = 0;
    let weekTimeSpent = 0;
    let monthTimeSpent = 0;
    let totalPomodoros = 0;
    let todayPomodoros = 0;
    let weekPomodoros = 0;
    let monthPomodoros = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    
    const monthAgo = new Date(today);
    monthAgo.setMonth(today.getMonth() - 1);

    // Process all tasks from all plans
    plans.forEach(plan => {
      if (plan.tasks && Array.isArray(plan.tasks)) {
        plan.tasks.forEach(task => {
          const taskTime = task.timeSpent || 0;
          const taskPomodoros = task.completedPomodoros || 0;

          totalTimeSpent += taskTime;
          totalPomodoros += taskPomodoros;

          // Check completion date or creation date for time period filtering
          const taskDate = task.completedAt ? new Date(task.completedAt) : new Date(task.date || plan.createdAt);
          
          if (taskDate >= today) {
            todayTimeSpent += taskTime;
            todayPomodoros += taskPomodoros;
          }
          if (taskDate >= weekAgo) {
            weekTimeSpent += taskTime;
            weekPomodoros += taskPomodoros;
          }
          if (taskDate >= monthAgo) {
            monthTimeSpent += taskTime;
            monthPomodoros += taskPomodoros;
          }

          // Process time entries for more granular tracking
          if (task.timeEntries && Array.isArray(task.timeEntries)) {
            task.timeEntries.forEach(entry => {
              const entryDate = new Date(entry.startTime);
              if (entryDate >= startDate) {
                // Time entries are already included in timeSpent, so we don't double count
              }
            });
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

    const response = {
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
      },
      period,
      startDate,
      endDate: now
    };

    console.log('Analytics response:', response);
    res.json(response);

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch analytics data',
      error: error.message 
    });
  }
};

// Additional analytics endpoints
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const plans = await Plan.find({ createdBy: userId });
    
    let totalTasks = 0;
    let completedTasks = 0;
    const upcomingDeadlines = [];
    
    plans.forEach(plan => {
      if (plan.tasks && Array.isArray(plan.tasks)) {
        totalTasks += plan.tasks.length;
        completedTasks += plan.tasks.filter(task => task.completed).length;
        
        // Get upcoming deadlines (next 7 days)
        plan.tasks.forEach(task => {
          if (!task.completed && task.date) {
            const taskDate = new Date(task.date);
            const today = new Date();
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);
            
            if (taskDate >= today && taskDate <= nextWeek) {
              upcomingDeadlines.push({
                title: task.title,
                date: task.date,
                plan: plan.title,
                priority: task.priority || 'Medium'
              });
            }
          }
        });
      }
    });
    
    // Sort by date
    upcomingDeadlines.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    res.json({
      totalTasks,
      completedTasks,
      totalTime: "0m", // This would need separate calculation
      productivityScore: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      upcomingDeadlines: upcomingDeadlines.slice(0, 5)
    });
    
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};