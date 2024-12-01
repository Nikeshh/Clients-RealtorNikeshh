'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from './Button';
import { Plus, Check } from 'lucide-react';
import ChecklistForm from './ChecklistForm';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Props {
  checklist: ChecklistItem[];
  clientId: string;
  requestId?: string;
  requirementId?: string;
  onUpdate: () => void;
}

export default function ChecklistList({ checklist, clientId, requestId, requirementId, onUpdate }: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  const handleToggle = async (itemId: string, completed: boolean) => {
    setLoading(`toggle-${itemId}`, true);
    try {
      let url = '';
      if (requirementId) {
        url = `/api/clients/${clientId}/requests/${requestId}/requirements/${requirementId}/checklist/${itemId}`;
      } else if (requestId) {
        url = `/api/clients/${clientId}/requests/${requestId}/checklist/${itemId}`;
      } else {
        url = `/api/clients/${clientId}/checklist/${itemId}`;
      }

      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });

      if (!response.ok) throw new Error('Failed to update checklist item');
      
      addToast('Checklist item updated', 'success');
      onUpdate();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update checklist item', 'error');
    } finally {
      setLoading(`toggle-${itemId}`, false);
    }
  };

  const handleAdd = async (text: string) => {
    setLoading('addChecklist', true);
    try {
      let url = '';
      if (requirementId) {
        url = `/api/clients/${clientId}/requests/${requestId}/requirements/${requirementId}/checklist`;
      } else if (requestId) {
        url = `/api/clients/${clientId}/requests/${requestId}/checklist`;
      } else {
        url = `/api/clients/${clientId}/checklist`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Failed to add checklist item');
      
      addToast('Checklist item added', 'success');
      setShowAddForm(false);
      onUpdate();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to add checklist item', 'error');
    } finally {
      setLoading('addChecklist', false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">Checklist</h3>
        <Button
          variant="ghost"
          size="small"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Item
        </Button>
      </div>

      {showAddForm && (
        <ChecklistForm
          onSubmit={handleAdd}
          onCancel={() => setShowAddForm(false)}
          isLoading={isLoading('addChecklist')}
        />
      )}

      <div className="space-y-2">
        {checklist.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
          >
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={item.completed}
                onChange={(e) => handleToggle(item.id, e.target.checked)}
                disabled={isLoading(`toggle-${item.id}`)}
              />
              <span className={`text-sm ${item.completed ? 'line-through text-gray-500' : ''}`}>
                {item.text}
              </span>
            </label>
            {isLoading(`toggle-${item.id}`) && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            )}
          </div>
        ))}

        {checklist.length === 0 && !showAddForm && (
          <p className="text-sm text-gray-500 text-center py-2">
            No items yet. Add your first checklist item.
          </p>
        )}
      </div>
    </div>
  );
} 