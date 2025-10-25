import React from 'react';
import {
  Inbox,
  Calendar,
  ChevronRight,
  Folder,
  Tag,
  Plus,
  Filter,
  ArrowUpDown,
} from 'lucide-react';

export default function Toolbar({ onQuickAddClick }) {
  const navItems = [
    { icon: Inbox, label: 'Inbox', active: true },
    { icon: Calendar, label: 'Today' },
    { icon: ChevronRight, label: 'Upcoming' },
    { icon: Folder, label: 'Projects' },
    { icon: Tag, label: 'Labels' },
  ];

  return (
    <div className="flex flex-col md:flex-row justify-between items-center p-4 border-b border-gray-800">
      {/* Left Navigation */}
      <nav className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
              item.active
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            } transition-colors`}
          >
            <item.icon size={16} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Right Actions */}
      <div className="flex items-center space-x-2 mt-2 md:mt-0">
        <button
          onClick={onQuickAddClick}
          className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          <span>Quick add</span>
        </button>
        <button className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors border border-gray-700">
          <Filter size={16} />
          <span>Filter</span>
        </button>
        <button className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors border border-gray-700">
          <ArrowUpDown size={16} />
          <span>Sort</span>
        </button>
      </div>
    </div>
  );
}