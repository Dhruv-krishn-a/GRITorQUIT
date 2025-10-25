import React from 'react';
import ProgressBar from '../ui/ProgressBar';
import Button from '../ui/Button';

const PlanCard = ({ plan, onView }) => {
  const getDaysRemaining = () => {
    const today = new Date();
    const end = new Date(plan.endDate);
    const diff = end.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getDuration = () => {
    const start = new Date(plan.startDate);
    const end = new Date(plan.endDate);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-all duration-200 hover:transform hover:scale-[1.02]">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-white">{plan.title}</h3>
        <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">
          {getDuration()} Days
        </span>
      </div>
      
      {plan.description && (
        <p className="text-gray-400 mb-4 text-sm">{plan.description}</p>
      )}
      
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Progress</span>
          <span className="text-white font-medium">{plan.progress}%</span>
        </div>
        <ProgressBar progress={plan.progress} />
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Tasks</div>
            <div className="text-white font-medium">
              {plan.completedTasks}/{plan.totalTasks}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Days Left</div>
            <div className="text-white font-medium">{getDaysRemaining()}</div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-gray-500 text-sm">
          {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
        </span>
        <Button onClick={() => onView(plan)} variant="primary" size="sm">
          View Plan
        </Button>
      </div>
    </div>
  );
};

export default PlanCard;