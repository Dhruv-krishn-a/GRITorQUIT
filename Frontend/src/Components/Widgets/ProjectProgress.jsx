import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, BarChart3, Calendar, Users, Flag, MoreVertical } from 'lucide-react';

export default function ProjectProgress({ 
  plans = [], 
  completionStats = { completed: 0, total: 0, percentage: 0 },
  containerWidth = 0,
  containerHeight = 0,
  isCompact = false,
  onProjectClick = () => {}
}) {
  const [activePlans, setActivePlans] = useState([]);
  const [completedPlans, setCompletedPlans] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [view, setView] = useState('active'); // 'active' or 'completed'

  useEffect(() => {
    const now = new Date();
    setActivePlans(plans.filter(plan => new Date(plan.endDate) > now && plan.progress < 100));
    setCompletedPlans(plans.filter(plan => plan.progress >= 100 || new Date(plan.endDate) <= now));
  }, [plans]);

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (progress, endDate) => {
    const daysRemaining = getDaysRemaining(endDate);
    
    if (progress >= 100) return 'green';
    if (daysRemaining < 0) return 'red';
    if (daysRemaining <= 3) return 'orange';
    if (progress >= 80) return 'blue';
    return 'purple';
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  if (isCompact || containerWidth < 400) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-green-500" />
            <span className="text-sm font-medium">Projects</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-green-500">{completedPlans.length}</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">{plans.length}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          {activePlans.slice(0, 2).map((plan, index) => {
            const daysRemaining = getDaysRemaining(plan.endDate);
            const statusColor = getStatusColor(plan.progress, plan.endDate);
            
            return (
              <div 
                key={index}
                className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer"
                onClick={() => onProjectClick(plan)}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium truncate">{plan.title}</span>
                  <span className={`text-xs text-${statusColor}-600`}>{plan.progress}%</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>{plan.completedTasks}/{plan.totalTasks} tasks</span>
                  <span>{daysRemaining}d left</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div 
                    className={`bg-${statusColor}-500 h-1.5 rounded-full transition-all duration-500`}
                    style={{ width: `${plan.progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{plans.length}</div>
          <div className="text-xs text-blue-600">Total Projects</div>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{completionStats.percentage}%</div>
          <div className="text-xs text-green-600">Overall Progress</div>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{activePlans.length}</div>
          <div className="text-xs text-purple-600">Active</div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setView('active')}
          className={`flex-1 py-2 px-3 text-sm rounded-md transition-all ${
            view === 'active' 
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Active ({activePlans.length})
        </button>
        <button
          onClick={() => setView('completed')}
          className={`flex-1 py-2 px-3 text-sm rounded-md transition-all ${
            view === 'completed' 
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Completed ({completedPlans.length})
        </button>
      </div>

      {/* Projects List */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-purple-500" />
          <h4 className="font-medium">
            {view === 'active' ? 'Active Projects' : 'Completed Projects'} 
            ({view === 'active' ? activePlans.length : completedPlans.length})
          </h4>
        </div>
        
        <div className="space-y-3">
          {(view === 'active' ? activePlans : completedPlans).slice(0, 4).map((plan, index) => {
            const daysRemaining = getDaysRemaining(plan.endDate);
            const statusColor = getStatusColor(plan.progress, plan.endDate);
            const isOverdue = daysRemaining < 0;
            
            return (
              <div 
                key={index}
                className="relative p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer group"
                onMouseEnter={() => setSelectedProject(plan)}
                onMouseLeave={() => setSelectedProject(null)}
                onClick={() => onProjectClick(plan)}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium text-sm truncate">{plan.title}</div>
                      {plan.priority && (
                        <span className={`px-2 py-0.5 text-xs rounded-full bg-${getPriorityColor(plan.priority)}-100 text-${getPriorityColor(plan.priority)}-600`}>
                          {plan.priority}
                        </span>
                      )}
                    </div>
                    {plan.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {plan.description}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="text-lg font-bold text-purple-600">{plan.progress}%</div>
                    <div className={`text-xs ${
                      isOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {isOverdue ? `${Math.abs(daysRemaining)}d overdue` : `${daysRemaining}d left`}
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                  <div 
                    className={`bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${plan.progress}%` }}
                  />
                </div>
                
                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Target size={12} />
                      <span>{plan.completedTasks}/{plan.totalTasks} tasks</span>
                    </div>
                    
                    {plan.teamSize && (
                      <div className="flex items-center gap-1">
                        <Users size={12} />
                        <span>{plan.teamSize} people</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>
                      {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Hover Actions */}
                {selectedProject?.id === plan.id && (
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <MoreVertical size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          
          {(view === 'active' ? activePlans : completedPlans).length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <BarChart3 size={32} className="mx-auto mb-2 opacity-50" />
              <div className="text-sm">
                {view === 'active' ? 'No active projects' : 'No completed projects'}
              </div>
              <div className="text-xs mt-1">
                {view === 'active' ? 'Create a new project to get started' : 'Complete some projects to see them here'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {plans.length > 0 && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div>
              <div className="font-bold text-blue-600">{plans.length}</div>
              <div className="text-gray-500">Total</div>
            </div>
            <div>
              <div className="font-bold text-green-600">{completedPlans.length}</div>
              <div className="text-gray-500">Done</div>
            </div>
            <div>
              <div className="font-bold text-purple-600">{activePlans.length}</div>
              <div className="text-gray-500">Active</div>
            </div>
            <div>
              <div className="font-bold text-red-600">
                {activePlans.filter(p => getDaysRemaining(p.endDate) < 0).length}
              </div>
              <div className="text-gray-500">Overdue</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}