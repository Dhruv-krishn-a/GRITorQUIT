//Frontend/src/Components/TaskPage/QuickStats.jsx
import React from 'react';
import { Clock, AlertCircle, Calendar, CheckCircle2, List } from 'lucide-react';

export default function QuickStats({ tasks, activeView }) {
  const stats = [
    {
      label: 'All Tasks',
      value: tasks.all?.length || 0,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      borderColor: 'border-blue-400/20',
      icon: List,
      view: 'all'
    },
    {
      label: 'Overdue',
      value: tasks.overdue?.length || 0,
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
      borderColor: 'border-red-400/20',
      icon: AlertCircle,
      view: 'overdue'
    },
    {
      label: 'Today',
      value: tasks.today?.length || 0,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      borderColor: 'border-yellow-400/20',
      icon: Clock,
      view: 'today'
    },
    {
      label: 'Upcoming',
      value: tasks.upcoming?.length || 0,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      borderColor: 'border-green-400/20',
      icon: Calendar,
      view: 'upcoming'
    },
    {
      label: 'Completed',
      value: tasks.completed?.length || 0,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      borderColor: 'border-purple-400/20',
      icon: CheckCircle2,
      view: 'completed'
    }
  ];

  return (
    <div className="flex flex-wrap gap-4 justify-center lg:justify-end">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isActive = activeView === stat.view;
        
        return (
          <div
            key={stat.label}
            className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
              isActive 
                ? `${stat.bgColor} ${stat.borderColor} ring-2 ring-opacity-50 ${stat.color.replace('text-', 'ring-')}`
                : `${stat.bgColor} ${stat.borderColor} hover:${stat.bgColor.replace('10', '20')}`
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon size={20} className={stat.color} />
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-xs text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}