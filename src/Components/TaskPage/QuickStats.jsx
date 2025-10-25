import React from 'react';

export default function QuickStats({ tasks }) {
  const overdueCount = tasks.overdue?.length || 0;
  const todayCount = tasks.today?.length || 0;
  const upcomingCount = tasks.upcoming?.length || 0;

  const stats = [
    { label: 'Overdue', value: overdueCount, color: 'text-red-400' },
    { label: 'Today', value: todayCount, color: 'text-blue-400' },
    { label: 'Upcoming', value: upcomingCount, color: 'text-gray-400' },
  ];

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-gray-900 p-4 rounded-lg border border-gray-800 shadow-lg"
          >
            <p className="text-sm font-medium text-gray-400">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}