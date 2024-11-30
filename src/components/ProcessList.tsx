'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from '@/components/Button';
import { CheckCircle, Clock, AlertCircle, Mail, FileText, Calendar, ClipboardCheck } from 'lucide-react';

interface Process {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  tasks: Array<{
    id: string;
    type: string;
    status: string;
  }>;
}

interface Props {
  processes: Process[];
  stageId: string;
  onUpdate: () => void;
}

export default function ProcessList({ processes, stageId, onUpdate }: Props) {
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  const updateProcessStatus = async (processId: string, status: string) => {
    setLoading(`updateProcess-${processId}`, true);
    try {
      const response = await fetch(`/api/clients/${stageId}/processes/${processId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'IN_PROGRESS':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'FAILED':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getProcessIcon = (type: string) => {
    switch (type) {
      case 'DOCUMENT':
        return <FileText className="h-5 w-5" />;
      case 'EMAIL':
        return <Mail className="h-5 w-5" />;
      case 'MEETING':
        return <Calendar className="h-5 w-5" />;
      case 'TASK':
        return <ClipboardCheck className="h-5 w-5" />;
      default:
        return <ClipboardCheck className="h-5 w-5" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Processes</h3>
      
      <div className="space-y-4">
        {processes.map((process) => (
          <div 
            key={process.id}
            className="border rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  process.status === 'COMPLETED' ? 'bg-green-100' :
                  process.status === 'IN_PROGRESS' ? 'bg-yellow-100' :
                  process.status === 'FAILED' ? 'bg-red-100' :
                  'bg-gray-100'
                }`}>
                  {getProcessIcon(process.type)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{process.title}</h4>
                  {process.description && (
                    <p className="text-sm text-gray-500 mt-1">{process.description}</p>
                  )}
                  {process.tasks.length > 0 && (
                    <div className="mt-2 flex gap-2">
                      {process.tasks.map((task) => (
                        <span
                          key={task.id}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {task.type === 'EMAIL' && <Mail className="h-3 w-3 mr-1" />}
                          {task.type === 'DOCUMENT_REQUEST' && <FileText className="h-3 w-3 mr-1" />}
                          {task.type === 'CALENDAR_INVITE' && <Calendar className="h-3 w-3 mr-1" />}
                          {task.type.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {process.status !== 'COMPLETED' && (
                  <Button
                    onClick={() => updateProcessStatus(process.id, 'COMPLETED')}
                    variant="primary"
                    size="small"
                    isLoading={isLoading(`updateProcess-${process.id}`)}
                  >
                    Complete
                  </Button>
                )}
                {process.status === 'PENDING' && (
                  <Button
                    onClick={() => updateProcessStatus(process.id, 'IN_PROGRESS')}
                    variant="secondary"
                    size="small"
                    isLoading={isLoading(`updateProcess-${process.id}`)}
                  >
                    Start
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        {processes.length === 0 && (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No processes found</p>
          </div>
        )}
      </div>
    </div>
  );
} 