// Components/Widgets/TotalTimeSpend.jsx
import React, { useMemo } from "react";
import { Clock } from "lucide-react";

export default function TotalTimeSpend({
  containerWidth = 0,
  containerHeight = 0,
  isCompact = false,
  stats = {
    today: "3h 45m",
    week: "28h 15m",
    month: "112h 30m",
    total: "1450h 05m",
  },
}) {
  const size = useMemo(() => {
    if (isCompact || (containerWidth > 0 && containerWidth < 360)) return "compact";
    if (containerWidth > 0 && containerWidth < 640) return "medium";
    return "large";
  }, [containerWidth, isCompact]);

  if (size === "compact") {
    return (
      <div className="bg-white dark:bg-[#141414] p-3 rounded-xl shadow-md text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Clock size={14} className="text-purple-500" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Time</h3>
        </div>
        <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{stats.today}</div>
        <div className="text-xs text-neutral-400">Today</div>
      </div>
    );
  }

  if (size === "medium") {
    return (
      <div className="bg-white dark:bg-[#141414] p-4 rounded-xl shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <Clock size={16} className="text-purple-500" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Total Time Spend</h3>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{stats.today}</div>
            <div className="text-xs text-neutral-400">Today</div>
          </div>
          <div>
            <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{stats.week}</div>
            <div className="text-xs text-neutral-400">Past Week</div>
          </div>

          <div className="col-span-2 border-t border-neutral-200 dark:border-neutral-700 pt-3 mt-3">
            <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{stats.month}</div>
            <div className="text-xs text-neutral-400">Past Month</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#141414] p-5 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Clock size={18} className="text-purple-500" />
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Total Time Spend</h3>
            <p className="text-xs text-neutral-400">Overview of tracked time</p>
          </div>
        </div>

        <div className="text-xs text-neutral-400">Updated 1h ago</div>
      </div>

      <div className="grid grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.today}</div>
          <div className="text-xs text-neutral-400 uppercase mt-1">Today</div>
        </div>

        <div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.week}</div>
          <div className="text-xs text-neutral-400 uppercase mt-1">Past Week</div>
        </div>

        <div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.month}</div>
          <div className="text-xs text-neutral-400 uppercase mt-1">Past Month</div>
        </div>

        <div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.total}</div>
          <div className="text-xs text-neutral-400 uppercase mt-1">Total</div>
        </div>
      </div>
    </div>
  );
}
