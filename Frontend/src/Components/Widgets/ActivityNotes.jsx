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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-orange-500" />
            <span className="text-sm font-medium">Activity</span>
          </div>
          <span className="text-lg font-bold text-orange-500">{totalActivities}</span>
        </div>
        
        <div className="space-y-2">
          {activities.slice(0, 3).map((activity, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <CheckCircle2 size={14} className="text-orange-500" />
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">Completed {activity.task}</div>
                <div className="text-xs text-orange-600 truncate">{formatTimeAgo(activity.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-orange-500" />
          <h3 className="font-medium">Recent Activity</h3>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">{totalActivities} activities</span>
      </div>

      {/* Activity List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div key={index} className="flex gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-orange-500" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">
                  Completed <span className="text-orange-600">"{activity.task}"</span>
                  {formatTimeSpent(activity.timeSpent)}
                </div>
                {activity.plan && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    in {activity.plan}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Clock size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Calendar size={32} className="mx-auto mb-2 opacity-50" />
            <div className="text-sm">No recent activity</div>
            <div className="text-xs mt-1">Complete some tasks to see activity here</div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {activities.length > 0 && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-sm font-bold text-orange-600">
                {activities.filter(a => a.type === 'completed').length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
            </div>
            <div>
              <div className="text-sm font-bold text-blue-600">
                {Math.round(activities.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / 60)}h
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Time Tracked</div>
            </div>
            <div>
              <div className="text-sm font-bold text-green-600">
                {new Set(activities.map(a => a.plan)).size}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Projects</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}