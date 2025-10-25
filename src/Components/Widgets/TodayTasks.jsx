// Components/Widgets/TodayTasks.jsx
import React, { useMemo } from "react";
import { ListChecks } from "lucide-react";

const sampleTasks = [
  { id: 1, text: "Task A", description: "Subtask, description...", completed: false },
  { id: 2, text: "Task B", description: "Subtask, description...", completed: false },
  { id: 3, text: "Task C", description: "Subtask, description...", completed: false },
  { id: 4, text: "Task D", description: "Subtask, description...", completed: false },
  { id: 5, text: "Task E", description: "Subtask, description...", completed: false },
  { id: 6, text: "Design review session", description: "Review mockups with team...", completed: false },
  { id: 7, text: "Write documentation", description: "API endpoint docs...", completed: false },
  { id: 8, text: "Client presentation", description: "Show progress to stakeholders...", completed: false },
];

export default function TodayTasks({
  containerWidth = 0,
  containerHeight = 0,
  isCompact = false,
  tasks = sampleTasks,
}) {
  const size = useMemo(() => {
    if (isCompact || (containerWidth > 0 && containerWidth < 360)) return "compact";
    if (containerWidth > 0 && containerWidth < 700) return "medium";
    return "large";
  }, [containerWidth, isCompact]);

  // Compact: show first 3 tasks titles only
  if (size === "compact") {
    return (
      <div className="bg-white dark:bg-[#141414] p-3 rounded-xl shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <ListChecks size={14} className="text-green-500" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Today's Tasks</h3>
        </div>
        <ul className="text-sm text-neutral-400 space-y-1">
          {tasks.slice(0, 3).map((t) => (
            <li key={t.id} className="truncate">{t.text}</li>
          ))}
        </ul>
      </div>
    );
  }

  // Medium: compact list with small descriptions and checkbox
  if (size === "medium") {
    return (
      <div className="bg-white dark:bg-[#141414] p-4 rounded-xl shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <ListChecks size={16} className="text-green-500" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Today's Tasks</h3>
        </div>

        <div className="space-y-3 max-h-56 overflow-auto pr-2">
          {tasks.slice(0, 6).map((task) => (
            <div key={task.id} className="flex items-start gap-3">
              <input type="checkbox" checked={task.completed} readOnly className="mt-1 form-checkbox h-4 w-4" />
              <div className="flex-1">
                <div className="text-sm text-neutral-900 dark:text-neutral-100 truncate">{task.text}</div>
                <div className="text-xs text-neutral-400">{task.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Large: full list with more spacing and actions
  return (
    <div className="bg-white dark:bg-[#141414] p-5 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <ListChecks size={18} className="text-green-500" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Today's Tasks</h3>
        </div>

        <div className="text-xs text-neutral-400">8 items</div>
      </div>

      <div className="space-y-4 max-h-72 overflow-auto pr-2">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-start gap-3">
            <input type="checkbox" checked={task.completed} readOnly className="mt-1 form-checkbox h-5 w-5" />
            <div className="flex-1">
              <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{task.text}</div>
              <div className="text-xs text-neutral-400 mt-1">{task.description}</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-xs px-2 py-1 rounded-md bg-white/5">Snooze</button>
              <button className="text-xs px-2 py-1 rounded-md bg-gradient-to-r from-green-600 to-teal-500 text-white">Done</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
