// backend/routes/analytics.js
import express from 'express';
import { getTimeAnalytics, getDashboardStats } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protection to all analytics routes
router.use(protect);

// Get time statistics
router.get('/time', getTimeAnalytics);

// Get dashboard overview stats
router.get('/dashboard', getDashboardStats);

// Other analytics endpoints
router.get('/productivity', async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    // For now, return mock data - implement real logic later
    res.json({
      period,
      efficiency: 75,
      consistency: 82,
      focusTime: "12h 30m",
      completedTasks: 24,
      totalTasks: 32
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching productivity data' });
  }
});

router.get('/pomodoro', async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    // This would integrate with your pomodoro data
    res.json({
      period,
      completed: 15,
      weekly: 8,
      daily: 2,
      monthly: 15,
      avgPerSession: 4,
      completionRate: 85
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pomodoro stats' });
  }
});

export default router;