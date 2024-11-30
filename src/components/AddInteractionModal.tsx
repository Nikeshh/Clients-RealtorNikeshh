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

export default function AddInteractionModal({ clientId, onSubmit, onCancel }: Props) {
  const [formData, setFormData] = useState({
    type: 'CALL',
    description: '',
    notes: '',
  });

  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description) {
      addToast('Please enter a description', 'error');
      return;
    }

    setLoading('addInteraction', true);
    try {
      const response = await fetch(`/api/clients/${clientId}/interactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to add interaction');

      addToast('Interaction added successfully', 'success');
      onSubmit();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to add interaction', 'error');
    } finally {
      setLoading('addInteraction', false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Type
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="CALL">Call</option>
          <option value="EMAIL">Email</option>
          <option value="MEETING">Meeting</option>
          <option value="NOTE">Note</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Enter interaction description..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Notes (Optional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Enter any additional notes..."
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button
          onClick={onCancel}
          variant="secondary"
          disabled={isLoading('addInteraction')}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading('addInteraction')}
        >
          Add Interaction
        </Button>
      </div>
    </form>
  );
} 