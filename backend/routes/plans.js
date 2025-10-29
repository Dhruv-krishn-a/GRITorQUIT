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
router.delete('/:id', async (req, res) => {
  try {
    const plan = await Plan.findOneAndDelete({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    });
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update task status
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
    
    await plan.save();
    res.json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
    await plan.save();
    res.json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;