import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, BarChart3, Calendar, Users, Flag, MoreVertical, CheckCircle2 } from 'lucide-react';

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
    // Ensure progress is a number
    const getProgress = (plan) => plan.progress || 0;
    
    setActivePlans(plans.filter(plan => {
      const progress = getProgress(plan);
      return new Date(plan.endDate) > now && progress < 100;
    }));
    setCompletedPlans(plans.filter(plan => {
      const progress = getProgress(plan);
      return progress >= 100 || new Date(plan.endDate) <= now;
    }));
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
    return 'purple'; // 'purple' will be our accent color
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  // --- THEME --- Helper for theme-agnostic priority badges
  const getPriorityClasses = (priority) => {
    const color = getPriorityColor(priority);
    return `bg-${color}-500/10 text-${color}-600`;
  };

  if (isCompact || containerWidth < 400) {
    return (
      // --- FIX --- REMOVED the wrapper div, added h-full flex flex-col
      <div className="space-y-3 h-full flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-green-500" />
            {/* --- THEME --- */}
            <span className="text-sm font-medium text-[var(--text-primary)]">Projects</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-green-500">{completedPlans.length}</span>
            {/* --- THEME --- */}
            <span className="text-[var(--text-secondary)]">/</span>
            <span className="text-[var(--text-secondary)]">{plans.length}</span>
          </div>
        </div>
        
        {/* --- RESPONSIVE --- List scrolls if too tall */}
        <div className="space-y-2 flex-1 overflow-y-auto">
          {activePlans.slice(0, 3).map((plan, index) => { // Show 3 items in compact
            const daysRemaining = getDaysRemaining(plan.endDate);
            const statusColor = getStatusColor(plan.progress, plan.endDate);
            const colorClass = statusColor === 'purple' ? 'text-[var(--accent-color)]' : `text-${statusColor}-600`;
            const bgClass = statusColor === 'purple' ? 'bg-[var(--accent-color)]' : `bg-${statusColor}-500`;
            
            return (
              <div 
                key={index}
                // --- THEME --- REMOVED bg-white/dark:bg-gray-800
                className="p-2 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] hover:shadow-md transition-all cursor-pointer"
                onClick={() => onProjectClick(plan)}
              >
                <div className="flex justify-between items-center mb-1">
                  {/* --- THEME --- */}
                  <span className="text-sm font-medium truncate text-[var(--text-primary)]">{plan.title}</span>
                  <span className={`text-xs ${colorClass}`}>{plan.progress || 0}%</span>
                </div>
                {/* --- THEME --- */}
                <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-2">
                  <span>{plan.completedTasks || 0}/{plan.totalTasks || 0} tasks</span>
                  <span>{daysRemaining}d left</span>
                </div>
                {/* --- THEME --- */}
                <div className="w-full bg-[var(--hover-bg)] rounded-full h-1.5">
                  <div 
                    className={`${bgClass} h-1.5 rounded-full transition-all duration-500`}
                    style={{ width: `${plan.progress || 0}%` }}
                  />
                </div>
              </div>
            );
          })}
           {activePlans.length === 0 && (
            <div className="text-center py-4 text-[var(--text-secondary)]">
              <CheckCircle2 size={24} className="mx-auto mb-2 opacity-50" />
              <div className="text-sm">No active projects</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    // --- RESPONSIVE --- REMOVED wrapper div, Changed to flex-col layout
    <div className="h-full flex flex-col space-y-4">
      {/* Overall Progress */}
      <div className="grid grid-cols-3 gap-4 text-center">
        {/* --- THEME --- */}
        <div className="p-4 bg-blue-500/10 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{plans.length}</div>
          <div className="text-xs text-blue-600">Total Projects</div>
        </div>
        {/* --- THEME --- */}
        <div className="p-4 bg-green-500/10 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{completionStats.percentage}%</div>
          <div className="text-xs text-green-600">Overall Progress</div>
        </div>
        {/* --- THEME --- */}
        <div className="p-4 bg-[var(--accent-color)]/10 rounded-lg">
          <div className="text-2xl font-bold text-[var(--accent-color)]">{activePlans.length}</div>
          <div className="text-xs text-[var(--accent-color)]">Active</div>
        </div>
      </div>

      {/* View Toggle */}
      {/* --- THEME --- */}
      <div className="flex gap-2 bg-[var(--hover-bg)] rounded-lg p-1">
        <button
          onClick={() => setView('active')}
          className={`flex-1 py-2 px-3 text-sm rounded-md transition-all ${
            view === 'active' 
              ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' 
              : 'text-[var(--text-secondary)]'
          }`}
        >
          Active ({activePlans.length})
        </button>
        <button
          onClick={() => setView('completed')}
          className={`flex-1 py-2 px-3 text-sm rounded-md transition-all ${
            view === 'completed' 
              ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' 
              : 'text-[var(--text-secondary)]'
          }`}
        >
          Completed ({completedPlans.length})
        </button>
      </div>

      {/* --- RESPONSIVE --- This section will flex and scroll */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-3">
          {/* --- THEME --- */}
          <TrendingUp size={16} className="text-[var(--accent-color)]" />
          <h4 className="font-medium text-[var(--text-primary)]">
            {view === 'active' ? 'Active Projects' : 'Completed Projects'} 
            ({view === 'active' ? activePlans.length : completedPlans.length})
          </h4>
        </div>
        
        {/* --- RESPONSIVE --- This list now scrolls */}
        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          {(view === 'active' ? activePlans : completedPlans).map((plan, index) => {
            const daysRemaining = getDaysRemaining(plan.endDate);
            const isOverdue = daysRemaining < 0 && (plan.progress || 0) < 100;
            const progress = plan.progress || 0;
            
            return (
              <div 
                key={index}
                // --- THEME --- REMOVED bg-white/dark:bg-gray-800
                className="relative p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] hover:shadow-lg transition-all cursor-pointer group"
                onMouseEnter={() => setSelectedProject(plan)}
                onMouseLeave={() => setSelectedProject(null)}
                onClick={() => onProjectClick(plan)}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {/* --- THEME --- */}
                      <div className="font-medium text-sm truncate text-[var(--text-primary)]">{plan.title}</div>
                      {plan.priority && (
                        // --- THEME ---
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityClasses(plan.priority)}`}>
                          {plan.priority}
                        </span>
                      )}
                    </div>
                    {plan.description && (
                      // --- THEME ---
                      <div className="text-xs text-[var(--text-secondary)] line-clamp-2">
                        {plan.description}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right flex-shrink-0 ml-2">
                    {/* --- THEME --- */}
                    <div className="text-lg font-bold text-[var(--accent-color)]">{progress}%</div>
                    {/* --- THEME --- */}
                    <div className={`text-xs ${
                      isOverdue ? 'text-red-500' : 'text-[var(--text-secondary)]'
                    }`}>
                      {progress >= 100 ? 'Completed' : isOverdue ? `${Math.abs(daysRemaining)}d overdue` : `${daysRemaining}d left`}
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                {/* --- THEME --- */}
                <div className="w-full bg-[var(--hover-bg)] rounded-full h-2 mb-3">
                  <div 
                    className={`bg-gradient-to-r from-[var(--accent-color)] to-[color-mix(in_srgb,var(--accent-color)_80%_black)] h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                {/* Stats */}
                {/* --- THEME --- */}
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Target size={12} />
                      <span>{plan.completedTasks || 0}/{plan.totalTasks || 0} tasks</span>
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
                    {/* --- THEME --- */}
                    <button className="p-1 hover:bg-[var(--hover-bg)] text-[var(--text-secondary)] rounded">
                      <MoreVertical size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          
          {(view === 'active' ? activePlans : completedPlans).length === 0 && (
            // --- THEME ---
            <div className="text-center py-8 text-[var(--text-secondary)]">
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

      {/* --- RESPONSIVE --- Footer (does not scroll) */}
      {plans.length > 0 && (
        // --- THEME ---
        <div className="pt-3 border-t border-[var(--border-color)]">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div>
              <div className="font-bold text-blue-600">{plans.length}</div>
              {/* --- THEME --- */}
              <div className="text-[var(--text-secondary)]">Total</div>
            </div>
            <div>
              <div className="font-bold text-green-600">{completedPlans.length}</div>
              {/* --- THEME --- */}
              <div className="text-[var(--text-secondary)]">Done</div>
            </div>
            <div>
              {/* --- THEME --- */}
              <div className="font-bold text-[var(--accent-color)]">{activePlans.length}</div>
              {/* --- THEME --- */}
              <div className="text-[var(--text-secondary)]">Active</div>
            </div>
            <div>
              <div className="font-bold text-red-600">
                {activePlans.filter(p => getDaysRemaining(p.endDate) < 0).length}
              </div>
              {/* --- THEME --- */}
              <div className="text-[var(--text-secondary)]">Overdue</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}