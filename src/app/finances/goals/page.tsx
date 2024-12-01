'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast-context';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/Button';
import Modal from '@/components/ui/Modal';
import { Plus, Target, TrendingUp, Calendar } from 'lucide-react';

interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  achieved: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function GoalsPage(): React.ReactElement {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
  });
  const [editingProgress, setEditingProgress] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    setLoading('loadGoals', true);
    try {
      const response = await fetch('/api/finances/goals');
      if (!response.ok) throw new Error('Failed to fetch goals');
      const data = await response.json();
      setGoals(data);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to load goals', 'error');
    } finally {
      setLoading('loadGoals', false);
    }
  };

  const handleAddGoal = async () => {
    setLoading('addGoal', true);
    try {
      const response = await fetch('/api/finances/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newGoal,
          targetAmount: parseFloat(newGoal.targetAmount),
          currentAmount: parseFloat(newGoal.currentAmount) || 0,
        }),
      });

      if (!response.ok) throw new Error('Failed to add goal');

      addToast('Goal added successfully', 'success');
      loadGoals();
      setShowAddModal(false);
      setNewGoal({
        title: '',
        targetAmount: '',
        currentAmount: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to add goal', 'error');
    } finally {
      setLoading('addGoal', false);
    }
  };

  const handleProgressUpdate = async (goalId: string) => {
    const newAmount = parseFloat(editingProgress[goalId]);
    if (isNaN(newAmount)) return;

    setLoading(`updateGoal-${goalId}`, true);
    try {
      const response = await fetch(`/api/finances/goals/${goalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentAmount: newAmount
        }),
      });

      if (!response.ok) throw new Error('Failed to update goal');

      loadGoals();
      addToast('Progress updated successfully', 'success');
      setEditingProgress(prev => {
        const newState = { ...prev };
        delete newState[goalId];
        return newState;
      });
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update progress', 'error');
    } finally {
      setLoading(`updateGoal-${goalId}`, false);
    }
  };

  if (isLoading('loadGoals')) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Financial Goals</h1>
        <Button
          onClick={() => setShowAddModal(true)}
          variant="primary"
        >
          <Plus className="h-5 w-5 mr-1" />
          Add Goal
        </Button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const daysLeft = Math.ceil((new Date(goal.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <div key={goal.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  goal.achieved ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {goal.achieved ? 'Achieved' : `${daysLeft} days left`}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                  <div
                    style={{ width: `${progress}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                  />
                </div>
              </div>

              {/* Update Progress */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Update Progress</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <div className="relative flex items-stretch flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={editingProgress[goal.id] ?? goal.currentAmount}
                      onChange={(e) => setEditingProgress({
                        ...editingProgress,
                        [goal.id]: e.target.value
                      })}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                  <Button
                    className="ml-2"
                    onClick={() => handleProgressUpdate(goal.id)}
                    isLoading={isLoading(`updateGoal-${goal.id}`)}
                    disabled={!editingProgress[goal.id] || editingProgress[goal.id] === goal.currentAmount.toString()}
                  >
                    Save
                  </Button>
                </div>
              </div>

              {/* Dates */}
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <p className="font-medium">Start Date</p>
                  <p>{new Date(goal.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-medium">End Date</p>
                  <p>{new Date(goal.endDate).toLocaleDateString()}</p>
                </div>
              </div>

              {goal.notes && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">{goal.notes}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-12">
          <Target className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No goals</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new financial goal.</p>
          <div className="mt-6">
            <Button
              onClick={() => setShowAddModal(true)}
              variant="primary"
            >
              <Plus className="h-5 w-5 mr-1" />
              Add Goal
            </Button>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewGoal({
            title: '',
            targetAmount: '',
            currentAmount: '',
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            notes: '',
          });
        }}
        title="Add New Goal"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Annual Revenue Target"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Target Amount</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                value={newGoal.targetAmount}
                onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Current Amount</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                value={newGoal.currentAmount}
                onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={newGoal.startDate}
                onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={newGoal.endDate}
                onChange={(e) => setNewGoal({ ...newGoal, endDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={newGoal.notes}
              onChange={(e) => setNewGoal({ ...newGoal, notes: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={() => {
                setShowAddModal(false);
                setNewGoal({
                  title: '',
                  targetAmount: '',
                  currentAmount: '',
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: '',
                  notes: '',
                });
              }}
              variant="secondary"
              disabled={isLoading('addGoal')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddGoal}
              variant="primary"
              isLoading={isLoading('addGoal')}
              disabled={!newGoal.title || !newGoal.targetAmount || !newGoal.endDate}
            >
              Add Goal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 