'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from '@/components/Button';
import { CheckCircle, Clock, AlertCircle, Mail, FileText, Calendar, ClipboardCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface OnboardingTask {
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

export default function OnboardingTasksList({ clientId, onUpdate }: Props) {
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  useEffect(() => {
    loadTasks();
  }, [clientId]);

  const loadTasks = async () => {
    setLoading('loadTasks', true);
    try {
      const response = await fetch(`/api/clients/${clientId}/onboarding/tasks`);
      if (!response.ok) throw new Error('Failed to fetch onboarding tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to load onboarding tasks', 'error');
    } finally {
      setLoading('loadTasks', false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: OnboardingTask['status'], notes?: string) => {
    setLoading(`updateTask-${taskId}`, true);
    try {
      const response = await fetch(`/api/clients/${clientId}/onboarding/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });

      if (!response.ok) throw new Error('Failed to update task status');

      loadTasks();
      onUpdate();
      addToast('Task status updated successfully', 'success');
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update task status', 'error');
    } finally {
      setLoading(`updateTask-${taskId}`, false);
    }
  };

  const getStatusIcon = (status: OnboardingTask['status']) => {
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

  const getTaskIcon = (type: OnboardingTask['type']) => {
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

  const getStatusColor = (status: OnboardingTask['status']) => {
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

  if (isLoading('loadTasks')) {
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
      {tasks.map((task) => (
        <div 
          key={task.id}
          className={`border rounded-lg p-4 ${getStatusColor(task.status)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-white`}>
                {getTaskIcon(task.type)}
              </div>
              <div>
                <h3 className="font-medium">{task.title}</h3>
                <p className="text-sm mt-1">{task.description}</p>
                {task.tasks.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {task.tasks.map((subtask) => (
                      <span
                        key={subtask.id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white"
                      >
                        {subtask.type === 'EMAIL' && <Mail className="h-3 w-3 mr-1" />}
                        {subtask.type === 'DOCUMENT_REQUEST' && <FileText className="h-3 w-3 mr-1" />}
                        {subtask.type === 'CALENDAR_INVITE' && <Calendar className="h-3 w-3 mr-1" />}
                        {subtask.type.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                )}
                {task.dueDate && (
                  <p className="text-sm mt-2">
                    Due: {formatDate(task.dueDate)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {task.status !== 'COMPLETED' && (
                <>
                  {task.status === 'PENDING' && (
                    <Button
                      onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                      variant="secondary"
                      size="small"
                      isLoading={isLoading(`updateTask-${task.id}`)}
                    >
                      Start
                    </Button>
                  )}
                  <Button
                    onClick={() => updateTaskStatus(task.id, 'COMPLETED')}
                    variant="success"
                    size="small"
                    isLoading={isLoading(`updateTask-${task.id}`)}
                  >
                    Complete
                  </Button>
                </>
              )}
            </div>
          </div>
          {task.notes && (
            <p className="mt-2 text-sm border-t pt-2">{task.notes}</p>
          )}
        </div>
      ))}

      {tasks.length === 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No onboarding tasks found</p>
        </div>
      )}
    </div>
  );
} 