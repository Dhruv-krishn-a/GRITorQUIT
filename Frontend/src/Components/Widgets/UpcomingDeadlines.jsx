import React, { useMemo, useState } from "react";
import { AlertTriangle, Calendar, Clock, Flag, MoreVertical, CheckCircle2 } from "lucide-react";

export default function UpcomingDeadlines({
  containerWidth = 0,
  containerHeight = 0,
  isCompact = false,
  deadlines = [],
  onDeadlineComplete = () => {},
  onDeadlineClick = () => {}
}) {
  const [hoveredDeadline, setHoveredDeadline] = useState(null);
  const [view, setView] = useState('upcoming'); // 'upcoming' or 'all'

  const size = useMemo(() => {
    if (isCompact || (containerWidth > 0 && containerWidth < 360)) return "compact";
    if (containerWidth > 0 && containerWidth < 680) return "medium";
    return "large";
  }, [containerWidth, isCompact]);

  const filteredDeadlines = useMemo(() => {
    if (view === 'upcoming') {
      return deadlines.filter(d => !d.completed);
    }
    return deadlines;
  }, [deadlines, view]);

  const getDaysUntil = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    return `${diffDays} days`;
  };

  const getUrgencyColor = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'red';
    if (diffDays <= 1) return 'orange';
    if (diffDays <= 3) return 'yellow';
    return 'green';
  };

  const handleComplete = (deadlineId, e) => {
    e.stopPropagation();
    onDeadlineComplete(deadlineId);
  };

  if (size === "compact") {
    const next = filteredDeadlines[0];
    if (!next) return null;
    
    return (
      <div 
        className="bg-white dark:bg-[#141414] p-3 rounded-xl shadow-md flex items-center gap-3 cursor-pointer hover:shadow-lg transition-all"
        onClick={() => onDeadlineClick(next)}
      >
        <div className={`p-2 rounded-lg bg-${getUrgencyColor(next.date)}-100 dark:bg-${getUrgencyColor(next.date)}-900/30`}>
          <AlertTriangle size={14} className={`text-${getUrgencyColor(next.date)}-500`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
            {next.text}
          </div>
          <div className="text-xs text-neutral-400 flex items-center gap-1">
            <Clock size={10} />
            {getDaysUntil(next.date)}
          </div>
        </div>
      </div>
    );
  }

  if (size === "medium") {
    return (
      <div className="bg-white dark:bg-[#141414] p-4 rounded-xl shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <AlertTriangle size={16} className="text-yellow-500" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Upcoming Deadlines
            </h3>
          </div>
          <div className="text-xs text-neutral-400">
            {filteredDeadlines.filter(d => !d.completed).length} pending
          </div>
        </div>

        <div className="space-y-3 max-h-48 overflow-auto pr-2">
          {filteredDeadlines.slice(0, 4).map((d) => (
            <div 
              key={d.id}
              className="relative flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer group"
              onMouseEnter={() => setHoveredDeadline(d)}
              onMouseLeave={() => setHoveredDeadline(null)}
              onClick={() => onDeadlineClick(d)}
            >
              <button 
                onClick={(e) => handleComplete(d.id, e)}
                className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border transition-all ${
                  d.completed 
                    ? 'bg-green-500 border-green-500' 
                    : 'border-gray-300 hover:border-green-500'
                }`}
              >
                {d.completed && <CheckCircle2 size={12} className="text-white" />}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium truncate ${
                  d.completed ? 'text-gray-400 line-through' : 'text-neutral-900 dark:text-neutral-100'
                }`}>
                  {d.text}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 text-xs text-neutral-400">
                    <Calendar size={10} />
                    {new Date(d.date).toLocaleDateString()}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full bg-${getUrgencyColor(d.date)}-100 text-${getUrgencyColor(d.date)}-600`}>
                    {getDaysUntil(d.date)}
                  </span>
                </div>
              </div>

              {/* Hover actions */}
              {hoveredDeadline?.id === d.id && (
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <MoreVertical size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredDeadlines.length === 0 && (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <Flag size={24} className="mx-auto mb-2 opacity-50" />
            <div className="text-sm">No deadlines</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#141414] p-5 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
            <AlertTriangle size={18} className="text-yellow-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Upcoming Deadlines
            </h3>
            <p className="text-xs text-neutral-400">Track important due dates</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select 
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
          >
            <option value="upcoming">Upcoming</option>
            <option value="all">All</option>
          </select>
          <div className="text-xs text-neutral-400">
            {filteredDeadlines.filter(d => !d.completed).length} pending
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredDeadlines.map((d) => (
          <div 
            key={d.id}
            className="relative flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer group"
            onMouseEnter={() => setHoveredDeadline(d)}
            onMouseLeave={() => setHoveredDeadline(null)}
            onClick={() => onDeadlineClick(d)}
          >
            <div className="flex items-start gap-3 flex-1">
              <button 
                onClick={(e) => handleComplete(d.id, e)}
                className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border transition-all flex items-center justify-center ${
                  d.completed 
                    ? 'bg-green-500 border-green-500' 
                    : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
                }`}
              >
                {d.completed && <CheckCircle2 size={14} className="text-white" />}
              </button>
              
              <div className="flex-1">
                <div className={`font-medium text-sm mb-1 ${
                  d.completed ? 'text-gray-400 line-through' : 'text-neutral-900 dark:text-neutral-100'
                }`}>
                  {d.text}
                </div>
                
                <div className="flex items-center gap-4 text-xs text-neutral-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(d.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full bg-${getUrgencyColor(d.date)}-100 text-${getUrgencyColor(d.date)}-600 font-medium`}>
                    <Clock size={10} />
                    {getDaysUntil(d.date)}
                  </div>

                  {d.project && (
                    <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      {d.project}
                    </div>
                  )}
                </div>

                {d.description && (
                  <div className="text-xs text-neutral-500 mt-2 line-clamp-2">
                    {d.description}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <MoreVertical size={14} />
              </button>
            </div>

            {/* Enhanced hover card */}
            {hoveredDeadline?.id === d.id && (
              <div className="absolute z-10 left-0 top-full mt-2 w-80 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="font-medium text-sm mb-2">{d.text}</div>
                {d.description && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    {d.description}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                  <div>
                    <div className="text-gray-500">Due Date</div>
                    <div className="font-medium">
                      {new Date(d.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Status</div>
                    <div className={`font-medium ${
                      getUrgencyColor(d.date) === 'red' ? 'text-red-600' :
                      getUrgencyColor(d.date) === 'orange' ? 'text-orange-600' :
                      getUrgencyColor(d.date) === 'yellow' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {getDaysUntil(d.date)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 px-3 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors">
                    Start Working
                  </button>
                  <button className="flex-1 py-2 px-3 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors">
                    {d.completed ? 'Reopen' : 'Mark Done'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredDeadlines.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Flag size={32} className="mx-auto mb-2 opacity-50" />
          <div className="text-sm">No deadlines found</div>
          <div className="text-xs mt-1">
            {view === 'upcoming' ? 'All caught up!' : 'No deadlines created yet'}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {deadlines.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="font-bold text-blue-600">{deadlines.length}</div>
              <div className="text-gray-500">Total</div>
            </div>
            <div>
              <div className="font-bold text-green-600">
                {deadlines.filter(d => d.completed).length}
              </div>
              <div className="text-gray-500">Completed</div>
            </div>
            <div>
              <div className="font-bold text-red-600">
                {deadlines.filter(d => new Date(d.date) < new Date() && !d.completed).length}
              </div>
              <div className="text-gray-500">Overdue</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}