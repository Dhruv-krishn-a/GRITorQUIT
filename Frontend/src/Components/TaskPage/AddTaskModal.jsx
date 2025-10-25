import React from 'react';
import { X, Calendar, Flag, Tag, Plus } from 'lucide-react';

// Reusable Input Field
const FormInput = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
      {label}
    </label>
    <input
      id={id}
      {...props}
      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);

// Reusable Select Field
const FormSelect = ({ label, id, children, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
      {label}
    </label>
    <select
      id={id}
      {...props}
      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      {children}
    </select>
  </div>
);

export default function AddTaskModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    // Backdrop
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div
        className="bg-gray-900 rounded-lg shadow-xl w-full max-w-lg m-4 border border-gray-700"
        onClick={(e) => e.stopPropagation()} // Prevent closing on modal click
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-white">Add New Task</h2>
            <p className="text-sm text-gray-400">
              Fill in the details below to add a new task to your list.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-700 rounded-full p-1 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form className="p-6 space-y-4">
          <FormInput
            label="Title"
            id="title"
            type="text"
            placeholder="e.g. Finish project proposal"
          />

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows="3"
              placeholder="Add more details about your task..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          <div>
            <label htmlFor="subtasks" className="block text-sm font-medium text-gray-300 mb-1">
              Subtasks
            </label>
            <div className="flex space-x-2">
              <input
                id="subtasks"
                type="text"
                placeholder="Add a new subtask"
                className="flex-1 w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                className="px-3 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Due Date"
              id="due-date"
              type="text" // Using text input for simplicity, use a date picker component in a real app
              placeholder="Pick a date"
            />
            <FormSelect label="Priority" id="priority">
              <option className="bg-gray-800">Select priority</option>
              <option value="high" className="bg-gray-800">High</option>
              <option value="medium" className="bg-gray-800">Medium</option>
              <option value="low" className="bg-gray-800">Low</option>
            </FormSelect>
          </div>

          <FormInput
            label="Tags"
            id="tags"
            type="text"
            placeholder="e.g. #work, #project-phoenix"
          />

          {/* Footer Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}