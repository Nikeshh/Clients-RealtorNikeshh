'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from './Button';
import Modal from './ui/Modal';

interface Props {
  clientId: string;
  requestId: string;
  processId: string;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function TaskForm({ clientId, requestId, processId, onSubmit, onCancel }: Props) {
  const [type, setType] = useState('EMAIL');
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('submitTask', true);

    try {
      const response = await fetch(
        `/api/clients/${clientId}/requests/${requestId}/processes/${processId}/tasks`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type }),
        }
      );

      if (!response.ok) throw new Error('Failed to create task');
      
      addToast('Task created successfully', 'success');
      onSubmit();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to create task', 'error');
    } finally {
      setLoading('submitTask', false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onCancel} title="Add Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Task Type
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="EMAIL">Send Email</option>
            <option value="DOCUMENT_REQUEST">Request Document</option>
            <option value="CALENDAR_INVITE">Schedule Meeting</option>
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading('submitTask')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading('submitTask')}
          >
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
} 