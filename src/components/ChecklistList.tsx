'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from '@/components/Button';
import { CheckCircle, Circle } from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Props {
  checklist: ChecklistItem[];
  stageId: string;
  onUpdate: () => void;
}

export default function ChecklistList({ checklist, stageId, onUpdate }: Props) {
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  const toggleChecklistItem = async (itemId: string, completed: boolean) => {
    setLoading(`updateChecklist-${itemId}`, true);
    try {
      const response = await fetch(`/api/clients/${stageId}/checklist/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed }),
      });

      if (!response.ok) throw new Error('Failed to update checklist item');

      addToast('Checklist item updated successfully', 'success');
      onUpdate();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update checklist item', 'error');
    } finally {
      setLoading(`updateChecklist-${itemId}`, false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Checklist</h3>
      
      <div className="space-y-3">
        {checklist.map((item) => (
          <div 
            key={item.id}
            className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50"
          >
            <button
              onClick={() => toggleChecklistItem(item.id, !item.completed)}
              disabled={isLoading(`updateChecklist-${item.id}`)}
              className={`flex-shrink-0 h-5 w-5 rounded-full border ${
                item.completed 
                  ? 'border-green-500 text-green-500' 
                  : 'border-gray-300 text-transparent'
              } hover:border-green-500 transition-colors`}
            >
              {item.completed ? (
                <CheckCircle className="h-full w-full" />
              ) : (
                <Circle className="h-full w-full" />
              )}
            </button>
            <span className={`flex-1 text-sm ${
              item.completed ? 'text-gray-500 line-through' : 'text-gray-900'
            }`}>
              {item.text}
            </span>
          </div>
        ))}

        {checklist.length === 0 && (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No checklist items found</p>
          </div>
        )}
      </div>
    </div>
  );
} 