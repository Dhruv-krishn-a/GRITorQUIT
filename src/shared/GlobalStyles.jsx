// src/shared/GlobalStyles.jsx
import React from 'react';

export default function GlobalStyles() {
  return (
    <style>{`
      :root{
        --bg-color:#121212;
        --card-color:#1E1E1E;
        --border-color:#2a2a2a;
        --text-primary:#FFFFFF;
        --text-secondary:#AAAAAA;
        --accent-primary:#2979FF;
        --accent-primary-hover:#1a63d8;
        --accent-secondary:#333333;
        --radius:12px;
      }
      body { background: var(--bg-color); color:var(--text-primary); font-family: Inter, system-ui, Arial; }
      .container { max-width:1200px; margin:0 auto; }
      .btn-primary { background:var(--accent-primary); color:var(--bg-color); border:none; padding:8px 12px; border-radius:8px; cursor:pointer; }
      .btn-ghost { background:transparent; color:var(--text-secondary); border:1px solid var(--border-color); padding:6px 10px; border-radius:8px; cursor:pointer; }
      .module-card { background:var(--card-color); border:1px solid var(--border-color); padding:16px; border-radius:var(--radius); }
      input, select, textarea { background: transparent; color:var(--text-primary); border:1px solid var(--border-color); padding:8px; border-radius:8px; }
      .priority-high { color:#FF7B7B; }
      .priority-medium { color:#FFD17B; }
      .priority-low { color:#7BFFC1; }
      .small-tag { font-size:12px; background:var(--accent-secondary); padding:4px 8px; border-radius:999px; }
    `}</style>
  );
}
