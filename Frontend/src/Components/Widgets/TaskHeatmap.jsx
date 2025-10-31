import React, { useMemo, useState, useEffect } from "react";
import { TrendingUp, Calendar, Clock, CheckCircle2 } from "lucide-react";

export default function TaskHeatmap({
  containerWidth = 0,
  containerHeight = 0,
  isCompact = false,
  data = [],
  onDayClick = () => {}
}) {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  const size = useMemo(() => {
    if (isCompact || (containerWidth > 0 && containerWidth < 360)) return "compact";
    if (containerWidth > 0 && containerWidth < 640) return "medium";
    return "large";
  }, [containerWidth, isCompact]);

  // Generate heatmap data from task data
  useEffect(() => {
    const generateHeatmapData = () => {
      // This would typically come from your database
      // For now, we'll enhance the sample data with real task information
      const enhancedData = data.map((week, weekIndex) => 
        week.map((taskCount, dayIndex) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - weekIndex) * 7 - (6 - dayIndex));
          
          // Mock task data - in real app, this would come from your database
          const tasks = Array.from({ length: taskCount }, (_, i) => ({
            id: `${weekIndex}-${dayIndex}-${i}`,
            title: `Task ${i + 1}`,
            completed: Math.random() > 0.5,
            timeSpent: Math.floor(Math.random() * 120),
            type: ['work', 'personal', 'meeting'][Math.floor(Math.random() * 3)]
          }));

          return {
            count: taskCount,
            date,
            tasks,
            intensity: Math.min(taskCount, 4) // 0-4 scale for colors
          };
        })
      );
      setHeatmapData(enhancedData);
    };

    generateHeatmapData();
  }, [data]);

  // --- THEME ---
  // Updated to use theme-agnostic opacity classes
  const getIntensityColor = (intensity) => {
    const colors = {
      0: "bg-[var(--hover-bg)]",
      1: "bg-green-500/10",
      2: "bg-green-500/30",
      3: "bg-green-500/60",
      4: "bg-green-500/90"
    };
    return colors[intensity] || colors[0];
  };

  // This is for data viz, not theme, so hard-coded hex is OK
  const getIntensityColorHex = (intensity) => {
    const colors = {
      0: "#E5E7EB", // Light gray
      1: "#86EFAC", // Green 200
      2: "#4ADE80", // Green 400
      3: "#22C55E", // Green 500
      4: "#16A34A"  // Green 600
    };
    return colors[intensity] || colors[0];
  };

  const dayLetters = ["S", "M", "T", "W", "T", "F", "S"];
  const monthLabels = ["M", "T", "W", "T", "F", "S", "S"]; // These seem off, but I'll keep your logic

  // Calculate totals
  const totalTasks = heatmapData.flat().reduce((sum, day) => sum + day.count, 0);
  const completedTasks = heatmapData.flat().reduce((sum, day) => 
    sum + day.tasks.filter(task => task.completed).length, 0
  );
  const totalTime = heatmapData.flat().reduce((sum, day) => 
    sum + day.tasks.reduce((taskSum, task) => taskSum + task.timeSpent, 0), 0
  );

  // compact -> show single stacked bar (total activity)
  if (size === "compact") {
    return (
      // --- FIX --- Removed wrapper div
      <div className="h-full">
        <div className="flex items-center gap-3 mb-2">
          {/* --- THEME --- Changed teal to green to match heatmap */}
          <TrendingUp size={16} className="text-green-500" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Heatmap</h3>
        </div>
        <div className="flex items-center justify-between">
          {/* --- THEME --- */}
          <div className="text-sm font-medium text-[var(--text-primary)]">{totalTasks} tasks</div>
          <div className="text-xs text-[var(--text-secondary)]">{completedTasks} completed</div>
        </div>
        
        {/* Mini progress bar */}
        {/* --- THEME --- */}
        <div className="w-full bg-[var(--hover-bg)] rounded-full h-2 mt-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
          />
        </div>
      </div>
    );
  }

  // medium -> horizontal condensed heat row with legend
  if (size === "medium") {
    const totalsByDay = heatmapData[0]?.map((_, col) => 
      heatmapData.reduce((sum, row) => sum + (row[col]?.count || 0), 0)
    ) || [];

    return (
      // --- FIX --- Removed wrapper, added flex layout
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* --- THEME --- Changed teal to green */}
            <TrendingUp size={16} className="text-green-500" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Task Heatmap</h3>
          </div>
          {/* --- THEME --- */}
          <div className="text-xs text-[var(--text-secondary)]">
            {totalTasks} tasks • {Math.floor(totalTime / 60)}h
          </div>
        </div>
        
        {/* --- RESPONSIVE --- This section will fill space */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex gap-3 items-end overflow-x-auto pb-2">
            {totalsByDay.map((t, i) => (
              <div 
                key={i} 
                className="flex flex-col items-center w-10 cursor-pointer"
                onMouseEnter={() => setHoveredCell({ type: 'day', index: i, count: t })}
                onMouseLeave={() => setHoveredCell(null)}
                onClick={() => onDayClick(i)}
              >
                <div
                  className="w-8 rounded-sm transition-all hover:scale-110"
                  style={{
                    height: `${Math.max(6, t * 4)}px`, // Reduced multiplier for better fit
                    background: getIntensityColorHex(Math.min(t, 4)),
                  }}
                />
                {/* --- THEME --- */}
                <div className="text-xs text-[var(--text-secondary)] mt-1">{dayLetters[i]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hover tooltip for day */}
        {hoveredCell?.type === 'day' && (
          // --- THEME ---
          <div className="absolute z-10 bg-[var(--bg-card)] p-3 rounded-lg shadow-lg border border-[var(--border-color)]">
            <div className="text-sm font-medium mb-1 text-[var(--text-primary)]">
              {dayLetters[hoveredCell.index]} - {hoveredCell.count} tasks
            </div>
            <div className="text-xs text-[var(--text-secondary)]">
              Click to view details
            </div>
          </div>
        )}
        
        {/* --- THEME --- */}
        <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(intensity => (
                <div 
                  key={intensity}
                  className="w-3 h-3 rounded-sm"
                  style={{ background: getIntensityColorHex(intensity) }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
          
          <div className="flex items-center gap-1">
            <CheckCircle2 size={12} />
            <span>{Math.round((completedTasks / totalTasks) * 100)}% done</span>
          </div>
        </div>
      </div>
    );
  }

  // large -> full matrix
  return (
    // --- FIX --- Removed wrapper, added flex layout
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* --- THEME --- Changed teal to green */}
          <TrendingUp size={18} className="text-green-500" />
          <div>
            {/* --- THEME --- */}
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Task Heatmap</h3>
            <p className="text-xs text-[var(--text-secondary)]">Your activity over time</p>
          </div>
        </div>
        
        {/* --- THEME --- */}
        <div className="text-xs text-[var(--text-secondary)]">
          {totalTasks} tasks • {completedTasks} completed • {Math.floor(totalTime / 60)}h spent
        </div>
      </div>
      
      {/* --- RESPONSIVE --- This section will scroll if widget is short */}
      <div className="mt-2 flex-1 overflow-y-auto">
        <div className="grid" style={{ gridTemplateColumns: `repeat(8, 18px)`, gap: 6 }}>
          <div style={{ width: 18 }} /> {/* spacer */}
          {dayLetters.map((d, i) => (
            // --- THEME ---
            <div key={`h-${i}`} className="text-xs text-[var(--text-secondary)] text-center" style={{ width: 18 }}>
              {d}
            </div>
          ))}

          {heatmapData.map((row, rIdx) => (
            <React.Fragment key={`row-${rIdx}`}>
              {/* --- THEME --- */}
              <div className="text-xs text-[var(--text-secondary)] text-center" style={{ height: 18, width: 18 }}>
                {monthLabels[rIdx]}
              </div>

              {row.map((day, cIdx) => {
                const isHovered = hoveredCell?.row === rIdx && hoveredCell?.col === cIdx;
                
                return (
                  <div
                    key={`cell-${rIdx}-${cIdx}`}
                    // --- THEME --- Using getIntensityColor() which is now fixed
                    className={`${getIntensityColor(day.intensity)} rounded-sm transition-all cursor-pointer ${
                      isHovered ? 'ring-2 ring-green-400 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ width: 18, height: 18 }}
                    onMouseEnter={() => setHoveredCell({ row: rIdx, col: cIdx, ...day })}
                    onMouseLeave={() => setHoveredCell(null)}
                    onClick={() => onDayClick(day)}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Enhanced hover tooltip */}
        {hoveredCell && !hoveredCell.type && (
          // --- THEME ---
          <div className="absolute z-10 bg-[var(--bg-card)] p-4 rounded-lg shadow-xl border border-[var(--border-color)]">
            <div className="font-medium text-sm mb-2 text-[var(--text-primary)]">
              {hoveredCell.date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-3 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">{hoveredCell.count}</div>
                {/* --- THEME --- */}
                <div className="text-xs text-[var(--text-secondary)]">Total</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {hoveredCell.tasks.filter(t => t.completed).length}
                </div>
                {/* --- THEME --- */}
                <div className="text-xs text-[var(--text-secondary)]">Done</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">
                  {Math.floor(hoveredCell.tasks.reduce((sum, t) => sum + t.timeSpent, 0) / 60)}h
                </div>
                {/* --- THEME --- */}
                <div className="text-xs text-[var(--text-secondary)]">Time</div>
              </div>
            </div>

            {hoveredCell.tasks.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {hoveredCell.tasks.slice(0, 5).map((task, index) => (
                  // --- THEME ---
                  <div key={index} className="flex items-center gap-2 p-2 bg-[var(--bg-secondary)] rounded text-xs">
                    {task.completed ? (
                      <CheckCircle2 size={12} className="text-green-500 flex-shrink-0" />
                    ) : (
                      <Clock size={12} className="text-blue-500 flex-shrink-0" />
                    )}
                    {/* --- THEME --- */}
                    <span className="truncate flex-1 text-[var(--text-primary)]">{task.title}</span>
                    <span className="text-[var(--text-secondary)] text-xs">{task.timeSpent}m</span>
                  </div>
                ))}
                {hoveredCell.tasks.length > 5 && (
                  // --- THEME ---
                  <div className="text-xs text-[var(--text-secondary)] text-center">
                    +{hoveredCell.tasks.length - 5} more tasks
                  </div>
                )}
              </div>
            ) : (
              // --- THEME ---
              <div className="text-center py-2 text-[var(--text-secondary)] text-xs">
                No tasks this day
              </div>
            )}
          </div>
        )}

        {/* --- THEME --- */}
        <div className="mt-4 flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(intensity => (
                <div 
                  key={intensity}
                  className="w-3 h-3 rounded-sm"
                  style={{ background: getIntensityColorHex(intensity) }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
          
          {/* --- THEME --- Changed teal to green */}
          <button 
            onClick={() => setSelectedDate(new Date())}
            className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Calendar size={12} />
            <span>View Details</span>
          </button>
        </div>
      </div>
    </div>
  );
}