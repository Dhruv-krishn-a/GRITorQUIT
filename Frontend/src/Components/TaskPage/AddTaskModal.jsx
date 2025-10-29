import React, { useState, useEffect } from 'react';
import { X, Calendar, Flag, Tag, Plus, Trash2, Clock } from 'lucide-react';
import { plansAPI } from '../services/api';

const FormInput = ({ label, id, icon: Icon, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      )}
      <input
        id={id}
        {...props}
        className={`w-full py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
          Icon ? 'pl-11 pr-4' : 'px-4'
        }`}
      />
    </div>
  </div>
);

const FormSelect = ({ label, id, icon: Icon, children, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      )}
      <select
        id={id}
        {...props}
        className={`w-full py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none ${
          Icon ? 'pl-11 pr-10' : 'px-4'
        }`}
      >
        {children}
      </select>
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);

export default function AddTaskModal({ isOpen, onClose, onTaskAdded, editingTask }) {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    'due-date': '',
    priority: 'Medium',
    tags: ''
  });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plansData = await plansAPI.getAll();
        setPlans(plansData);
      } catch (error) {
        console.error('Error fetching plans:', error);
      }
    };

    if (isOpen) {
      fetchPlans();
      if (editingTask) {
        // Pre-fill form for editing
        setFormData({
          title: editingTask.title || '',
          description: editingTask.description || '',
          'due-date': editingTask.date ? new Date(editingTask.date).toISOString().split('T')[0] : '',
          priority: editingTask.priority || 'Medium',
          tags: editingTask.tags?.join(', ') || ''
        });
        setSubtasks(editingTask.subtasks || []);
        setSelectedPlan(editingTask.planId || '');
      } else {
        // Reset form for new task
        setFormData({
          title: '',
          description: '',
          'due-date': '',
          priority: 'Medium',
          tags: ''
        });
        setSubtasks([]);
        setSelectedPlan('');
      }
    }
  }, [isOpen, editingTask]);

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, { title: newSubtask.trim(), completed: false }]);
      setNewSubtask('');
    }
  };

  const removeSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setLoading(true);
    
    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      date: formData['due-date'] ? new Date(formData['due-date']) : new Date(),
      priority: formData.priority,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      subtasks: subtasks,
      status: 'Not Started',
      completed: false
    };

    try {
      if (editingTask) {
        // Update existing task
        await plansAPI.updateTask(editingTask.planId, editingTask._id || editingTask.id, taskData);
      } else if (selectedPlan) {
        // Add to existing plan
        const plan = await plansAPI.getById(selectedPlan);
        const updatedTasks = [...(plan.tasks || []), taskData];
        await plansAPI.update(selectedPlan, { tasks: updatedTasks });
      } else {
        // Create new plan for the task
        const newPlan = await plansAPI.create({
          title: 'My Tasks',
          description: 'Personal tasks',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          tasks: [taskData]
        });
      }

      onTaskAdded();
      handleClose();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubtasks([]);
    setNewSubtask('');
    setSelectedPlan('');
    setFormData({
      title: '',
      description: '',
      'due-date': '',
      priority: 'Medium',
      tags: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800 sticky top-0 bg-gray-900 rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-gray-400 mt-1">
              {editingTask ? 'Update your task details' : 'Add a new task to your list'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl p-2 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Task Title */}
          <FormInput
            label="Task Title"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            type="text"
            placeholder="What needs to be done?"
            required
          />

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows="3"
              placeholder="Add more details about your task..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Plan Selection (Optional) */}
          <FormSelect 
            label="Add to Plan (Optional)" 
            id="plan"
            icon={Tag}
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
          >
            <option value="">No Plan - Add to My Tasks</option>
            {plans.map(plan => (
              <option key={plan._id} value={plan._id}>
                {plan.title}
              </option>
            ))}
          </FormSelect>

          {/* Due Date & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Due Date"
              id="due-date"
              icon={Calendar}
              value={formData['due-date']}
              onChange={(e) => handleInputChange('due-date', e.target.value)}
              type="date"
            />
            
            <FormSelect 
              label="Priority" 
              id="priority"
              icon={Flag}
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </FormSelect>
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Subtasks
            </label>
            <div className="space-y-3">
              {subtasks.map((subtask, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700 group">
                  <div className="w-4 h-4 rounded border-2 border-gray-500 flex-shrink-0"></div>
                  <div className="flex-1 text-gray-200">{subtask.title}</div>
                  <button
                    type="button"
                    onClick={() => removeSubtask(index)}
                    className="text-gray-400 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                  placeholder="Add a new subtask"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={addSubtask}
                  className="px-4 py-3 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-all flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <FormInput
            label="Tags"
            id="tags"
            icon={Tag}
            value={formData.tags}
            onChange={(e) => handleInputChange('tags', e.target.value)}
            type="text"
            placeholder="work, urgent, project (comma separated)"
          />

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-800">
            {editingTask && (
              <button
                type="button"
                className="px-6 py-3 rounded-xl text-sm font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 transition-all"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this task?')) {
                    // Handle delete
                    handleClose();
                  }
                }}
              >
                Delete Task
              </button>
            )}
            
            <div className="flex space-x-4 ml-auto">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 rounded-xl text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition-all"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/25"
                disabled={loading || !formData.title.trim()}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {editingTask ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingTask ? 'Update Task' : 'Create Task'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}