import React from 'react';
import { Activity, CheckCircle2, Clock, Calendar } from 'lucide-react';

export default function ActivityNotes({ 
  activities = [], 
  totalActivities = 0,
  containerWidth = 0,
  containerHeight = 0,
  isCompact = false 
}) {
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return time.toLocaleDateString();
  };

  const formatTimeSpent = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? ` in ${hours}h ${mins}m` : ` in ${mins}m`;
  };

  if (isCompact || containerWidth < 400) {
    return (
      // --- FIX --- Removed wrapper, added flex layout
      <div className="h-full flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* --- THEME --- */}
            <Activity size={16} className="text-[var(--accent-color)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">Activity</span>
          </div>
          {/* --- THEME --- */}
          <span className="text-lg font-bold text-[var(--accent-color)]">{totalActivities}</span>
        </div>
        
        {/* --- RESPONSIVE --- List now scrolls */}
        <div className="space-y-2 flex-1 overflow-y-auto">
          {activities.slice(0, 3).map((activity, index) => (
            // --- THEME ---
            <div key={index} className="flex items-center gap-2 p-2 bg-[var(--accent-color)]/10 rounded-lg">
              <CheckCircle2 size={14} className="text-[var(--accent-color)]" />
              <div className="flex-1 min-w-0">
                {/* --- THEME --- */}
                <div className="text-sm truncate text-[var(--text-primary)]">Completed {activity.task}</div>
                <div className="text-xs text-[var(--accent-color)]/80 truncate">{formatTimeAgo(activity.timestamp)}</div>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
             <div className="text-center py-4 text-[var(--text-secondary)]">
              <Calendar size={24} className="mx-auto mb-2 opacity-50" />
              <div className="text-sm">No recent activity</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    // --- FIX --- Removed wrapper, added flex layout
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* --- THEME --- */}
          <Activity size={18} className="text-[var(--accent-color)]" />
          <h3 className="font-medium text-[var(--text-primary)]">Recent Activity</h3>
        </div>
        {/* --- THEME --- */}
        <span className="text-sm text-[var(--text-secondary)]">{totalActivities} activities</span>
      </div>

      {/* --- RESPONSIVE --- List now scrolls and fills space */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div key={index} className="flex gap-3 p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
              <div className="flex-shrink-0">
                {/* --- THEME --- */}
                <div className="w-8 h-8 bg-[var(--accent-color)]/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-[var(--accent-color)]" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                {/* --- THEME --- */}
                <div className="font-medium text-sm text-[var(--text-primary)]">
                  Completed <span className="text-[var(--accent-color)]">"{activity.task}"</span>
                  {formatTimeSpent(activity.timeSpent)}
                </div>
                {activity.plan && (
                  // --- THEME ---
                  <div className="text-xs text-[var(--text-secondary)] mt-1">
                    in {activity.plan}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {/* --- THEME --- */}
                  <Clock size={12} className="text-[var(--text-secondary)]" />
                  <span className="text-xs text-[var(--text-secondary)]">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          // --- THEME ---
          <div className="text-center py-8 text-[var(--text-secondary)]">
            <Calendar size={32} className="mx-auto mb-2 opacity-50" />
            <div className="text-sm">No recent activity</div>
            <div className="text-xs mt-1">Complete some tasks to see activity here</div>
          </div>
        )}
      </div>

      {/* Quick Stats (Footer) */}
      {activities.length > 0 && (
        // --- THEME ---
        <div className="pt-3 border-t border-[var(--border-color)]">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              {/* --- THEME --- */}
              <div className="text-sm font-bold text-[var(--accent-color)]">
                {activities.filter(a => a.type === 'completed').length}
              </div>
              {/* --- THEME --- */}
              <div className="text-xs text-[var(--text-secondary)]">Completed</div>
            </div>
            <div>
              <div className="text-sm font-bold text-blue-600">
                {Math.round(activities.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / 60)}h
              </div>
              {/* --- THEME --- */}
              <div className="text-xs text-[var(--text-secondary)]">Time Tracked</div>
            </div>
            <div>
              <div className="text-sm font-bold text-green-600">
                {new Set(activities.map(a => a.plan)).size}
              </div>
              {/* --- THEME --- */}
              <div className="text-xs text-[var(--text-secondary)]">Projects</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}