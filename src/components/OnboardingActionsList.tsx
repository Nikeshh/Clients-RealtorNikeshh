'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from '@/components/Button';
import { CheckCircle, Clock, AlertCircle, Mail, FileText, Calendar, ClipboardCheck } from 'lucide-react';

interface OnboardingAction {
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

export default function OnboardingActionsList({ clientId, onUpdate }: Props) {
  const [actions, setActions] = useState<OnboardingAction[]>([]);
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  useEffect(() => {
    loadActions();
  }, [clientId]);

  const loadActions = async () => {
    setLoading('loadActions', true);
    try {
      const response = await fetch(`/api/clients/${clientId}/onboarding/actions`);
      if (!response.ok) throw new Error('Failed to fetch onboarding actions');
      const data = await response.json();
      setActions(data);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to load onboarding actions', 'error');
    } finally {
      setLoading('loadActions', false);
    }
  };

  const updateActionStatus = async (actionId: string, status: OnboardingAction['status'], notes?: string) => {
    setLoading(`updateAction-${actionId}`, true);
    try {
      const response = await fetch(`/api/clients/${clientId}/onboarding/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ actionId, status, notes }),
      });

      if (!response.ok) throw new Error('Failed to update action status');

      loadActions();
      onUpdate();
      addToast('Action status updated successfully', 'success');
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update action status', 'error');
    } finally {
      setLoading(`updateAction-${actionId}`, false);
    }
  };

  const getStatusIcon = (status: OnboardingAction['status']) => {
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

  const getActionIcon = (type: OnboardingAction['type']) => {
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

  if (isLoading('loadActions')) {
    return <div className="animate-pulse space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
      ))}
    </div>;
  }

  return (
    <div className="space-y-4">
      {actions.map((action) => (
        <div 
          key={action.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                action.status === 'COMPLETED' ? 'bg-green-100' :
                action.status === 'IN_PROGRESS' ? 'bg-yellow-100' :
                action.status === 'FAILED' ? 'bg-red-100' :
                'bg-gray-100'
              }`}>
                {getActionIcon(action.type)}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{action.title}</h3>
                <p className="text-sm text-gray-500">{action.description}</p>
                {action.tasks.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {action.tasks.map((task, index) => (
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
              {action.status !== 'COMPLETED' && (
                <Button
                  onClick={() => updateActionStatus(action.id, 'COMPLETED')}
                  variant="success"
                  size="small"
                  isLoading={isLoading(`updateAction-${action.id}`)}
                >
                  Complete
                </Button>
              )}
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
            </div>
          </div>
          {action.notes && (
            <p className="mt-2 text-sm text-gray-500 border-t pt-2">{action.notes}</p>
          )}
        </div>
      ))}

      {actions.length === 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No onboarding actions found</p>
        </div>
      )}
    </div>
  );
} 