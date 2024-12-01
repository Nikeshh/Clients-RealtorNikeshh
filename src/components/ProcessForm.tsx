'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from './Button';
import Modal from './ui/Modal';
import { Calendar } from 'lucide-react';

interface Props {
  clientId: string;
  requestId: string;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function ProcessForm({ clientId, requestId, onSubmit, onCancel }: Props) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'TASK',
    dueDate: '',
  });

  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('submitProcess', true);

    try {
      const response = await fetch(`/api/clients/${clientId}/requests/${requestId}/processes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
        }),
      });

      if (!response.ok) throw new Error('Failed to create process');
      
      addToast('Process created successfully', 'success');
      onSubmit();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to create process', 'error');
    } finally {
      setLoading('submitProcess', false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onCancel} title="Add Process">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
          >
            <option value="TASK">Task</option>
            <option value="EMAIL">Email</option>
            <option value="DOCUMENT">Document</option>
            <option value="MEETING">Meeting</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Due Date
          </label>
          <div className="mt-1 relative">
            <input
              type="date"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-10"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
            <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading('submitProcess')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading('submitProcess')}
          >
            Create Process
          </Button>
        </div>
      </form>
    </Modal>
  );
} 