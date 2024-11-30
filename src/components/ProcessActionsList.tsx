'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from '@/components/Button';
import { CheckCircle, Clock, AlertCircle, Mail, FileText, Calendar, ClipboardCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ProcessAction {
  id: string;
  title: string;
  description: string;
  type: 'DOCUMENT' | 'EMAIL' | 'MEETING' | 'TASK';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  dueDate?: string;
  completedAt?: string;
  notes?: string;
  tasks: {
    id: string;
    type: 'EMAIL' | 'DOCUMENT_REQUEST' | 'CALENDAR_INVITE';
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    completedAt?: string;
  }[];
}

interface Props {
  clientId: string;
  onUpdate: () => void;
}

export default function ProcessActionsList({ clientId, onUpdate }: Props) {
  const [actions, setActions] = useState<ProcessAction[]>([]);
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  useEffect(() => {
    loadActions();
  }, [clientId]);

  const loadActions = async () => {
    setLoading('loadActions', true);
    try {
      const response = await fetch(`/api/clients/${clientId}/process/actions`);
      if (!response.ok) throw new Error('Failed to fetch process actions');
      const data = await response.json();
      setActions(data);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to load process actions', 'error');
    } finally {
      setLoading('loadActions', false);
    }
  };

  const updateActionStatus = async (actionId: string, status: ProcessAction['status'], notes?: string) => {
    setLoading(`updateAction-${actionId}`, true);
    try {
      const response = await fetch(`/api/clients/${clientId}/process/actions/${actionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });

      if (!response.ok) throw new Error('Failed to update action status');

      loadActions();
      onUpdate();
      addToast(`Action ${status === 'COMPLETED' ? 'completed' : 'started'} successfully`, 'success');
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update action status', 'error');
    } finally {
      setLoading(`updateAction-${actionId}`, false);
    }
  };

  const getStatusIcon = (status: ProcessAction['status']) => {
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

  const getActionIcon = (type: ProcessAction['type']) => {
    switch (type) {
      case 'DOCUMENT':
        return <FileText className="h-5 w-5" />;
      case 'EMAIL':
        return <Mail className="h-5 w-5" />;
      case 'MEETING':
        return <Calendar className="h-5 w-5" />;
      case 'TASK':
        return <ClipboardCheck className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: ProcessAction['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'IN_PROGRESS':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'FAILED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (isLoading('loadActions')) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {actions.map((action) => (
        <div 
          key={action.id}
          className={`border rounded-lg p-4 ${getStatusColor(action.status)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-white`}>
                {getActionIcon(action.type)}
              </div>
              <div>
                <h3 className="font-medium">{action.title}</h3>
                <p className="text-sm mt-1">{action.description}</p>
                {action.tasks.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {action.tasks.map((task) => (
                      <span
                        key={task.id}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white ${
                          task.status === 'COMPLETED' ? 'text-green-700' : 'text-gray-700'
                        }`}
                      >
                        {task.type === 'EMAIL' && <Mail className="h-3 w-3 mr-1" />}
                        {task.type === 'DOCUMENT_REQUEST' && <FileText className="h-3 w-3 mr-1" />}
                        {task.type === 'CALENDAR_INVITE' && <Calendar className="h-3 w-3 mr-1" />}
                        {task.type.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                )}
                {action.dueDate && (
                  <p className="text-sm mt-2">
                    Due: {formatDate(action.dueDate)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {action.status === 'PENDING' && (
                <Button
                  onClick={() => updateActionStatus(action.id, 'IN_PROGRESS')}
                  variant="secondary"
                  size="small"
                  isLoading={isLoading(`updateAction-${action.id}`)}
                >
                  Start
                </Button>
              )}
              {action.status === 'IN_PROGRESS' && (
                <Button
                  onClick={() => updateActionStatus(action.id, 'COMPLETED')}
                  variant="primary"
                  size="small"
                  isLoading={isLoading(`updateAction-${action.id}`)}
                >
                  Complete
                </Button>
              )}
            </div>
          </div>
          {action.notes && (
            <p className="mt-2 text-sm border-t pt-2">{action.notes}</p>
          )}
        </div>
      ))}

      {actions.length === 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No process actions found</p>
        </div>
      )}
    </div>
  );
} 