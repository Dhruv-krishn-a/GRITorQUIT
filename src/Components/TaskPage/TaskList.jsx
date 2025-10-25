import React from 'react';
import TaskItem from './TaskItem';

export default function TaskList({ tasks }) {
  const formatTitle = (title) => {
    return title.charAt(0).toUpperCase() + title.slice(1);
  };

  return (
    <div className="space-y-6">
      {Object.entries(tasks).map(([groupTitle, taskList]) => (
        <section key={groupTitle}>
          <h2 className="text-lg font-semibold text-white mb-3">
            {formatTitle(groupTitle)}{' '}
            <span className="text-sm font-normal text-gray-500">
              ({taskList.length})
            </span>
          </h2>
          <div className="space-y-2">
            {taskList.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}