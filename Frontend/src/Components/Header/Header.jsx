// src/Components/Header/Header.jsx
import { Search, Bell, Plus, Palette } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme"; // Import the hook

// Define available themes
const themes = [
  { id: 'noir', name: 'Noir', icon: '🌙' },
  { id: 'purewhite', name: 'Pure White', icon: '☀️' },
  { id: 'sunset', name: 'Sunset', icon: '🌅' },
  { id: 'ocean', name: 'Ocean', icon: '🌊' },
  { id: 'forest', name: 'Forest', icon: '🌲' }
];

export default function Header({ username, onLogout }) {
  const navigate = useNavigate();
  const { currentTheme, changeTheme } = useTheme(); // Use the theme hook
  
  const [themeOpen, setThemeOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const themeDropdownRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target)) {
        setThemeOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleThemeChange = (themeId) => {
    changeTheme(themeId);
    setThemeOpen(false);
  };

  const handleLogoutClick = () => {
    if (onLogout) onLogout();
    navigate("/login");
  };

  return (
    <header className="
      flex items-center justify-between 
      px-6 py-4 
      bg-[var(--bg-secondary)] 
      border-b border-[var(--border-color)]
      transition-colors duration-300 ease-in-out
    ">
      {/* Left Section: Title */}
      <div className="flex items-center gap-3">
        <h2 className="
          text-xl font-semibold 
          text-[var(--text-primary)]
          transition-colors duration-300 ease-in-out
        ">
          Dashboard
        </h2>
      </div>

      {/* Center: Search Bar */}
      <div className="
        flex items-center 
        group
        bg-[var(--hover-bg)] 
        rounded-lg 
        px-3 py-2 
        w-1/3
        transition-all duration-300 ease-in-out
        focus-within:ring-2 focus-within:ring-[var(--accent-color)]
        focus-within:bg-[var(--bg-card)]
      ">
        <Search
          size={18}
          className="
            text-[var(--text-secondary)]
            transition-colors duration-300 
            group-hover:text-[var(--accent-color)]
          "
        />
        <input
          type="text"
          placeholder="Search tasks..."
          className="
            bg-transparent 
            text-sm text-[var(--text-primary)]
            ml-2 w-full 
            outline-none 
            placeholder-[var(--text-secondary)]
            transition-colors duration-300
          "
        />
      </div>

      {/* Right Section: Actions & Profile */}
      <div className="flex items-center gap-4">
        
        {/* Theme Selector */}
        <div className="relative" ref={themeDropdownRef}>
          <button
            onClick={() => setThemeOpen(!themeOpen)}
            className="
              p-2 rounded-full 
              bg-[var(--hover-bg)] 
              transition-all duration-300 ease-in-out
              transform hover:scale-110
              border border-[var(--border-color)]
            "
            aria-label="Change theme"
          >
            <Palette
              size={18}
              className="
                text-[var(--text-secondary)]
                transition-colors duration-300 
              "
            />
          </button>

          {themeOpen && (
            <div className="
              absolute right-0 mt-2 w-48 bg-[var(--bg-card)] 
              rounded-lg shadow-lg py-2 z-50 border border-[var(--border-color)]
              transition-all duration-200 ease-out
            ">
              <div className="px-3 py-2 text-xs font-medium text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                SELECT THEME
              </div>
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`
                    flex items-center gap-3 w-full text-left px-4 py-2 text-sm
                    transition-colors duration-200
                    ${currentTheme === theme.id 
                      ? 'bg-[color-mix(in_srgb,var(--accent-color)_10%_transparent)] text-[var(--accent-color)]' 
                      : 'hover:bg-[var(--hover-bg)] text-[var(--text-primary)]'
                    }
                  `}
                >
                  <span className="text-base">{theme.icon}</span>
                  {theme.name}
                  {currentTheme === theme.id && (
                    <span className="ml-auto text-[var(--accent-color)]">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Button */}
        <button
          className="
            p-2 rounded-full
            group
            bg-[var(--hover-bg)] 
            transition-all duration-300 ease-in-out
            transform hover:scale-110
            border border-[var(--border-color)]
          "
          aria-label="View notifications"
        >
          <Bell
            size={18}
            className="
              text-[var(--text-secondary)]
              transition-colors duration-300 
              group-hover:text-[var(--accent-color)]
            "
          />
        </button>

        {/* Add New Task Button */}
        <button className="
          flex items-center gap-2 
          bg-[var(--accent-color)] hover:bg-[color-mix(in_srgb,var(--accent-color)_80%_black)]
          text-white 
          px-4 py-2 
          rounded-lg 
          text-sm font-medium 
          transition-all duration-300 ease-in-out
          transform hover:-translate-y-0.5
          hover:shadow-lg
          flex-shrink-0
        ">
          <Plus size={16} />
          New Task
        </button>

        {/* Profile Avatar & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setProfileOpen(!profileOpen)}
            className="
              w-9 h-9 
              rounded-full 
              bg-gradient-to-br from-gray-300 to-gray-400 
              flex items-center justify-center 
              text-sm font-medium text-[var(--text-primary)]
              cursor-pointer
              transform transition-all duration-300 
              hover:scale-110 hover:shadow-md
            "
          >
            {username ? username.charAt(0).toUpperCase() : "U"}
          </div>

          {profileOpen && (
            <div className="
              absolute right-0 mt-2 w-40 bg-[var(--bg-card)] 
              rounded-lg shadow-lg py-2 z-50 border border-[var(--border-color)]
              transition-all duration-200 ease-out
            ">
              <button
                className="block w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--hover-bg)]"
                onClick={() => alert("Go to Profile")}
              >
                Profile
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--hover-bg)]"
                onClick={handleLogoutClick}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="absolute top-4 left-4 p-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded text-xs">
  <div>Theme: {currentTheme}</div>
  <div>BG: <span className="w-3 h-3 inline-block bg-[var(--bg-primary)] border"></span></div>
  <div>Text: <span className="text-[var(--text-primary)]">Sample</span></div>
</div>
    </header>
  );
}