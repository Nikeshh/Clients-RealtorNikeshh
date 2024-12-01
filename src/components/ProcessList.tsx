'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from './Button';
import Modal from './ui/Modal';
import { Plus, Calendar, Mail, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import ProcessForm from './ProcessForm';
import TaskForm from './TaskForm';

interface Process {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  dueDate?: string;
  completedAt?: string;
  tasks: Array<{
    id: string;
    type: string;
    status: string;
  }>;
}

interface Props {
  processes: Process[];
  clientId: string;
  requestId: string;
  onUpdate: () => void;
}

export default function ProcessList({ processes, clientId, requestId, onUpdate }: Props) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  const handleStatusChange = async (processId: string, status: string) => {
    setLoading(`processStatus-${processId}`, true);
    try {
      const response = await fetch(`/api/clients/${clientId}/requests/${requestId}/processes/${processId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update process status');
      
      addToast('Process status updated', 'success');
      onUpdate();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update process status', 'error');
    } finally {
      setLoading(`processStatus-${processId}`, false);
    }
  };

  const handleTaskStatusChange = async (processId: string, taskId: string, status: string) => {
    setLoading(`taskStatus-${taskId}`, true);
    try {
      const response = await fetch(
        `/api/clients/${clientId}/requests/${requestId}/processes/${processId}/tasks/${taskId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) throw new Error('Failed to update task status');
      
      addToast('Task status updated', 'success');
      onUpdate();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update task status', 'error');
    } finally {
      setLoading(`taskStatus-${taskId}`, false);
    }
  };

  const getProcessIcon = (type: string) => {
    switch (type) {
      case 'EMAIL':
        return <Mail className="h-5 w-5" />;
      case 'DOCUMENT':
        return <FileText className="h-5 w-5" />;
      case 'MEETING':
        return <Calendar className="h-5 w-5" />;
      default:
        return <CheckCircle className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Processes</h3>
        <Button
          variant="secondary"
          size="small"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Process
        </Button>
      </div>

      <div className="space-y-4">
        {processes.map((process) => (
          <div key={process.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-3">
                {getProcessIcon(process.type)}
                <div>
                  <h4 className="font-medium">{process.title}</h4>
                  {process.description && (
                    <p className="text-sm text-gray-500">{process.description}</p>
                  )}
                  {process.dueDate && (
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-1" />
                      Due: {new Date(process.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <select
                value={process.status}
                onChange={(e) => handleStatusChange(process.id, e.target.value)}
                className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(process.status)}`}
                disabled={isLoading(`processStatus-${process.id}`)}
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            {process.tasks.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="text-sm font-medium">Tasks</h5>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => {
                      setSelectedProcess(process);
                      setShowAddTaskModal(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Task
                  </Button>
                </div>
                <div className="space-y-2">
                  {process.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg"
                    >
                      <span className="flex items-center">
                        {getProcessIcon(task.type)}
                        <span className="ml-2">{task.type}</span>
                      </span>
                      <select
                        value={task.status}
                        onChange={(e) => handleTaskStatusChange(process.id, task.id, e.target.value)}
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(task.status)}`}
                        disabled={isLoading(`taskStatus-${task.id}`)}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="FAILED">Failed</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {processes.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            No processes yet. Add your first process to get started.
          </p>
        )}
      </div>

      {/* Add Process Modal */}
      {showAddModal && (
        <ProcessForm
          clientId={clientId}
          requestId={requestId}
          onSubmit={() => {
            setShowAddModal(false);
            onUpdate();
          }}
          onCancel={() => setShowAddModal(false)}
        />
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && selectedProcess && (
        <TaskForm
          clientId={clientId}
          requestId={requestId}
          processId={selectedProcess.id}
          onSubmit={() => {
            setShowAddTaskModal(false);
            onUpdate();
          }}
          onCancel={() => setShowAddTaskModal(false)}
        />
      )}
    </div>
  );
} 