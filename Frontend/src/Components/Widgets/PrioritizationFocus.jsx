// Components/Widgets/PrioritizationFocus.jsx
import React, { useMemo } from "react";
import { Flame } from "lucide-react";

const tasks = [
  {
    id: 1,
    text: "Finish API endpoint for auth",
    project: "RedPlex",
    dueDate: "Today",
    completed: false,
  },
  {
    id: 2,
    text: "Create final logo mocks",
    project: "GRT App",
    dueDate: "Due Today",
    completed: false,
  },
  {
    id: 3,
    text: "Call Mayank sir re UI/UX",
    project: "Project Review",
    dueDate: "Due Today",
    completed: false,
  },
  {
    id: 4,
    text: "Write tests for payments",
    project: "ReqRev",
    dueDate: "Tomorrow",
    completed: false,
  },
];

export default function PrioritizationFocus({
  containerWidth = 0,
  containerHeight = 0,
  isCompact = false,
}) {
  const size = useMemo(() => {
    if (isCompact || (containerWidth > 0 && containerWidth < 380)) return "compact";
    if (containerWidth > 0 && containerWidth < 720) return "medium";
    return "large";
  }, [containerWidth, isCompact]);

  return (
    <div className="bg-white dark:bg-[#141414] p-4 rounded-xl shadow-md transition-all">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-md text-orange-500">
          <Flame size={16} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Prioritization Focus</h3>
          <p className="text-xs text-neutral-500">Your top tasks for focus</p>
        </div>
      </div>

      {/* Compact: show only top 1-2 tasks as single-line items */}
      {size === "compact" && (
        <div className="flex flex-col gap-2">
          {tasks.slice(0, 2).map((t) => (
            <div key={t.id} className="flex items-center justify-between text-sm">
              <div className="truncate">{t.text}</div>
              <div className="text-xs text-neutral-400 ml-2">{t.dueDate}</div>
            </div>
          ))}
        </div>
      )}

      {/* Medium: show a simple list with project and due date */}
      {size === "medium" && (
        <div className="space-y-3">
          {tasks.slice(0, 4).map((t) => (
            <div key={t.id} className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={t.completed}
                readOnly
                className="mt-1 form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-neutral-600"
              />
              <div className="flex-1">
                <div className="text-sm text-neutral-900 dark:text-neutral-100 truncate">{t.text}</div>
                <div className="text-xs text-neutral-400">
                  {t.project} • {t.dueDate}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Large: richer layout with small meta & action buttons */}
      {size === "large" && (
        <>
          <div className="space-y-3">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    readOnly
                    className="mt-1 form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 dark:border-neutral-600"
                  />
                  <div>
                    <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{t.text}</div>
                    <div className="text-xs text-neutral-400 mt-0.5">
                      Project: <span className="text-neutral-200">{t.project}</span> • {t.dueDate}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-2 py-1 text-xs bg-white/5 rounded-md">Snooze</button>
                  <button className="px-2 py-1 text-xs bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md">
                    Mark
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
