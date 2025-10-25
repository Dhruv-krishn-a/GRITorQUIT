// Components/Widgets/UpcomingDeadlines.jsx
import React, { useMemo } from "react";
import { AlertTriangle } from "lucide-react";

const sampleDeadlines = [
  { id: 1, text: "Setup Playwright tests", date: "Oct 25 (Tomorrow)", completed: false },
  { id: 2, text: "Client payment follow-up", date: "Oct 27", completed: false },
  { id: 3, text: "Submit project proposal", date: "Oct 29", completed: false },
  { id: 4, text: "Design system review", date: "Nov 2", completed: false },
];

export default function UpcomingDeadlines({
  containerWidth = 0,
  containerHeight = 0,
  isCompact = false,
  deadlines = sampleDeadlines,
}) {
  const size = useMemo(() => {
    if (isCompact || (containerWidth > 0 && containerWidth < 360)) return "compact";
    if (containerWidth > 0 && containerWidth < 680) return "medium";
    return "large";
  }, [containerWidth, isCompact]);

  if (size === "compact") {
    // show just next deadline
    const next = deadlines[0];
    return (
      <div className="bg-white dark:bg-[#141414] p-3 rounded-xl shadow-md flex items-center gap-3">
        <AlertTriangle size={16} className="text-yellow-500" />
        <div>
          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{next.text}</div>
          <div className="text-xs text-neutral-400">{next.date}</div>
        </div>
      </div>
    );
  }

  if (size === "medium") {
    return (
      <div className="bg-white dark:bg-[#141414] p-4 rounded-xl shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle size={16} className="text-yellow-500" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Upcoming Deadlines</h3>
        </div>

        <div className="space-y-3 max-h-48 overflow-auto pr-2">
          {deadlines.slice(0, 4).map((d) => (
            <div key={d.id} className="flex items-start gap-3">
              <input type="checkbox" checked={d.completed} readOnly className="mt-1 form-checkbox h-4 w-4" />
              <div className="flex-1">
                <div className="text-sm text-neutral-900 dark:text-neutral-100 truncate">{d.text}</div>
                <div className="text-xs text-neutral-400">{d.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#141414] p-5 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <AlertTriangle size={18} className="text-yellow-500" />
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Upcoming Deadlines</h3>
            <p className="text-xs text-neutral-400">Keep track of important due dates</p>
          </div>
        </div>

        <div className="text-xs text-neutral-400">3 upcoming</div>
      </div>

      <div className="space-y-4">
        {deadlines.map((d) => (
          <div key={d.id} className="flex items-center justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <input type="checkbox" checked={d.completed} readOnly className="mt-1 form-checkbox h-5 w-5" />
              <div>
                <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{d.text}</div>
                <div className="text-xs text-neutral-400 mt-1">{d.date}</div>
              </div>
            </div>

            <div className="text-xs text-neutral-400">{d.date.includes("Tomorrow") ? "Soon" : ""}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
