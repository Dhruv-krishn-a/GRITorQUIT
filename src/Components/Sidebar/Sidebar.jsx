import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart2,
  Settings,
  ChevronsLeft,
  LogOut, // Add LogOut icon
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
            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-200"
            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100"
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
            bg-white dark:bg-neutral-800
            text-neutral-900 dark:text-neutral-100
            text-sm font-medium
            shadow-lg
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
 * Now accepts username and onLogout props
 */
export default function Sidebar({ username, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { name: "Tasks", path: "/tasks", icon: <CheckSquare size={20} /> },
    { name: "Planner", path: "/planner", icon: <Calendar size={20} /> },
    { name: "Analytics", path: "/analytics", icon: <BarChart2 size={20} /> },
  ];

  return (
    <aside
      className={`
        relative h-screen 
        flex flex-col
        bg-white dark:bg-[#121212] 
        border-r border-neutral-200 dark:border-neutral-800
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
          bg-white dark:bg-neutral-800
          border border-neutral-200 dark:border-neutral-700
          shadow-md
          text-neutral-500 dark:text-neutral-400
          hover:bg-neutral-100 dark:hover:bg-neutral-700
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
      <div className="flex items-center h-[69px] px-6 border-b border-neutral-200 dark:border-neutral-800">
        <div
          className={`
            flex items-center gap-2
            font-bold text-lg 
            text-neutral-900 dark:text-white
            overflow-hidden
          `}
        >
          <span className="text-blue-500">❖</span>
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

      {/* Nav Items */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.name} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* User Section & Logout */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
        {/* User Info */}
        <div className={`
          flex items-center gap-3 px-3 py-2 rounded-lg
          transition-all duration-300
          ${collapsed ? "justify-center" : ""}
        `}>
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
            {username ? username.charAt(0).toUpperCase() : 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                {username || 'User'}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
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
            text-neutral-600 dark:text-neutral-400 
            hover:bg-red-50 hover:text-red-600 
            dark:hover:bg-red-900/20 dark:hover:text-red-200
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
                bg-white dark:bg-neutral-800
                text-neutral-900 dark:text-neutral-100
                text-sm font-medium
                shadow-lg
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