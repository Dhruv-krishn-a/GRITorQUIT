// src/Components/Taskbar/Taskbar.jsx
import React from 'react';
import { getPriorityClass } from '../../utils';

/**
 * Simple Taskbar placed under page title.
 * Props:
 *  - value, onSearch
 *  - priorityFilter, onPriorityFilter
 *  - sortBy, onSortBy
 *  - onQuickAdd
 */
export default function Taskbar({
  value,
  onSearch,
  priorityFilter,
  onPriorityFilter,
  sortBy,
  onSortBy,
  onQuickAdd
}) {
  return (
    <div className="module-card" style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12 }}>
      <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          placeholder="Quick search tasks..."
          value={value}
          onChange={(e) => onSearch(e.target.value)}
          style={{ padding: 10, borderRadius: 8, flex: 1, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)' }}
        />

        <select value={priorityFilter} onChange={(e) => onPriorityFilter(e.target.value)} style={{ padding: 8, borderRadius: 8 }}>
          <option value="all">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="none">None</option>
        </select>

        <select value={sortBy} onChange={(e) => onSortBy(e.target.value)} style={{ padding: 8, borderRadius: 8 }}>
          <option value="dateAsc">Date ↑</option>
          <option value="dateDesc">Date ↓</option>
          <option value="priority">Priority</option>
          <option value="title">Title</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={onQuickAdd} className="btn-primary">Quick add</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* compact legend for priorities */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="priority-high small-tag" style={{ padding: 6 }}>High</span>
            <span className="priority-medium small-tag" style={{ padding: 6 }}>Medium</span>
            <span className="priority-low small-tag" style={{ padding: 6 }}>Low</span>
          </div>

          {/* simple avatar placeholder */}
          <div style={{ width: 36, height: 36, borderRadius: 999, background: 'linear-gradient(45deg,#6272ff,#b76bff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
            U
          </div>
        </div>
      </div>
    </div>
  );
}
