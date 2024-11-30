'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from '@/components/Button';
import Modal from '@/components/ui/Modal';
import { CheckCircle, Clock, AlertCircle, Mail, FileText, Calendar, ClipboardCheck } from 'lucide-react';

interface ProcessAction {
  id: string;
  title: string;
  description: string;
  type: 'DOCUMENT' | 'EMAIL' | 'MEETING' | 'TASK';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  dueDate?: string;
  completedAt?: string;
  notes?: string;
  automatedTasks: {
    type: 'EMAIL' | 'DOCUMENT_REQUEST' | 'CALENDAR_INVITE';
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    completedAt?: string;
  }[];
}

const defaultProcessActions: Omit<ProcessAction, 'id'>[] = [
  {
    title: 'Sign Representation Agreement',
    description: 'Get the representation agreement signed by the client',
    type: 'DOCUMENT',
    status: 'PENDING',
    automatedTasks: [
      {
        type: 'EMAIL',
        status: 'PENDING'
      },
      {
        type: 'DOCUMENT_REQUEST',
        status: 'PENDING'
      }
    ]
  },
  {
    title: 'Initial Consultation Meeting',
    description: 'Schedule and conduct initial consultation meeting',
    type: 'MEETING',
    status: 'PENDING',
    automatedTasks: [
      {
        type: 'CALENDAR_INVITE',
        status: 'PENDING'
      },
      {
        type: 'EMAIL',
        status: 'PENDING'
      }
    ]
  },
  {
    title: 'Collect Required Documents',
    description: 'Gather necessary documents from client',
    type: 'TASK',
    status: 'PENDING',
    automatedTasks: [
      {
        type: 'EMAIL',
        status: 'PENDING'
      },
      {
        type: 'DOCUMENT_REQUEST',
        status: 'PENDING'
      }
    ]
  },
  {
    title: 'Send Welcome Package',
    description: 'Send welcome package and information kit to client',
    type: 'EMAIL',
    status: 'PENDING',
    automatedTasks: [
      {
        type: 'EMAIL',
        status: 'PENDING'
      }
    ]
  }
];

interface Props {
  clientId: string;
  onComplete: () => void;
}

export default function ClientProcessActions({ clientId, onComplete }: Props) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  const handleInitiateProcess = async () => {
    setLoading('initiateProcess', true);
    try {
      const response = await fetch(`/api/clients/${clientId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ actions: defaultProcessActions })
      });

      if (!response.ok) throw new Error('Failed to initiate process');

      addToast('Process initiated successfully', 'success');
      onComplete();
      setShowConfirmModal(false);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to initiate process', 'error');
    } finally {
      setLoading('initiateProcess', false);
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

  return (
    <>
      <Button
        onClick={() => setShowConfirmModal(true)}
        variant="primary"
      >
        Start Process
      </Button>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Start Client Process"
      >
        <div className="space-y-6">
          <p className="text-gray-500">
            This will initiate the following process actions:
          </p>

          <div className="space-y-4">
            {defaultProcessActions.map((action, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="text-gray-400">
                  {getActionIcon(action.type)}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {action.description}
                  </p>
                  {action.automatedTasks.length > 0 && (
                    <div className="mt-2 flex gap-2">
                      {action.automatedTasks.map((task, taskIndex) => (
                        <span
                          key={taskIndex}
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
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              onClick={() => setShowConfirmModal(false)}
              variant="secondary"
              disabled={isLoading('initiateProcess')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInitiateProcess}
              variant="primary"
              isLoading={isLoading('initiateProcess')}
            >
              Start Process
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
} 