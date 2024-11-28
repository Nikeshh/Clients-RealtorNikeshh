'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/Button';

interface AddInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { type: string; description: string }) => Promise<void>;
  clientName: string;
}

export default function AddInteractionModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  clientName 
}: AddInteractionModalProps) {
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({ type, description });
      setType('');
      setDescription('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Interaction - ${clientName}`}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select type</option>
            <option value="Call">Call</option>
            <option value="Email">Email</option>
            <option value="Meeting">Meeting</option>
            <option value="Property Viewing">Property Viewing</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!type || !description}
            isLoading={isSubmitting}
          >
            Add Interaction
          </Button>
        </div>
      </div>
    </Modal>
  );
} 