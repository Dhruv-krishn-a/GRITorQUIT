// Components/Widgets/SevenDayOverview.jsx
import React, { useMemo } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const days = [
  { date: 20, day: "MON", tasks: 5 },
  { date: 21, day: "TUE", tasks: 8 },
  { date: 22, day: "WED", tasks: 3 },
  { date: 23, day: "THU", tasks: 6 },
  { date: 24, day: "FRI", tasks: 4, current: true },
  { date: 25, day: "SAT", tasks: 2 },
  { date: 26, day: "SUN", tasks: 7 },
];

export default function SevenDayOverview({
  containerWidth = 0,
  containerHeight = 0,
  isCompact = false,
}) {
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

  // Minimal: Just current day with essential info
  if (adaptiveLayout === "minimal") {
    const today = days.find((d) => d.current) || days[0];
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
              {today.day} • {today.tasks} tasks
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
        <button className="p-1 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors rounded">
          <ChevronLeft size={adaptiveLayout === "compact" ? 16 : 18} />
        </button>
        <button className="p-1 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors rounded">
          <ChevronRight size={adaptiveLayout === "compact" ? 16 : 18} />
        </button>
      </div>
    </div>
  );

  // Day component with adaptive sizing
  const Day = ({ day, layout }) => {
    const baseStyles = "flex flex-col items-center justify-center rounded-lg transition-all";
    
    const sizeStyles = {
      minimal: "w-8 h-10 text-xs",
      compact: "w-10 h-12 text-xs",
      comfortable: "w-12 h-16 text-sm",
      spacious: "w-14 h-20 text-base"
    };

    const colorStyles = day.current 
      ? "bg-blue-600 text-white shadow-md" 
      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200";

    return (
      <div className={`${baseStyles} ${sizeStyles[layout]} ${colorStyles}`}>
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
          {day.tasks}
        </span>
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
        {days.map((day) => (
          <Day key={day.date} day={day} layout={adaptiveLayout} />
        ))}
      </div>

      {/* Progress indicator for very compact views */}
      {adaptiveLayout === "compact" && (
        <div className="flex justify-center gap-1 mt-2">
          {days.map((day, index) => (
            <div
              key={index}
              className={`w-1 h-1 rounded-full ${
                day.current 
                  ? "bg-blue-600" 
                  : "bg-neutral-300 dark:bg-neutral-600"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}