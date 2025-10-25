// Components/Widgets/TaskHeatmap.jsx
import React, { useMemo } from "react";
import { TrendingUp } from "lucide-react";

const sampleData = [
  [0, 1, 0, 1, 0, 0, 1],
  [1, 1, 1, 0, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 0],
  [1, 0, 0, 1, 0, 1, 1],
  [0, 1, 1, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
];

const dayLetters = ["S", "M", "T", "W", "T", "F", "S"];

export default function TaskHeatmap({
  containerWidth = 0,
  containerHeight = 0,
  isCompact = false,
  data = sampleData,
}) {
  const size = useMemo(() => {
    if (isCompact || (containerWidth > 0 && containerWidth < 360)) return "compact";
    if (containerWidth > 0 && containerWidth < 640) return "medium";
    return "large";
  }, [containerWidth, isCompact]);

  // render small squares for heatmap; scale square size by container
  const cellSize = size === "large" ? 18 : size === "medium" ? 14 : 10;

  // compact -> show single stacked bar (total activity)
  if (size === "compact") {
    const total = data.flat().reduce((s, v) => s + v, 0);
    return (
      <div className="bg-white dark:bg-[#141414] p-3 rounded-xl shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp size={16} className="text-teal-500" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Heatmap</h3>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">{total} actions</div>
          <div className="text-xs text-neutral-400">Last 7 days</div>
        </div>
      </div>
    );
  }

  // medium -> horizontal condensed heat row with legend
  if (size === "medium") {
    const totalsByDay = data[0].map((_, col) => data.reduce((s, row) => s + (row[col] || 0), 0));
    return (
      <div className="bg-white dark:bg-[#141414] p-4 rounded-xl shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp size={16} className="text-teal-500" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Task Heatmap</h3>
        </div>

        <div className="flex gap-3 items-center overflow-x-auto">
          {totalsByDay.map((t, i) => (
            <div key={i} className="flex flex-col items-center w-10">
              <div
                className="w-8 rounded-sm"
                style={{
                  height: `${Math.max(6, t * 6)}px`,
                  background: t === 0 ? "#E5E7EB" : t < 3 ? "#86EFAC" : "#16A34A",
                }}
                title={`${dayLetters[i]} — ${t}`}
              />
              <div className="text-xs text-neutral-400 mt-1">{dayLetters[i]}</div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-end text-xs text-neutral-400 gap-2">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-neutral-200 dark:bg-neutral-700" />
            <div className="w-3 h-3 rounded-sm bg-green-300" />
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <div className="w-3 h-3 rounded-sm bg-green-700" />
          </div>
          <span>More</span>
        </div>
      </div>
    );
  }

  // large -> full matrix
  return (
    <div className="bg-white dark:bg-[#141414] p-4 rounded-xl shadow-md">
      <div className="flex items-center gap-3 mb-3">
        <TrendingUp size={18} className="text-teal-500" />
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Task Heatmap</h3>
      </div>

      <div className="mt-2">
        <div className="grid" style={{ gridTemplateColumns: `repeat(8, ${cellSize}px)`, gap: 6 }}>
          <div style={{ width: cellSize }} /> {/* spacer */}
          {dayLetters.map((d, i) => (
            <div key={`h-${i}`} className="text-xs text-neutral-400 text-center" style={{ width: cellSize }}>
              {d}
            </div>
          ))}

          {data.map((row, rIdx) => (
            <React.Fragment key={`row-${rIdx}`}>
              <div className="text-xs text-neutral-400 text-center" style={{ height: cellSize, width: cellSize }}>
                {["M", "T", "W", "T", "F", "S", "S"][rIdx]}
              </div>

              {row.map((val, cIdx) => {
                const bg =
                  val === 0 ? "bg-neutral-200 dark:bg-neutral-700" : val === 1 ? "bg-green-300 dark:bg-green-600" : "bg-green-600 dark:bg-green-700";
                return (
                  <div
                    key={`cell-${rIdx}-${cIdx}`}
                    className={`${bg} rounded-sm`}
                    style={{ width: cellSize, height: cellSize }}
                    title={`Activity: ${val}`}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-end text-xs text-neutral-400 gap-2">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-neutral-200 dark:bg-neutral-700" />
            <div className="w-3 h-3 rounded-sm bg-green-300" />
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <div className="w-3 h-3 rounded-sm bg-green-700" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
