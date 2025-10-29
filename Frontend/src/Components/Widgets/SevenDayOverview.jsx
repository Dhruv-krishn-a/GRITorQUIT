import React, { useMemo, useState, useEffect } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, CheckCircle2 } from "lucide-react";

export default function SevenDayOverview({
  containerWidth = 0,
  containerHeight = 0,
  isCompact = false,
  plans = [],
  onDayClick = () => {}
}) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState(null);
  const [weekData, setWeekData] = useState([]);

  const adaptiveLayout = useMemo(() => {
    if (isCompact || containerWidth < 300) {
      return "minimal";
    } else if (containerWidth < 450) {
      return "compact";
    } else if (containerWidth < 600) {
      return "comfortable";
    } else {
      return "spacious";
    }
  }, [containerWidth, isCompact]);

  // Generate week data from plans
  useEffect(() => {
    const generateWeekData = () => {
      const startOfWeek = new Date(currentWeek);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      
      const weekDays = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        
        // Get tasks for this date from plans
        const dayTasks = [];
        plans.forEach(plan => {
          plan.tasks?.forEach(task => {
            const taskDate = new Date(task.date);
            if (taskDate.toDateString() === date.toDateString()) {
              dayTasks.push({
                ...task,
                planTitle: plan.title
              });
            }
          });
        });

        const isToday = date.toDateString() === new Date().toDateString();
        
        weekDays.push({
          date: date.getDate(),
          day: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
          fullDate: date,
          tasks: dayTasks.length,
          isToday,
          taskDetails: dayTasks
        });
      }
      
      setWeekData(weekDays);
    };

    generateWeekData();
  }, [currentWeek, plans]);

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const getTaskStats = (tasks) => {
    const completed = tasks.filter(task => task.completed).length;
    const totalTime = tasks.reduce((sum, task) => sum + (task.actualTime || 0), 0);
    return { completed, total: tasks.length, totalTime };
  };

  // Minimal: Just current day with essential info
  if (adaptiveLayout === "minimal") {
    const today = weekData.find(d => d.isToday) || weekData[0];
    const stats = today ? getTaskStats(today.taskDetails) : { completed: 0, total: 0, totalTime: 0 };
    
    return (
      <div className="h-full flex flex-col bg-white dark:bg-[#141414] rounded-xl shadow-md">
        <div className="flex items-center gap-2 p-3">
          <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-md text-blue-500">
            <CalendarDays size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              Today
            </div>
            <div className="text-xs text-neutral-400 truncate">
              {stats.completed}/{stats.total} tasks • {Math.floor(stats.totalTime / 60)}h
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Header component reused across layouts
  const Header = () => (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className={`p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md text-blue-500 ${
          adaptiveLayout === "compact" ? "p-1.5" : ""
        }`}>
          <CalendarDays size={adaptiveLayout === "compact" ? 14 : 16} />
        </div>
        <div>
          <h3 className={`font-semibold text-neutral-900 dark:text-neutral-100 ${
            adaptiveLayout === "compact" ? "text-sm" : "text-base"
          }`}>
            7-Day Overview
          </h3>
          {adaptiveLayout === "spacious" && (
            <p className="text-xs text-neutral-400">Plan and quick glance</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button 
          onClick={() => navigateWeek('prev')}
          className="p-1 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronLeft size={adaptiveLayout === "compact" ? 16 : 18} />
        </button>
        <button 
          onClick={() => navigateWeek('next')}
          className="p-1 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronRight size={adaptiveLayout === "compact" ? 16 : 18} />
        </button>
      </div>
    </div>
  );

  // Day component with adaptive sizing
  const Day = ({ day, layout }) => {
    const stats = getTaskStats(day.taskDetails);
    const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
    
    const baseStyles = "flex flex-col items-center justify-center rounded-lg transition-all cursor-pointer transform hover:scale-105";
    
    const sizeStyles = {
      minimal: "w-8 h-10 text-xs",
      compact: "w-10 h-12 text-xs",
      comfortable: "w-12 h-16 text-sm",
      spacious: "w-14 h-20 text-base"
    };

    const colorStyles = day.isToday 
      ? "bg-blue-600 text-white shadow-md" 
      : completionRate === 100 
        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
        : completionRate > 0
          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200";

    return (
      <div 
        className={`relative ${baseStyles} ${sizeStyles[layout]} ${colorStyles}`}
        onMouseEnter={() => setHoveredDay(day)}
        onMouseLeave={() => setHoveredDay(null)}
        onClick={() => onDayClick(day)}
      >
        <span className={`font-medium uppercase ${
          layout === "minimal" ? "text-[10px]" : "text-xs"
        }`}>
          {layout === "minimal" ? day.day.charAt(0) : day.day}
        </span>
        <span className={`font-bold ${
          layout === "minimal" ? "text-sm" : 
          layout === "compact" ? "text-base" : 
          layout === "comfortable" ? "text-lg" : "text-xl"
        }`}>
          {day.date}
        </span>
        <span className={`mt-0.5 ${
          layout === "minimal" ? "text-[10px]" : "text-xs"
        }`}>
          {stats.total}
        </span>

        {/* Progress indicator */}
        {stats.total > 0 && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-white dark:bg-gray-800 bg-opacity-50 rounded-full">
            <div 
              className="h-1 bg-current rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        )}

        {/* Hover Tooltip */}
        {hoveredDay?.fullDate?.getTime() === day.fullDate.getTime() && (
          <div className="absolute z-20 top-full mt-2 left-1/2 transform -translate-x-1/2 w-64 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="font-medium text-sm mb-2">
              {day.fullDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-3 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">{stats.total}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{stats.completed}</div>
                <div className="text-xs text-gray-500">Done</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">{Math.floor(stats.totalTime / 60)}h</div>
                <div className="text-xs text-gray-500">Time</div>
              </div>
            </div>

            {day.taskDetails.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {day.taskDetails.slice(0, 3).map((task, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                    {task.completed ? (
                      <CheckCircle2 size={12} className="text-green-500 flex-shrink-0" />
                    ) : (
                      <Clock size={12} className="text-blue-500 flex-shrink-0" />
                    )}
                    <span className="truncate flex-1">{task.title}</span>
                  </div>
                ))}
                {day.taskDetails.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{day.taskDetails.length - 3} more tasks
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-2 text-gray-500 text-xs">
                No tasks scheduled
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white dark:bg-[#141414] rounded-xl shadow-md h-full flex flex-col ${
      adaptiveLayout === "compact" ? "p-3" : "p-4"
    }`}>
      <Header />
      
      <div className={`flex items-center ${
        adaptiveLayout === "spacious" ? "justify-between" : "justify-around"
      } gap-1 flex-1`}>
        {weekData.map((day, index) => (
          <Day key={index} day={day} layout={adaptiveLayout} />
        ))}
      </div>

      {/* Week summary */}
      {adaptiveLayout === "spacious" && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Week Total</span>
            <span>
              {weekData.reduce((sum, day) => sum + day.taskDetails.length, 0)} tasks • 
              {Math.floor(weekData.reduce((sum, day) => sum + day.taskDetails.reduce((time, task) => time + (task.actualTime || 0), 0), 0) / 60)}h
            </span>
          </div>
        </div>
      )}

      {/* Progress indicator for very compact views */}
      {adaptiveLayout === "compact" && (
        <div className="flex justify-center gap-1 mt-2">
          {weekData.map((day, index) => (
            <div
              key={index}
              className={`w-1 h-1 rounded-full transition-all ${
                day.isToday 
                  ? "bg-blue-600 w-2" 
                  : day.taskDetails.length > 0
                    ? "bg-green-500"
                    : "bg-neutral-300 dark:bg-neutral-600"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}