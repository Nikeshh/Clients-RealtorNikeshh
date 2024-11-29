'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/Button';
import { useLoadingStates } from '@/hooks/useLoadingStates';

interface AddInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  clientId: string;
}

export default function AddInteractionModal({
  isOpen,
  onClose,
  onSubmit,
  clientId,
}: AddInteractionModalProps) {
  const [formData, setFormData] = useState({
    type: 'Call',
    description: '',
    notes: '',
  });
  const { setLoading, isLoading } = useLoadingStates();

  const handleSubmit = async () => {
    setLoading('addInteraction', true);
    try {
      await onSubmit({
        ...formData,
        clientId,
        date: new Date(),
      });
      setFormData({
        type: 'Call',
        description: '',
        notes: '',
      });
      onClose();
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