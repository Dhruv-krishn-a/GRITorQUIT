import { Search, Bell, Sun, Moon, Plus } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Header({ username, onLogout }) {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "dark";
    }
    return "dark";
  });

  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogoutClick = () => {
    if (onLogout) onLogout();      // clears token and username
    navigate("/login");            // instant redirect to login
  };

  return (
    <header className="
      flex items-center justify-between 
      px-6 py-4 
      bg-white dark:bg-[#121212] 
      border-b border-neutral-200 dark:border-neutral-800
      transition-colors duration-300 ease-in-out
    ">
      {/* Left Section: Title */}
      <div className="flex items-center gap-3">
        <h2 className="
          text-xl font-semibold 
          text-neutral-900 dark:text-white 
          transition-colors duration-300 ease-in-out
        ">
          Dashboard
        </h2>
      </div>

      {/* Center: Search Bar */}
      <div className="
        flex items-center 
        group
        bg-neutral-100 dark:bg-[#1f1f1f] 
        rounded-lg 
        px-3 py-2 
        w-1/3
        transition-all duration-300 ease-in-out
        focus-within:ring-2 focus-within:ring-blue-500
        focus-within:bg-white dark:focus-within:bg-[#222]
      ">
        <Search
          size={18}
          className="
            text-gray-500 dark:text-gray-400 
            transition-colors duration-300 
            group-hover:text-blue-500
          "
        />
        <input
          type="text"
          placeholder="Search tasks..."
          className="
            bg-transparent 
            text-sm text-neutral-900 dark:text-gray-300 
            ml-2 w-full 
            outline-none 
            placeholder-gray-500
            transition-colors duration-300
          "
        />
      </div>

      {/* Right Section: Actions & Profile */}
      <div className="flex items-center gap-4">
        
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="
            p-2 rounded-full 
            bg-neutral-100 hover:bg-neutral-200 
            dark:bg-[#1f1f1f] dark:hover:bg-[#2a2a2a] 
            transition-all duration-300 ease-in-out
            transform hover:scale-110
          "
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun
              size={18}
              className="
                text-yellow-400 
                transition-all duration-300 transform 
                hover:rotate-45
              "
            />
          ) : (
            <Moon
              size={18}
              className="
                text-blue-400 
                transition-all duration-300 transform 
                hover:-rotate-45
              "
            />
          )}
        </button>

        {/* Notifications Button */}
        <button
          className="
            p-2 rounded-full
            group
            bg-neutral-100 hover:bg-neutral-200 
            dark:bg-[#1f1f1f] dark:hover:bg-[#2a2a2a] 
            transition-all duration-300 ease-in-out
            transform hover:scale-110
          "
          aria-label="View notifications"
        >
          <Bell
            size={18}
            className="
              text-gray-600 dark:text-gray-300 
              transition-colors duration-300 
              group-hover:text-blue-500
            "
          />
        </button>

        {/* Add New Task Button */}
        <button className="
          flex items-center gap-2 
          bg-blue-600 hover:bg-blue-500 
          text-white 
          px-4 py-2 
          rounded-lg 
          text-sm font-medium 
          transition-all duration-300 ease-in-out
          transform hover:-translate-y-0.5
          hover:shadow-lg hover:shadow-blue-500/40
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
              dark:from-gray-600 dark:to-gray-800 
              flex items-center justify-center 
              text-sm font-medium text-neutral-800 dark:text-white
              cursor-pointer
              transform transition-all duration-300 
              hover:scale-110 hover:shadow-md
            "
          >
            {username ? username.charAt(0).toUpperCase() : "U"}
          </div>

          {profileOpen && (
            <div className="
              absolute right-0 mt-2 w-40 bg-white dark:bg-[#1f1f1f] 
              rounded-lg shadow-lg py-2 z-50
              transition-all duration-200 ease-out
            ">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                onClick={() => alert("Go to Profile")}
              >
                Profile
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                onClick={handleLogoutClick}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
