// backend/models/Plan.js
import mongoose from "mongoose";

const subtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date
});

const timeEntrySchema = new mongoose.Schema({
  startTime: {
    type: Date,
    required: true
  },
  endTime: Date,
  duration: {
    type: Number, // in minutes
    default: 0
  },
  type: {
    type: String,
    enum: ['pomodoro', 'break', 'focus'],
    default: 'focus'
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  date: {
    type: Date, 
    required: true 
  }, 
  subtasks: [subtaskSchema], 
  tags: [String], 
  estimatedTime: Number, // in minutes
  timeSpent: {
    type: Number,
    default: 0
  },
  timeEntries: [timeEntrySchema],
  status: { 
    type: String, 
    enum: ['Not Started', 'In Progress', 'Completed'], 
    default: 'Not Started' 
  }, 
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Medium' 
  },
  pomodoroTarget: {
    type: Number,
    default: 4
  },
  completedPomodoros: {
    type: Number,
    default: 0
  },
  lastPomodoroAt: Date
}, {
  timestamps: true
});

const planSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  }, 
  description: String, 
  startDate: Date, 
  endDate: Date, 
  tasks: [taskSchema], 
  progress: { 
    type: Number, 
    default: 0 
  }, 
  totalTasks: { 
    type: Number, 
    default: 0 
  }, 
  completedTasks: { 
    type: Number, 
    default: 0 
  }, 
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  } 
}, { 
  timestamps: true 
});

// Update progress before saving
planSchema.pre('save', function(next) {
  if (this.tasks && this.tasks.length > 0) {
    this.totalTasks = this.tasks.length;
    this.completedTasks = this.tasks.filter(task => task.completed).length;
    this.progress = this.totalTasks > 0 ? Math.round((this.completedTasks / this.totalTasks) * 100) : 0;
  }
  next();
});

const Plan = mongoose.model("Plan", planSchema);
export default Plan;