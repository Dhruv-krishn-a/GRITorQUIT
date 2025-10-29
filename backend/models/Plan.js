import mongoose from "mongoose";

const subtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
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
  date: {
    type: Date, 
    required: true 
  }, 
  subtasks: [subtaskSchema], 
  tags: [String], 
  estimatedTime: Number, 
  actualTime: Number, 
  status: { 
    type: String, 
    enum: ['Not Started', 'In Progress', 'Completed'], 
    default: 'Not Started' 
  }, 
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Medium' 
  } 
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
    ref: 'User' 
  } 
}, { 
  timestamps: true 
});

// Make sure this export is correct
const Plan = mongoose.model("Plan", planSchema);
export default Plan;