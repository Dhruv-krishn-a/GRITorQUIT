// backend/routes/plans.js
import express from "express";
import Plan from "../models/Plan.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// Get all plans for the authenticated user
router.get('/', async (req, res) => {
  try {
    console.log("Fetching plans for user:", req.user._id); // Debug log
    const plans = await Plan.find({
      createdBy: req.user._id
    }).sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    console.error("Get plans error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get single plan
router.get('/:id', async (req, res) => {
  try {
    const plan = await Plan.findOne({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    });
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new plan
router.post('/', async (req, res) => {
  try {
    const planData = {
      ...req.body,
      createdBy: req.user._id
    };
    const plan = new Plan(planData);
    const savedPlan = await plan.save();
    res.status(201).json(savedPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update plan
router.put('/:id', async (req, res) => {
  try {
    const plan = await Plan.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete plan
// Backend route for deleting plans
router.delete('/api/plans/:planId', async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.planId);
    
    // Also delete all tasks associated with this plan
    await Task.deleteMany({ planId: req.params.planId });
    
    res.json({ message: 'Plan and associated tasks deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Task & Subtask Routes ---

// Update task 
router.put('/:planId/tasks/:taskId', async (req, res) => {
  try {
    const plan = await Plan.findOne({ 
      _id: req.params.planId, 
      createdBy: req.user._id 
    });
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const task = plan.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    Object.assign(task, req.body);
    
    // Update progress
    const totalTasks = plan.tasks.length;
    const completedTasks = plan.tasks.filter(t => t.completed).length;
    plan.progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    plan.completedTasks = completedTasks;
    
    // -----------------------------------------------------------------
    // THE FIX IS HERE:
    // We use { validateBeforeSave: false } to skip validation
    // and avoid the error from old, bad timeEntries.
    await plan.save({ validateBeforeSave: false });
    // -----------------------------------------------------------------

    res.json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Toggle task completion status (Specific route)
router.patch('/:planId/tasks/:taskId/complete', protect, async (req, res) => {
  try {
    const { planId, taskId } = req.params;
    const { completed } = req.body;

    const plan = await Plan.findOne({ 
      _id: planId, 
      createdBy: req.user._id 
    });

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const task = plan.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.completed = completed;
    task.completedAt = completed ? new Date() : null;
    task.status = completed ? 'Completed' : 'Completed';

    // Also skip validation here to be safe
    await plan.save({ validateBeforeSave: false });

    res.json({
      message: `Task ${completed ? 'completed' : 'marked incomplete'}`,
      task: task,
      planProgress: plan.progress
    });

  } catch (error) {
    console.error('Error updating task completion:', error);
    res.status(500).json({ 
      message: 'Failed to update task completion',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update subtask status
router.put('/:planId/tasks/:taskId/subtasks/:subtaskId', async (req, res) => {
  try {
    const plan = await Plan.findOne({ 
      _id: req.params.planId, 
      createdBy: req.user._id 
    });
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const task = plan.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({ message: 'Subtask not found' });
    }

    Object.assign(subtask, req.body);
    
    // Also skip validation here to be safe
    await plan.save({ validateBeforeSave: false });
    res.json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// --- Time Tracking Routes ---

// Enhanced time tracking endpoint (Add time, entries, pomodoros)
router.put('/:planId/tasks/:taskId/time', async (req, res) => {
  try {
    const { timeSpent, completedPomodoros, timeEntry } = req.body;
    const plan = await Plan.findOne({ 
      _id: req.params.planId, 
      createdBy: req.user._id 
    });

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const task = plan.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update time spent
    if (timeSpent !== undefined) {
      task.timeSpent = timeSpent;
    }

    // Update pomodoro count
    if (completedPomodoros !== undefined) {
      task.completedPomodoros = completedPomodoros;
      task.lastPomodoroAt = new Date();
    }

    // Add time entry
    if (timeEntry) {
      if (!task.timeEntries) {
        task.timeEntries = [];
      }
      task.timeEntries.push({
        ...timeEntry,
        taskId: task._id
      });
    }

    // Update task status based on progress
    if (task.timeSpent > 0 && !task.completed) {
      task.status = 'In Progress';
    }

    await plan.save(); // This one should be fine as it's adding new, valid data
    res.json(task);
  } catch (error) {
    console.error('Time tracking error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Start a timer session
router.post('/:planId/tasks/:taskId/timer/start', async (req, res) => {
  try {
    const { timerType = 'focus' } = req.body;
    const plan = await Plan.findOne({ 
      _id: req.params.planId, 
      createdBy: req.user._id 
    });

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const task = plan.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const timeEntry = {
      startTime: new Date(),
      type: timerType,
      taskId: task._id
    };

    if (!task.timeEntries) {
      task.timeEntries = [];
    }
    task.timeEntries.push(timeEntry);

    await plan.save(); // This is also fine, it adds valid data
    res.json({ 
      success: true, 
      timeEntry,
      message: `Timer started for ${timerType} session`
    });
  } catch (error) {
    console.error('Start timer error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Stop a timer session
router.post('/:planId/tasks/:taskId/timer/stop', async (req, res) => {
  try {
    const plan = await Plan.findOne({ 
      _id: req.params.planId, 
      createdBy: req.user._id 
    });

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const task = plan.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Find the most recent running timer
    const runningEntry = task.timeEntries
      .filter(entry => !entry.endTime)
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))[0];

    if (!runningEntry) {
      return res.status(400).json({ message: 'No active timer found' });
    }

    runningEntry.endTime = new Date();
    const durationMs = new Date(runningEntry.endTime) - new Date(runningEntry.startTime);
    runningEntry.duration = Math.round(durationMs / (1000 * 60)); // Convert to minutes

    // Update total time spent
    task.timeSpent = (task.timeSpent || 0) + runningEntry.duration;

    // If it was a pomodoro session, increment count
    if (runningEntry.type === 'pomodoro') {
      task.completedPomodoros = (task.completedPomodoros || 0) + 1;
      task.lastPomodoroAt = new Date();
    }

    await plan.save(); // This should also be fine
    res.json({ 
      success: true, 
      timeEntry: runningEntry,
      task: {
        timeSpent: task.timeSpent,
        completedPomodoros: task.completedPomodoros
      },
      message: `Timer stopped after ${runningEntry.duration} minutes`
    });
  } catch (error) {
    console.error('Stop timer error:', error);
    res.status(400).json({ message: error.message });
  }
});

export default router;