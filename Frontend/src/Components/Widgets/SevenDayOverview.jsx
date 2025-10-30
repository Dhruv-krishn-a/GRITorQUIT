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

  const getDayColor = useCallback((completionRate) => {
    if (completionRate >= 80) return "text-green-400";
    if (completionRate >= 60) return "text-blue-400";
    if (completionRate >= 40) return "text-yellow-400";
    return "text-red-400";
  }, []);

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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-purple-500" />
            <h3 className="text-sm font-semibold">7-Day Overview</h3>
          </div>
          <div className="text-xs text-gray-400">
            {weeklyTotals.completed}/{weeklyTotals.tasks} completed
          </div>
        </div>

        <div className="space-y-2">
          {animatedData.map((day, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <span className="text-gray-400 w-16 truncate">
                {formatDate(day.date).split(' ')[0]}
              </span>
              <div className="flex-1 mx-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar size={20} className="text-purple-500" />
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              7-Day Overview
            </h3>
            <p className="text-xs text-neutral-400">
              {weeklyTotals.tasks} total tasks this week
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-purple-500">
            {weeklyTotals.completed}/{weeklyTotals.tasks}
          </div>
          <div className="text-xs text-neutral-400">Completed</div>
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-lg font-bold text-blue-600">{weeklyTotals.tasks}</div>
          <div className="text-xs text-blue-500">Total Tasks</div>
        </div>
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-lg font-bold text-green-600">
            {weeklyTotals.tasks > 0 ? Math.round((weeklyTotals.completed / weeklyTotals.tasks) * 100) : 0}%
          </div>
          <div className="text-xs text-green-500">Completion</div>
        </div>
        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="text-lg font-bold text-orange-600">
            {formatTime(weeklyTotals.timeSpent)}
          </div>
          <div className="text-xs text-orange-500">Time Spent</div>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            Daily Progress
          </span>
          <span className="text-xs text-neutral-400">
            Avg: {weeklyTotals.tasks > 0 ? Math.round(weeklyTotals.tasks / 7) : 0} tasks/day
          </span>
        </div>

        {animatedData.map((day, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              selectedDay === index
                ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setSelectedDay(selectedDay === index ? null : index)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {formatDate(day.date)}
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${getDayColor(day.completionRate)}`}>
                  {Math.round(day.completionRate)}%
                </span>
                {day.timeSpent > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={12} />
                    {formatTime(day.timeSpent)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
              <span>{day.completed}/{day.tasks} tasks completed</span>
              {day.timePerTask > 0 && (
                <span>Avg: {Math.round(day.timePerTask)}m/task</span>
              )}
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ${getBarColor(day.completionRate)}`}
                style={{ width: `${Math.min(day.completionRate, 100)}%` }}
              />
            </div>

            {/* Expanded view when selected */}
            {selectedDay === index && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-green-500" />
                    <span>{day.completed} completed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={12} className="text-blue-500" />
                    <span>{formatTime(day.timeSpent)} spent</span>
                  </div>
                </div>
                {day.timeSpent > 0 && day.completed > 0 && (
                  <div className="text-xs text-gray-500">
                    Efficiency: {Math.round(day.timeSpent / day.completed)}m per task
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Weekly Trend */}
      {weeklyTotals.tasks > 0 && (
        <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-purple-600 dark:text-purple-400">
              Weekly Trend
            </span>
            <span className="text-purple-500 text-xs flex items-center gap-1">
              <TrendingUp size={12} />
              {weeklyTotals.completed > 0 ? 'Positive' : 'Getting Started'}
            </span>
          </div>
          <div className="text-xs text-purple-500">
            {weeklyTotals.completed} tasks completed this week • {formatTime(weeklyTotals.timeSpent)} total focus time
          </div>
        </div>
      )}
    </div>
  );
}