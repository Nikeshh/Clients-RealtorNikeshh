'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from '@/components/Button';

interface Props {
  clientId: string;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function AddChecklistItemForm({ clientId, onSubmit, onCancel }: Props) {
  const [text, setText] = useState('');
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      addToast('Please enter a checklist item', 'error');
      return;
    }

    setLoading('addChecklistItem', true);
    try {
      const response = await fetch(`/api/clients/${clientId}/checklist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Failed to add checklist item');

      addToast('Checklist item added successfully', 'success');
      onSubmit();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to add checklist item', 'error');
    } finally {
      setLoading('addChecklistItem', false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Checklist Item
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Enter checklist item..."
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button
          onClick={onCancel}
          variant="secondary"
          disabled={isLoading('addChecklistItem')}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading('addChecklistItem')}
        >
          Add Item
        </Button>
      </div>
    </form>
  );
} 