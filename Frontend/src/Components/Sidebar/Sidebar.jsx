import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart3,
  Settings,
  ChevronsLeft,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

/**
 * Renders a single navigation item.
 */
function NavItem({ item, collapsed }) {
  const { icon, name, path } = item;
  return (
    <NavLink
      to={path}
      className={({ isActive }) => `
        relative group flex items-center gap-3 px-3 py-2.5 rounded-lg
        transition-all duration-200 ease-in-out
        ${
          isActive
            ? "bg-[color-mix(in_srgb,var(--accent-color)_10%_transparent)] text-[var(--accent-color)] border border-[color-mix(in_srgb,var(--accent-color)_20%_transparent)]"
            : "text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]"
        }
      `}
    >
      {/* Icon */}
      <div className="flex-shrink-0">{icon}</div>

      {/* Text - hidden when collapsed */}
      <span
        className={`
          overflow-hidden whitespace-nowrap
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-0 opacity-0" : "w-full opacity-100"}
        `}
      >
        {name}
      </span>

      {/* Tooltip - appears on hover when collapsed */}
      {collapsed && (
        <span
          className="
            absolute left-full ml-4 px-3 py-1.5 rounded-md
            bg-[var(--bg-card)] text-[var(--text-primary)]
            text-sm font-medium
            shadow-lg border border-[var(--border-color)]
            opacity-0 group-hover:opacity-100
            translate-x-[-10px] group-hover:translate-x-0
            transition-all duration-300 ease-in-out
            pointer-events-none
            z-50
            whitespace-nowrap
          "
        >
          {name}
        </span>
      )}
    </NavLink>
  );
}

/**
 * The main Sidebar component.
 */
export default function Sidebar({ username, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);

  // Fixed navItems array - consistent structure
  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { 
      name: "Tasks", 
      path: "/tasks", 
      icon: <CheckSquare size={20} /> 
    },
    { 
      name: "Planner", 
      path: "/planner", 
      icon: <Calendar size={20} />
    },
    { 
      name: "Analytics", 
      path: "/analytics", 
      icon: <BarChart3 size={20} />
    },
  ];

  return (
    <aside
      className={`
        relative h-screen 
        flex flex-col
        bg-[var(--bg-secondary)] 
        border-r border-[var(--border-color)]
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="
          absolute -right-3 top-1/2 -translate-y-1/2 z-10
          flex items-center justify-center
          w-6 h-6 rounded-full
          bg-[var(--bg-card)] 
          border border-[var(--border-color)]
          shadow-md
          text-[var(--text-secondary)]
          hover:bg-[var(--hover-bg)]
          transition-all
        "
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronsLeft
          size={16}
          className={`
            transition-transform duration-300 ease-in-out
            ${collapsed && "rotate-180"}
          `}
        />
      </button>

      {/* Logo Section */}
      <div className="flex items-center h-[69px] px-6 border-b border-[var(--border-color)]">
        <div
          className={`
            flex items-center gap-2
            font-bold text-lg 
            text-[var(--text-primary)]
            overflow-hidden
          `}
        >
          <span className="text-[var(--accent-color)]">❖</span>
          <span
            className={`
              whitespace-nowrap
              transition-all duration-300
              ${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}
            `}
          >
            GRITorQUIT
          </span>
        </div>
      </div>

      {/* Nav Items - FIXED: Added key prop */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.name} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* User Section & Logout */}
      <div className="p-4 border-t border-[var(--border-color)] space-y-2">
        {/* User Info */}
        <div className={`
          flex items-center gap-3 px-3 py-2 rounded-lg
          transition-all duration-300
          ${collapsed ? "justify-center" : ""}
        `}>
          <div className="w-8 h-8 bg-gradient-to-r from-[var(--accent-color)] to-[color-mix(in_srgb,var(--accent-color)_70%_purple)] rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
            {username ? username.charAt(0).toUpperCase() : 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {username || 'User'}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Welcome back!
              </p>
            </div>
          )}
        </div>

        {/* Settings */}
        <NavItem
          item={{
            name: "Settings",
            path: "/settings",
            icon: <Settings size={20} />,
          }}
          collapsed={collapsed}
        />

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className={`
            relative group flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
            transition-all duration-200 ease-in-out
            text-[var(--text-secondary)] 
            hover:bg-[color-mix(in_srgb,red_10%_transparent)] hover:text-red-600 
            dark:hover:bg-[color-mix(in_srgb,red_20%_transparent)]
          `}
        >
          <div className="flex-shrink-0">
            <LogOut size={20} />
          </div>
          <span
            className={`
              overflow-hidden whitespace-nowrap
              transition-all duration-300 ease-in-out
              ${collapsed ? "w-0 opacity-0" : "w-full opacity-100"}
            `}
          >
            Logout
          </span>

          {/* Tooltip for collapsed state */}
          {collapsed && (
            <span
              className="
                absolute left-full ml-4 px-3 py-1.5 rounded-md
                bg-[var(--bg-card)] text-[var(--text-primary)]
                text-sm font-medium
                shadow-lg border border-[var(--border-color)]
                opacity-0 group-hover:opacity-100
                translate-x-[-10px] group-hover:translate-x-0
                transition-all duration-300 ease-in-out
                pointer-events-none
                z-50
                whitespace-nowrap
              "
            >
              Logout
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
