import React from 'react';
import ProgressBar from '../ui/ProgressBar';

const ProgressOverview = ({ plan }) => {
  const getDaysRemaining = () => {
    const today = new Date();
    const end = new Date(plan.endDate);
    const diff = end.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getMotivationalMessage = () => {
    if (plan.progress >= 90) return "Almost there! You're crushing it! 💪";
    if (plan.progress >= 70) return "Great progress! Keep up the momentum! 🔥";
    if (plan.progress >= 50) return "You're halfway there! Stay focused! ✨";
    if (plan.progress >= 30) return "Good start! Consistency is key! 🌟";
    return "Every great journey begins with a single step! 🚀";
  };

  const calculateDailyHours = () => {
    const daysRemaining = getDaysRemaining();
    const tasksRemaining = plan.totalTasks - plan.completedTasks;
    const estimatedHours = (tasksRemaining * 0.5) / 4;
    return Math.max(0.5, Math.min(8, estimatedHours));
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h2 className="text-2xl font-bold text-white mb-2">{plan.title}</h2>
      <p className="text-gray-400 mb-6">{plan.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-1">{plan.progress}%</div>
          <div className="text-gray-400 text-sm">Progress</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-1">
            {plan.completedTasks}/{plan.totalTasks}
          </div>
          <div className="text-gray-400 text-sm">Tasks Completed</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-1">{getDaysRemaining()}</div>
          <div className="text-gray-400 text-sm">Days Remaining</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-1">{calculateDailyHours().toFixed(1)}h</div>
          <div className="text-gray-400 text-sm">Daily Target</div>
        </div>
      </div>

      <ProgressBar progress={plan.progress} className="mb-4" />
      
      <div className="text-center">
        <p className="text-red-400 font-medium">{getMotivationalMessage()}</p>
        <p className="text-gray-500 text-sm mt-2">
          {calculateDailyHours().toFixed(1)} hours per day • 4 hours focused work
        </p>
      </div>
    </div>
  );
};

export default ProgressOverview;