// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import PrioritizationFocus from "../Components/Widgets/PrioritizationFocus";
import SevenDayOverview from "../Components/Widgets/SevenDayOverview";
import TodayTasks from "../Components/Widgets/TodayTasks";
import TotalTimeSpend from "../Components/Widgets/TotalTimeSpend";
import UpcomingDeadlines from "../Components/Widgets/UpcomingDeadlines";
import ProjectProgress from "../Components/Widgets/ProjectProgress";
import TaskHeatmap from "../Components/Widgets/TaskHeatmap";
import ActivityNotes from "../Components/Widgets/ActivityNotes";
import MainLayout from "../MainLayout";
import { Plus } from "lucide-react";

const ResponsiveGridLayout = WidthProvider(Responsive);
const LAYOUT_STORAGE_KEY = "grit_dashboard_layout_v3";

// Update the component to accept username as a prop
export default function Dashboard({ username, onLogout }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentBreakpoint, setCurrentBreakpoint] = useState("lg");

  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

  const defaultLgLayout = [
    { i: "prioritization", x: 0, y: 0, w: 6, h: 8 },
    { i: "overview", x: 6, y: 0, w: 6, h: 8 },
    { i: "today", x: 0, y: 8, w: 12, h: 6 },
    { i: "time", x: 0, y: 14, w: 12, h: 4 },
    { i: "deadlines", x: 0, y: 18, w: 6, h: 5 },
    { i: "projects", x: 6, y: 18, w: 6, h: 5 },
    { i: "heatmap", x: 0, y: 23, w: 6, h: 6 },
    { i: "notes", x: 6, y: 23, w: 6, h: 6 },
  ];

  const defaultLayouts = useMemo(() => {
    return {
      lg: defaultLgLayout,
      md: defaultLgLayout,
      sm: defaultLgLayout.map(item => ({ ...item, w: Math.min(item.w, 6), x: 0 })),
      xs: defaultLgLayout.map((item, idx) => ({ ...item, w: 4, x: 0, y: idx * 4 })),
      xxs: defaultLgLayout.map((item, idx) => ({ ...item, w: 2, x: 0, y: idx * 4 })),
    };
  }, []);

  const [layouts, setLayouts] = useState(() => {
    try {
      const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Could not parse saved layout:", e);
    }
    return defaultLayouts;
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layouts));
    } catch (e) {
      console.warn("Failed to save layout:", e);
    }
  }, [layouts]);

  const resetLayout = () => setLayouts(defaultLayouts);

  // WidgetCard component - FIXED VERSION
  const WidgetCard = ({ title, children }) => {
    const ref = useRef(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
      if (!ref.current) return;
      const el = ref.current;
      
      const measure = () => {
        // Get the actual content area dimensions (excluding padding)
        const contentRect = el.getBoundingClientRect();
        setSize({ 
          width: contentRect.width, 
          height: contentRect.height 
        });
      };
      
      measure();
      
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      
      return () => ro.disconnect();
    }, []);

    // Calculate isCompact based on actual content area
    const isCompact = size.width > 0 && size.width < 400;

    const childWithProps = React.isValidElement(children)
      ? React.cloneElement(children, {
          containerWidth: size.width,
          containerHeight: size.height,
          isCompact: isCompact,
        })
      : children;

    return (
      <div
        ref={ref}
        className="h-full w-full bg-white dark:bg-[#141414] rounded-xl shadow-md transition-all duration-200"
      >
        <div
          className={`drag-handle flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 ${isEditMode ? "cursor-move" : "cursor-default"}`}
        >
          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{title}</div>
          <div className="text-xs text-neutral-400">{isEditMode ? "Drag to move" : ""}</div>
        </div>

        <div className="p-4 h-[calc(100%-52px)] overflow-hidden">
          {childWithProps}
        </div>
      </div>
    );
  };

  return (
    <MainLayout username={username} onLogout={onLogout}>
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-950 to-black text-gray-100 px-4 sm:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
              Hello, {username || "User"}!
            </h1>
            <p className="text-sm text-gray-400">Edit layout to drag/resize widgets. When finished, toggle off to lock interactions.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditMode((s) => !s)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isEditMode ? "bg-indigo-600 hover:bg-indigo-500" : "bg-white/5 hover:bg-white/6"}`}
            >
              {isEditMode ? "Exit Edit" : "Edit Layout"}
            </button>

            <button onClick={resetLayout} className="px-3 py-2 rounded-lg text-sm font-medium bg-white/5 hover:bg-white/6">
              Reset Layout
            </button>

            <button title="Quick add" className="hidden lg:inline-flex px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600">
              <Plus size={16} />
            </button>
          </div>
        </div>

        {mounted ? (
          <ResponsiveGridLayout
            className="layout"
            breakpoints={breakpoints}
            cols={cols}
            layouts={layouts}
            rowHeight={30}
            margin={[16, 16]}
            isDraggable={isEditMode}
            isResizable={isEditMode}
            onLayoutChange={(layout, allLayouts) => setLayouts(allLayouts)}
            onBreakpointChange={setCurrentBreakpoint}
            measureBeforeMount={false}
            useCSSTransforms={mounted}
            draggableHandle=".drag-handle"
            compactType="vertical"
            preventCollision={false}
          >
            <div key="prioritization">
              <WidgetCard title="Prioritization Focus">
                <PrioritizationFocus />
              </WidgetCard>
            </div>

            <div key="overview">
              <WidgetCard title="7-Day Overview">
                <SevenDayOverview />
              </WidgetCard>
            </div>

            <div key="today">
              <WidgetCard title="Today's Tasks">
                <TodayTasks />
              </WidgetCard>
            </div>

            <div key="time">
              <WidgetCard title="Total Time Spent">
                <TotalTimeSpend />
              </WidgetCard>
            </div>

            <div key="deadlines">
              <WidgetCard title="Upcoming Deadlines">
                <UpcomingDeadlines />
              </WidgetCard>
            </div>

            <div key="projects">
              <WidgetCard title="Project Progress">
                <ProjectProgress />
              </WidgetCard>
            </div>

            <div key="heatmap">
              <WidgetCard title="Task Heatmap">
                <TaskHeatmap />
              </WidgetCard>
            </div>

            <div key="notes">
              <WidgetCard title="Activity Notes">
                <ActivityNotes />
              </WidgetCard>
            </div>
          </ResponsiveGridLayout>
        ) : (
          <div className="text-gray-400">Loading layout…</div>
        )}

        <button
          className="fixed bottom-6 right-6 flex lg:hidden items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transition-all z-50"
          aria-label="Add new item"
        >
          <Plus size={26} />
        </button>
      </div>
    </MainLayout>
  );
}