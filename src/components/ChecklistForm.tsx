'use client';

import React, { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from '@/components/Button';

interface Props {
  stageId: string;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function ChecklistForm({ stageId, onSubmit, onCancel }: Props) {
  const [text, setText] = useState('');
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('submitChecklist', true);

    try {
      const response = await fetch(`/api/clients/${stageId}/stages/${stageId}/checklist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Failed to create checklist item');

      addToast('Checklist item created successfully', 'success');
      onSubmit();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to create checklist item', 'error');
    } finally {
      setLoading('submitChecklist', false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Item Text</label>
        <textarea
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button
          onClick={onCancel}
          variant="secondary"
          disabled={isLoading('submitChecklist')}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading('submitChecklist')}
        >
          Add Item
        </Button>
      </div>
    </form>
  );
} 