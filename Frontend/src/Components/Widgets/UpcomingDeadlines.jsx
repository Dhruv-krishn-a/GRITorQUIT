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
    today.setHours(0, 0, 0, 0); // Normalize today's date
    date.setHours(0, 0, 0, 0); // Normalize deadline date
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
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'red';
    if (diffDays <= 1) return 'orange'; // Today or Tomorrow
    if (diffDays <= 3) return 'yellow'; // In 2-3 days
    return 'green'; // 4+ days
  };
  
  // --- THEME --- Helper for theme-agnostic semantic badges
  const getUrgencyClasses = (dateString) => {
    const color = getUrgencyColor(dateString);
    // Use 10% opacity for background, works on all themes
    return `bg-${color}-500/10 text-${color}-600`;
  };

  const handleComplete = (deadlineId, e) => {
    e.stopPropagation();
    onDeadlineComplete(deadlineId);
  };

  if (size === "compact") {
    const next = filteredDeadlines[0];
    if (!next) return (
      // --- THEME & RESPONSIVE --- Added themed empty state
      <div className="flex items-center gap-3 h-full text-[var(--text-secondary)]">
        <CheckCircle2 size={16} />
        <span className="text-sm">No upcoming deadlines</span>
      </div>
    );
    
    return (
      // --- THEME & RESPONSIVE --- 
      // REMOVED the wrapper div with "bg-white dark:bg-[#141414]"
      <div 
        className="flex items-center gap-3 cursor-pointer group h-full"
        onClick={() => onDeadlineClick(next)}
      >
        {/* --- THEME --- */}
        <div className={`p-2 rounded-lg ${getUrgencyClasses(next.date)} bg-opacity-20`}>
          <AlertTriangle size={14} className={`text-${getUrgencyColor(next.date)}-500`} />
        </div>
        <div className="flex-1 min-w-0">
          {/* --- THEME --- */}
          <div className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--accent-color)]">
            {next.text}
          </div>
          {/* --- THEME --- */}
          <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
            <Clock size={10} />
            {getDaysUntil(next.date)}
          </div>
        </div>
      </div>
    );
  }

  if (size === "medium") {
    return (
      // --- THEME & RESPONSIVE --- 
      // REMOVED the wrapper div with "bg-white dark:bg-[#141414]"
      // Added h-full flex flex-col for proper scrolling
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <AlertTriangle size={16} className="text-yellow-500" />
            {/* --- THEME --- */}
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Upcoming Deadlines
            </h3>
          </div>
          {/* --- THEME --- */}
          <div className="text-xs text-[var(--text-secondary)]">
            {filteredDeadlines.filter(d => !d.completed).length} pending
          </div>
        </div>

        {/* --- RESPONSIVE --- This list now scrolls and fills available space */}
        <div className="space-y-3 flex-1 overflow-y-auto pr-2">
          {filteredDeadlines.length > 0 ? (
            filteredDeadlines.map((d) => (
              <div 
                key={d.id}
                // --- THEME ---
                className="relative flex items-start gap-3 p-3 rounded-lg border border-[var(--border-color)] hover:shadow-md transition-all cursor-pointer group bg-[var(--bg-secondary)]"
                onMouseEnter={() => setHoveredDeadline(d)}
                onMouseLeave={() => setHoveredDeadline(null)}
                onClick={() => onDeadlineClick(d)}
              >
                <button 
                  onClick={(e) => handleComplete(d.id, e)}
                  className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border transition-all ${
                    d.completed 
                      ? 'bg-green-500 border-green-500' 
                      // --- THEME ---
                      : 'border-[var(--border-color)] hover:border-green-500'
                  }`}
                >
                  {d.completed && <CheckCircle2 size={12} className="text-white" />}
                </button>
                
                <div className="flex-1 min-w-0">
                  {/* --- THEME --- */}
                  <div className={`text-sm font-medium truncate ${
                    d.completed ? 'text-[var(--text-secondary)] line-through' : 'text-[var(--text-primary)]'
                  }`}>
                    {d.text}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {/* --- THEME --- */}
                    <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                      <Calendar size={10} />
                      {new Date(d.date).toLocaleDateString()}
                    </div>
                    {/* --- THEME --- */}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getUrgencyClasses(d.date)}`}>
                      {getDaysUntil(d.date)}
                    </span>
                  </div>
                </div>

                {/* Hover actions */}
                {hoveredDeadline?.id === d.id && (
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* --- THEME --- */}
                    <button className="p-1 hover:bg-[var(--hover-bg)] rounded text-[var(--text-secondary)]">
                      <MoreVertical size={12} />
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            // --- THEME ---
            <div className="text-center py-6 text-[var(--text-secondary)]">
              <Flag size={24} className="mx-auto mb-2 opacity-50" />
              <div className="text-sm">No deadlines</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    // --- THEME & RESPONSIVE --- 
    // REMOVED the wrapper div with "bg-white dark:bg-[#141414]"
    // Added h-full flex flex-col for proper scrolling
    <div className="h-full flex flex-col">
      {/* --- RESPONSIVE --- Header (does not scroll) */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* --- THEME --- */}
          <div className="p-2 bg-yellow-500/10 rounded-lg">
            <AlertTriangle size={18} className="text-yellow-500" />
          </div>
          <div>
            {/* --- THEME --- */}
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Upcoming Deadlines
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">Track important due dates</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* --- THEME --- */}
          <select 
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="text-xs border border-[var(--border-color)] rounded px-2 py-1 bg-[var(--bg-card)] text-[var(--text-primary)]"
          >
            <option value="upcoming">Upcoming</option>
            <option value="all">All</option>
          </select>
          {/* --- THEME --- */}
          <div className="text-xs text-[var(--text-secondary)]">
            {filteredDeadlines.filter(d => !d.completed).length} pending
          </div>
        </div>
      </div>

      {/* --- RESPONSIVE --- List (scrolls) */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {filteredDeadlines.length > 0 ? (
          filteredDeadlines.map((d) => (
            <div 
              key={d.id}
              // --- THEME ---
              className="relative flex items-center justify-between gap-4 p-4 rounded-lg border border-[var(--border-color)] hover:shadow-lg transition-all cursor-pointer group bg-[var(--bg-secondary)]"
              onMouseEnter={() => setHoveredDeadline(d)}
              onMouseLeave={() => setHoveredDeadline(null)}
              onClick={() => onDeadlineClick(d)}
            >
              <div className="flex items-start gap-3 flex-1">
                <button 
                  onClick={(e) => handleComplete(d.id, e)}
                  // --- THEME ---
                  className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border transition-all flex items-center justify-center ${
                    d.completed 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-[var(--border-color)] hover:border-green-500 hover:bg-green-500/10'
                  }`}
                >
                  {d.completed && <CheckCircle2 size={14} className="text-white" />}
                </button>
                
                <div className="flex-1">
                  {/* --- THEME --- */}
                  <div className={`font-medium text-sm mb-1 ${
                    d.completed ? 'text-[var(--text-secondary)] line-through' : 'text-[var(--text-primary)]'
                  }`}>
                    {d.text}
                  </div>
                  
                  {/* --- THEME --- */}
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--text-secondary)]">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(d.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    
                    {/* --- THEME --- */}
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getUrgencyClasses(d.date)} font-medium`}>
                      <Clock size={10} />
                      {getDaysUntil(d.date)}
                    </div>

                    {d.project && (
                      // --- THEME ---
                      <div className="text-xs text-[var(--accent-color)] bg-[var(--accent-color)]/10 px-2 py-1 rounded-full">
                        {d.project}
                      </div>
                    )}
                  </div>

                  {d.description && (
                    // --- THEME ---
                    <div className="text-xs text-[var(--text-secondary)] mt-2 line-clamp-2">
                      {d.description}
                    </div>
                  )}
                </div>
              </div>

              {/* --- THEME --- */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 hover:bg-[var(--hover-bg)] text-[var(--text-secondary)] rounded-lg transition-colors">
                  <MoreVertical size={14} />
                </button>
              </div>

              {/* Enhanced hover card */}
              {hoveredDeadline?.id === d.id && (
                // --- THEME ---
                <div className="absolute z-10 left-0 top-full mt-2 w-80 p-4 bg-[var(--bg-card)] rounded-lg shadow-xl border border-[var(--border-color)]">
                  <div className="font-medium text-sm mb-2 text-[var(--text-primary)]">{d.text}</div>
                  {d.description && (
                    // --- THEME ---
                    <div className="text-xs text-[var(--text-secondary)] mb-3">
                      {d.description}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                    <div>
                      {/* --- THEME --- */}
                      <div className="text-[var(--text-secondary)]">Due Date</div>
                      <div className="font-medium text-[var(--text-primary)]">
                        {new Date(d.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                    <div>
                      {/* --- THEME --- */}
                      <div className="text-[var(--text-secondary)]">Status</div>
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
                    {/* --- THEME --- */}
                    <button className="flex-1 py-2 px-3 bg-[var(--accent-color)] text-white text-xs rounded hover:bg-[color-mix(in_srgb,var(--accent-color)_80%_black)] transition-colors">
                      Start Working
                    </button>
                    <button className="flex-1 py-2 px-3 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors">
                      {d.completed ? 'Reopen' : 'Mark Done'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          // --- THEME ---
          <div className="text-center py-8 text-[var(--text-secondary)]">
            <Flag size={32} className="mx-auto mb-2 opacity-50" />
            <div className="text-sm">No deadlines found</div>
            <div className="text-xs mt-1">
              {view === 'upcoming' ? 'All caught up!' : 'No deadlines created yet'}
            </div>
          </div>
        )}
      </div>

      {/* --- RESPONSIVE --- Footer (does not scroll) */}
      {deadlines.length > 0 && (
        // --- THEME ---
        <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="font-bold text-blue-600">{deadlines.length}</div>
              {/* --- THEME --- */}
              <div className="text-[var(--text-secondary)]">Total</div>
            </div>
            <div>
              <div className="font-bold text-green-600">
                {deadlines.filter(d => d.completed).length}
              </div>
              {/* --- THEME --- */}
              <div className="text-[var(--text-secondary)]">Completed</div>
            </div>
            <div>
              <div className="font-bold text-red-600">
                {deadlines.filter(d => new Date(d.date) < new Date() && !d.completed).length}
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