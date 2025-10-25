// Components/Widgets/ProjectProgress.jsx
import React, { useMemo } from "react";
import { Briefcase } from "lucide-react";

const projects = [
  { name: "ReqRev", progress: 75 },
  { name: "GRT App", progress: 50 },
  { name: "Design System", progress: 25 },
  { name: "RedPlex", progress: 90 },
];

function ProgressBar({ pct }) {
  return (
    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
      <div style={{ width: `${pct}%` }} className="h-2 rounded-full bg-blue-600 transition-all"></div>
    </div>
  );
}

export default function ProjectProgress({
  containerWidth = 0,
  containerHeight = 0,
  isCompact = false,
}) {
  const size = useMemo(() => {
    if (isCompact || (containerWidth > 0 && containerWidth < 360)) return "compact";
    if (containerWidth > 0 && containerWidth < 640) return "medium";
    return "large";
  }, [containerWidth, isCompact]);

  // Compact: show initials + small dot progress
  if (size === "compact") {
    return (
      <div className="bg-white dark:bg-[#141414] p-3 rounded-xl shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-md text-indigo-500">
            <Briefcase size={14} />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Projects</h3>
        </div>

        <div className="flex gap-3">
          {projects.slice(0, 3).map((p) => (
            <div key={p.name} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-md bg-white/5 flex items-center justify-center text-xs font-semibold">
                {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="text-xs text-neutral-400">{p.progress}%</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Medium: vertical list with small bars
  if (size === "medium") {
    return (
      <div className="bg-white dark:bg-[#141414] p-4 rounded-xl shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-md text-indigo-500">
            <Briefcase size={16} />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Project Progress</h3>
        </div>

        <div className="space-y-3">
          {projects.map((p) => (
            <div key={p.name}>
              <div className="flex justify-between items-center mb-1">
                <div className="text-sm text-neutral-900 dark:text-neutral-100">{p.name}</div>
                <div className="text-xs text-neutral-400">{p.progress}%</div>
              </div>
              <ProgressBar pct={p.progress} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Large: show more spacing and percentage badges
  return (
    <div className="bg-white dark:bg-[#141414] p-5 rounded-xl shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-md text-indigo-500">
          <Briefcase size={18} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Project Progress</h3>
          <p className="text-xs text-neutral-400">Overview of active projects</p>
        </div>
      </div>

      <div className="space-y-4">
        {projects.map((p) => (
          <div key={p.name} className="flex items-center gap-3">
            <div className="w-12">
              <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{p.name}</div>
            </div>

            <div className="flex-1">
              <ProgressBar pct={p.progress} />
            </div>

            <div className="w-12 text-right">
              <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{p.progress}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
