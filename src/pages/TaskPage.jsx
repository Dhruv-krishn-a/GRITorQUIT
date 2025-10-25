import React, { useState } from 'react';
import MainLayout from '../MainLayout';
import Toolbar from '../Components/TaskPage/Toolbar';
import TaskList from '../Components/TaskPage/TaskList';
import AddTaskModal from '../Components/TaskPage/AddTaskModal';
import Fab from '../Components/TaskPage/Fab';
import QuickStats from '../Components/TaskPage/QuickStats';

const tasksData = {
  overdue: [
    {
      id: 1,
      title: 'Prepare slides for the weekly sprint demo',
      date: 'Oct 23',
      priority: 'Medium',
      tags: ['#presentation', '#sprint'],
      progress: null,
    },
    {
      id: 2,
      title: 'Review pull request from junior developer',
      date: 'Oct 24',
      priority: 'Low',
      tags: ['#code-review', '#management'],
      progress: null,
    },
  ],
  today: [
    {
      id: 3,
      title: 'Design the new landing page hero section',
      date: 'Oct 25',
      priority: 'High',
      tags: ['#design', '#website'],
      progress: { current: 1, total: 3 },
    },
    {
      id: 4,
      title: 'Fix bug #1024 - Button alignment on mobile',
      date: 'Oct 25',
      priority: 'High',
      tags: ['#bugfix', '#css'],
      progress: null,
    },
    {
      id: 5,
      title: 'User research interviews',
      date: 'Oct 26',
      priority: 'High',
      tags: ['#research', '#ux'],
      progress: null,
    },
  ],
  upcoming: [
    {
      id: 6,
      title: 'Develop the authentication API endpoint',
      date: 'Oct 28',
      priority: 'High',
      tags: ['#development', '#backend'],
      progress: null,
    },
  ],
};

// Add username and onLogout props
export default function TaskPage({ username, onLogout }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks] = useState(tasksData);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    // Pass username and onLogout to MainLayout
    <MainLayout username={username} onLogout={onLogout}>
      <div className="flex justify-center min-h-screen bg-gray-950 text-gray-200 p-4 md:p-8">
        <div className="w-full max-w-4xl">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-white">Tasks</h1>
            <p className="text-gray-400">Manage your work and life.</p>
          </header>

          {/* Quick Stats Component */}
          <QuickStats tasks={tasks} />

          {/* Main Task Area */}
          <div className="bg-gray-900 rounded-lg shadow-xl border border-gray-800">
            <Toolbar onQuickAddClick={openModal} />
            <div className="p-4 md:p-6">
              <TaskList tasks={tasks} />
            </div>
          </div>
        </div>

        {/* Add Task Modal */}
        <AddTaskModal isOpen={isModalOpen} onClose={closeModal} />

        {/* Floating Action Button */}
        <Fab onClick={openModal} />
      </div>
    </MainLayout>
  );
}