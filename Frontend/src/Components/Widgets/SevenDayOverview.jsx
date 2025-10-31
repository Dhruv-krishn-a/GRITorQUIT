//Frontend/src/Components/Widgets/SevenDayOverview.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Calendar, CheckCircle2, Clock, TrendingUp } from "lucide-react";

export default function SevenDayOverview({ 
  weekData = [], 
  totalTasks = 0,
  containerWidth = 0,
  containerHeight = 0,
  isCompact = false 
}) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [animatedData, setAnimatedData] = useState([]);

  // Memoize the processed data to prevent unnecessary re-renders
  const processedData = useMemo(() => {
    return weekData.map(day => ({
      ...day,
      date: new Date(day.date),
      completionRate: day.tasks > 0 ? (day.completed / day.tasks) * 100 : 0,
      timePerTask: day.tasks > 0 ? (day.timeSpent || 0) / day.tasks : 0
    }));
  }, [weekData]);

  // Safe animation with useEffect and proper dependencies
  useEffect(() => {
    if (processedData.length > 0) {
      setAnimatedData(processedData);
    }
  }, [processedData]); // Only re-run when processedData changes

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }, []);

  // --- THEME --- (Semantic colors are OK)
  const getDayColor = useCallback((completionRate) => {
    if (completionRate >= 80) return "text-green-400";
    if (completionRate >= 60) return "text-blue-400";
    if (completionRate >= 40) return "text-yellow-400";
    return "text-red-400";
  }, []);

  // --- THEME --- (Semantic colors are OK)
  const getBarColor = useCallback((completionRate) => {
    if (completionRate >= 80) return "bg-green-500";
    if (completionRate >= 60) return "bg-blue-500";
    if (completionRate >= 40) return "bg-yellow-500";
    return "bg-red-500";
  }, []);

  const size = useMemo(() => {
    if (isCompact || (containerWidth > 0 && containerWidth < 400)) return "compact";
    if (containerWidth > 0 && containerWidth < 640) return "medium";
    return "large";
  }, [containerWidth, isCompact]);

  // Calculate weekly totals
  const weeklyTotals = useMemo(() => {
    return animatedData.reduce((totals, day) => ({
      tasks: totals.tasks + day.tasks,
      completed: totals.completed + day.completed,
      timeSpent: totals.timeSpent + (day.timeSpent || 0)
    }), { tasks: 0, completed: 0, timeSpent: 0 });
  }, [animatedData]);

  const formatTime = useCallback((minutes) => {
    if (!minutes) return "0m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }, []);

  if (size === "compact") {
    return (
      // --- RESPONSIVE --- Added h-full and flex-col
      <div className="space-y-4 h-full flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* --- THEME --- */}
            <Calendar size={16} className="text-[var(--accent-color)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">7-Day Overview</h3>
          </div>
          {/* --- THEME --- */}
          <div className="text-xs text-[var(--text-secondary)]">
            {weeklyTotals.completed}/{weeklyTotals.tasks} completed
          </div>
        </div>

        {/* --- RESPONSIVE --- This list now scrolls if widget is too short */}
        <div 
          className="space-y-2 flex-1 overflow-y-auto"
          style={{ maxHeight: containerHeight - 50 }} // 50px = approx header height
        >
          {animatedData.map((day, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              {/* --- THEME --- */}
              <span className="text-[var(--text-secondary)] w-16 truncate">
                {formatDate(day.date).split(' ')[0]}
              </span>
              {/* --- THEME --- */}
              <div className="flex-1 mx-2 bg-[var(--hover-bg)] rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getBarColor(day.completionRate)}`}
                  style={{ width: `${Math.min(day.completionRate, 100)}%` }}
                />
              </div>
              <span className={`font-medium w-8 text-right ${getDayColor(day.completionRate)}`}>
                {Math.round(day.completionRate)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- RESPONSIVE --- Added h-full and flex-col for better layout control
  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* --- THEME --- */}
          <Calendar size={20} className="text-[var(--accent-color)]" />
          <div>
            {/* --- THEME --- */}
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              7-Day Overview
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {weeklyTotals.tasks} total tasks this week
            </p>
          </div>
        </div>
        
        <div className="text-right">
          {/* --- THEME --- */}
          <div className="text-lg font-bold text-[var(--accent-color)]">
            {weeklyTotals.completed}/{weeklyTotals.tasks}
          </div>
          {/* --- THEME --- */}
          <div className="text-xs text-[var(--text-secondary)]">Completed</div>
        </div>
      </div>

      {/* Weekly Stats */}
      {/* --- THEME --- Replaced dark:/light: classes with theme-agnostic opacity */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 bg-blue-500/10 rounded-lg">
          <div className="text-lg font-bold text-blue-600">{weeklyTotals.tasks}</div>
          <div className="text-xs text-blue-500">Total Tasks</div>
        </div>
        <div className="p-3 bg-green-500/10 rounded-lg">
          <div className="text-lg font-bold text-green-600">
            {weeklyTotals.tasks > 0 ? Math.round((weeklyTotals.completed / weeklyTotals.tasks) * 100) : 0}%
          </div>
          <div className="text-xs text-green-500">Completion</div>
        </div>
        <div className="p-3 bg-orange-500/10 rounded-lg">
          <div className="text-lg font-bold text-orange-600">
            {formatTime(weeklyTotals.timeSpent)}
          </div>
          <div className="text-xs text-orange-500">Time Spent</div>
        </div>
      </div>

      {/* --- RESPONSIVE --- This container will take remaining space and its child will scroll */}
      <div className="flex-1 flex flex-col min-h-0 space-y-3">
        <div className="flex items-center justify-between text-sm">
          {/* --- THEME --- */}
          <span className="font-medium text-[var(--text-primary)]">
            Daily Progress
          </span>
          <span className="text-xs text-[var(--text-secondary)]">
            Avg: {weeklyTotals.tasks > 0 ? Math.round(weeklyTotals.tasks / 7) : 0} tasks/day
          </span>
        </div>

        {/* --- RESPONSIVE --- This div now scrolls internally */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {animatedData.map((day, index) => (
            <div
              key={index}
              // --- THEME ---
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                selectedDay === index
                  ? 'bg-[var(--accent-color)]/10 border-[var(--accent-color)]/30'
                  : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-[var(--text-secondary)]/30'
              }`}
              onClick={() => setSelectedDay(selectedDay === index ? null : index)}
            >
              <div className="flex items-center justify-between mb-2">
                {/* --- THEME --- */}
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {formatDate(day.date)}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${getDayColor(day.completionRate)}`}>
                    {Math.round(day.completionRate)}%
                  </span>
                  {day.timeSpent > 0 && (
                    // --- THEME ---
                    <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                      <Clock size={12} />
                      {formatTime(day.timeSpent)}
                    </div>
                  )}
                </div>
              </div>
              
              {/* --- THEME --- */}
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-2">
                <span>{day.completed}/{day.tasks} tasks completed</span>
                {day.timePerTask > 0 && (
                  <span>Avg: {Math.round(day.timePerTask)}m/task</span>
                )}
              </div>
              
              {/* --- THEME --- */}
              <div className="w-full bg-[var(--hover-bg)] rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${getBarColor(day.completionRate)}`}
                  style={{ width: `${Math.min(day.completionRate, 100)}%` }}
                />
              </div>

              {/* Expanded view when selected */}
              {selectedDay === index && (
                // --- THEME ---
                <div className="mt-3 pt-3 border-t border-[var(--border-color)] space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* --- THEME --- */}
                    <div className="flex items-center gap-1 text-[var(--text-primary)]">
                      <CheckCircle2 size={12} className="text-green-500" />
                      <span>{day.completed} completed</span>
                    </div>
                    {/* --- THEME --- */}
                    <div className="flex items-center gap-1 text-[var(--text-primary)]">
                      <Clock size={12} className="text-blue-500" />
                      <span>{formatTime(day.timeSpent)} spent</span>
                    </div>
                  </div>
                  {day.timeSpent > 0 && day.completed > 0 && (
                    // --- THEME ---
                    <div className="text-xs text-[var(--text-secondary)]">
                      Efficiency: {Math.round(day.timeSpent / day.completed)}m per task
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Trend */}
      {weeklyTotals.tasks > 0 && (
        // --- THEME ---
        <div className="p-3 bg-[var(--accent-color)]/10 rounded-lg border border-[var(--accent-color)]/30">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-[var(--accent-color)]">
              Weekly Trend
            </span>
            <span className="text-[var(--accent-color)] text-xs flex items-center gap-1">
              <TrendingUp size={12} />
              {weeklyTotals.completed > 0 ? 'Positive' : 'Getting Started'}
            </span>
          </div>
          <div className="text-xs text-[var(--accent-color)]/80">
            {weeklyTotals.completed} tasks completed this week • {formatTime(weeklyTotals.timeSpent)} total focus time
          </div>
        </div>
      )}
    </div>
  );
}