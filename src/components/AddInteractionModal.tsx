'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/Button';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import { useToast } from '@/components/ui/toast-context';

interface AddInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  onSubmit?: () => void;
}

export default function AddInteractionModal({
  isOpen,
  onClose,
  clientId,
  onSubmit,
}: AddInteractionModalProps) {
  const [formData, setFormData] = useState({
    type: 'Call',
    description: '',
    notes: '',
  });
  const { setLoading, isLoading } = useLoadingStates();
  const { addToast } = useToast();

  const handleSubmit = async () => {
    setLoading('addInteraction', true);
    try {
      const response = await fetch(`/api/clients/${clientId}/interactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          date: new Date(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add interaction');
      }

      addToast('Interaction added successfully', 'success');
      onClose();
      onSubmit?.();
      
      // Reset form
      setFormData({
        type: 'Call',
        description: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to add interaction', 'error');
    } finally {
      setLoading('addInteraction', false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Interaction">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="Call">Call</option>
            <option value="Email">Email</option>
            <option value="Meeting">Meeting</option>
            <option value="Property Viewing">Property Viewing</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <input
            type="text"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading('addInteraction')}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading('addInteraction')}
          >
            Add Interaction
          </Button>
        </div>
      </div>
    </Modal>
  );
} 