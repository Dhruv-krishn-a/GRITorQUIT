// src/pages/PlanningPage.jsx
import React, { useState, useEffect } from 'react';
import MainLayout from '../MainLayout';
import PlanCard from '../Components/Planning/PlanCard';
import CreatePlanModal from '../Components/Planning/CreatePlanModal';
import ImportExcelModal from '../Components/Planning/ImportExcelModal';
import ProgressOverview from '../Components/Planning/ProgressOverview';
import WeekCarousel from '../Components/Planning/WeekCarousel';
import TimelineView from '../Components/Planning/TimelineView';
import Button from '../Components/ui/Button';
import { plansAPI } from '../Components/services/api';

const PlanningPage = ({ username, onLogout }) => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('PlanningPage mounted, token =', localStorage.getItem('token'));
    loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      setError('');
      const plansData = await plansAPI.getAll();

      // Ensure we only set an array
      if (Array.isArray(plansData)) {
        setPlans(plansData);
      } else {
        console.warn('plansAPI.getAll returned non-array:', plansData);
        setPlans([]);
        setError('Unexpected response when loading plans.');
      }
    } catch (err) {
      console.error('loadPlans error:', err);
      // If backend returned 401, force logout so app can redirect to login
      if (err && err.status === 401) {
        setError('Unauthorized. Please login again.');
        setPlans([]);
        if (typeof onLogout === 'function') {
          onLogout();
        }
      } else {
        setError('Failed to load plans: ' + (err.message || err));
        setPlans([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlan = async (planData) => {
    try {
      const newPlan = await plansAPI.create(planData);
      setPlans(prev => [newPlan, ...prev]);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('handleCreatePlan error:', err);
      setError('Failed to create plan: ' + (err.message || err));
    }
  };

  const handleImportPlan = (importedPlan) => {
    setPlans(prev => [importedPlan, ...prev]);
  };

  const handleViewPlan = (plan) => {
    setSelectedPlan(plan);
    setTasks(plan.tasks || []);
  };

  const handleBackToPlans = () => {
    setSelectedPlan(null);
    setTasks([]);
  };

  const handleTaskToggle = async (taskId) => {
    if (!selectedPlan) return;
    try {
      const task = tasks.find(t => (t._id || t.id) === taskId);
      if (!task) return;

      const updatedTask = {
        ...task,
        completed: !task.completed,
        status: !task.completed ? 'Completed' : 'Not Started'
      };

      const updatedPlan = await plansAPI.updateTask(
        selectedPlan._id || selectedPlan.id,
        taskId,
        updatedTask
      );

      setSelectedPlan(updatedPlan);
      setTasks(updatedPlan.tasks || []);
    } catch (err) {
      console.error('handleTaskToggle error:', err);
      setError('Failed to update task: ' + (err.message || err));
    }
  };

  const handleSubtaskToggle = async (taskId, subtaskId) => {
    if (!selectedPlan) return;
    try {
      const task = tasks.find(t => (t._id || t.id) === taskId);
      if (!task || !task.subtasks) return;

      const subtaskIndex = task.subtasks.findIndex(st => (st._id || st.id) === subtaskId);
      if (subtaskIndex === -1) return;

      const updatedSubtasks = [...task.subtasks];
      updatedSubtasks[subtaskIndex] = {
        ...updatedSubtasks[subtaskIndex],
        completed: !updatedSubtasks[subtaskIndex].completed
      };

      const updatedTask = {
        ...task,
        subtasks: updatedSubtasks
      };

      const updatedPlan = await plansAPI.updateTask(
        selectedPlan._id || selectedPlan.id,
        taskId,
        updatedTask
      );

      setSelectedPlan(updatedPlan);
      setTasks(updatedPlan.tasks || []);
    } catch (err) {
      console.error('handleSubtaskToggle error:', err);
      setError('Failed to update subtask: ' + (err.message || err));
    }
  };

  return (
    <MainLayout username={username} onLogout={onLogout}>
      <div className="min-h-screen bg-gray-900 text-white p-6">
        {selectedPlan ? (
          <div className="max-w-7xl mx-auto space-y-6">
            <button
              onClick={handleBackToPlans}
              className="text-gray-400 hover:text-white transition-colors mb-4 flex items-center space-x-2"
            >
              <span>←</span>
              <span>Back to Plans</span>
            </button>

            <ProgressOverview plan={selectedPlan} />
            <WeekCarousel
              tasks={tasks}
              onTaskToggle={handleTaskToggle}
              onSubtaskToggle={handleSubtaskToggle}
            />
            <TimelineView
              tasks={tasks}
              startDate={selectedPlan.startDate}
              endDate={selectedPlan.endDate}
              onTaskToggle={handleTaskToggle}
            />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold">Your Plans</h1>
                <p className="text-gray-400 mt-2">Create, manage, and track your long-term goals</p>
              </div>
              <div className="flex space-x-4">
                <Button variant="secondary" onClick={() => setIsImportModalOpen(true)}>
                  Import from Excel
                </Button>
                <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                  New Plan
                </Button>
              </div>
            </div>

            {error && (
              <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
                {error}
                <button onClick={() => setError('')} className="float-right text-red-300 hover:text-white">
                  ✕
                </button>
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-16">
                <div className="text-gray-500 text-lg">Loading plans...</div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.isArray(plans) && plans.length > 0 ? (
                    plans.map(plan => (
                      <PlanCard key={plan._id || plan.id} plan={plan} onView={handleViewPlan} />
                    ))
                  ) : (
                    <div className="col-span-full text-center text-gray-400 py-6">
                      {isLoading ? null : 'No plans to show.'}
                    </div>
                  )}
                </div>

                {Array.isArray(plans) && plans.length === 0 && (
                  <div className="text-center py-16">
                    <div className="text-gray-500 text-lg mb-4">No plans created yet</div>
                    <div className="flex justify-center space-x-4">
                      <Button variant="secondary" onClick={() => setIsImportModalOpen(true)}>
                        Import from Excel
                      </Button>
                      <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                        Create Your First Plan
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            <CreatePlanModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onCreate={handleCreatePlan}
            />

            <ImportExcelModal
              isOpen={isImportModalOpen}
              onClose={() => setIsImportModalOpen(false)}
              onImport={handleImportPlan}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PlanningPage;
