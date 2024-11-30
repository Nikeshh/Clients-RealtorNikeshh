'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from '@/components/Button';
import { Trash2 } from 'lucide-react';

interface Props {
  processes: any[];
  stageId: string;
  clientId: string;
  onUpdate: () => void;
}

export default function ProcessList({ processes, stageId, clientId, onUpdate }: Props) {
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  const handleStatusChange = async (processId: string, status: string) => {
    setLoading(`updateProcess-${processId}`, true);
    try {
      const response = await fetch(`/api/clients/${stageId}/processes/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ processId, status }),
      });

      if (!response.ok) throw new Error('Failed to update process');

      addToast('Process updated successfully', 'success');
      onUpdate();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update process', 'error');
    } finally {
      setLoading(`updateProcess-${processId}`, false);
    }
  };

  const handleDelete = async (clientId: string, processId: string) => {
    if (!confirm('Are you sure you want to delete this process?')) return;

    setLoading(`deleteProcess-${processId}`, true);
    try {
      const response = await fetch(`/api/clients/${clientId}/stages/${stageId}/processes/${processId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete process');

      addToast('Process deleted successfully', 'success');
      onUpdate();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to delete process', 'error');
    } finally {
      setLoading(`deleteProcess-${processId}`, false);
    }
  };

  return (
    <div className="space-y-4">
      {processes.map((process) => (
        <div key={process.id} className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">{process.title}</h4>
              <p className="text-sm text-gray-500">{process.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {process.status === 'PENDING' && (
                <Button
                  onClick={() => handleStatusChange(process.id, 'IN_PROGRESS')}
                  variant="secondary"
                  size="small"
                  isLoading={isLoading(`updateProcess-${process.id}`)}
                >
                  Start
                </Button>
              )}
              {process.status === 'IN_PROGRESS' && (
                <Button
                  onClick={() => handleStatusChange(process.id, 'COMPLETED')}
                  variant="primary"
                  size="small"
                  isLoading={isLoading(`updateProcess-${process.id}`)}
                >
                  Complete
                </Button>
              )}
              <Button
                onClick={() => handleDelete(clientId, process.id)}
                variant="danger"
                size="small"
                isLoading={isLoading(`deleteProcess-${process.id}`)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 