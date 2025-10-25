// Components/Widgets/ActivityNotes.jsx
import React, { useMemo } from "react";
import { ListTodo, NotebookText } from "lucide-react";

const activityLog = [
  { id: 1, text: "Deployed v1.2 to staging", time: "2m ago" },
  { id: 2, text: "Onboarded new client", time: "1h ago" },
  { id: 3, text: "Fixed login bug", time: "3h ago" },
  { id: 4, text: "Sprint planning tomorrow", time: "5h ago" },
];

const notesLog = [
  { id: 1, text: "Meeting with design team at 2 PM today." },
  { id: 2, text: "Remember to follow up on the GRT App logo." },
  { id: 3, text: "Share wireframes with product." },
];

export default function ActivityNotes({
  containerWidth = 0,
  containerHeight = 0,
  isCompact = false,
}) {
  // sizeCategory: compact | medium | large
  const sizeCategory = useMemo(() => {
    if (isCompact || (containerWidth > 0 && containerWidth < 380)) return "compact";
    if (containerWidth > 0 && containerWidth < 700) return "medium";
    return "large";
  }, [containerWidth, isCompact]);

  const showCount = sizeCategory !== "compact";

  return (
    <div className="bg-white dark:bg-[#141414] p-4 rounded-xl shadow-md transition-colors duration-200">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex gap-2 items-center">
          <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
            <ListTodo size={16} />
          </div>
          <div className="p-2 rounded-md bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300">
            <NotebookText size={16} />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Activity & Notes
          </h3>
          {showCount && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {activityLog.length} recent · {notesLog.length} notes
            </p>
          )}
        </div>
      </div>

      {/* Compact: very small footprint, only top items with tiny text */}
      {sizeCategory === "compact" && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <div className="truncate">{activityLog[0]?.text}</div>
            <div className="text-neutral-400 ml-2">{activityLog[0]?.time}</div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="truncate">{notesLog[0]?.text}</div>
            <div className="text-neutral-400 ml-2">note</div>
          </div>
        </div>
      )}

      {/* Medium: show short lists with small meta */}
      {sizeCategory === "medium" && (
        <div className="space-y-3">
          <div>
            <h4 className="text-xs text-neutral-500 mb-2">Recent activity</h4>
            <div className="space-y-2">
              {activityLog.slice(0, 3).map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 text-blue-600">
                    <ListTodo size={12} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-neutral-800 dark:text-neutral-100 truncate">
                      {a.text}
                    </div>
                    <div className="text-xs text-neutral-400">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs text-neutral-500 mb-2">Notes</h4>
            <div className="space-y-2">
              {notesLog.slice(0, 2).map((n) => (
                <div key={n.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center bg-green-50 dark:bg-green-900/30 text-green-600">
                    <NotebookText size={12} />
                  </div>
                  <div className="text-sm text-neutral-800 dark:text-neutral-100 truncate">{n.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Large: full lists, timestamps, and actions */}
      {sizeCategory === "large" && (
        <div className="space-y-4">
          <div>
            <h4 className="text-xs text-neutral-500 mb-2">Recent activity</h4>
            <div className="space-y-3">
              {activityLog.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 text-blue-600">
                    <ListTodo size={14} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{a.text}</div>
                    <div className="text-xs text-neutral-400">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs text-neutral-500 mb-2">Notes</h4>
            <div className="space-y-3">
              {notesLog.map((n) => (
                <div key={n.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center bg-green-50 dark:bg-green-900/30 text-green-600">
                    <NotebookText size={14} />
                  </div>
                  <div className="text-sm text-neutral-900 dark:text-neutral-100">{n.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
