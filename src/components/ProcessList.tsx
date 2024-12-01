'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from './Button';
import Modal from './ui/Modal';
import { Plus, Calendar, Mail, FileText, CheckCircle, XCircle, Clock, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import ProcessForm from './ProcessForm';
import TaskForm from './TaskForm';

interface Process {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  dueDate: Date | null;
  completedAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  requestId: string | null;
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [collapsedProcesses, setCollapsedProcesses] = useState<Set<string>>(() => {
    const collapsed = new Set<string>();
    processes.forEach(process => collapsed.add(process.id));
    return collapsed;
  });
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  const toggleProcess = (processId: string) => {
    const newCollapsed = new Set(collapsedProcesses);
    if (newCollapsed.has(processId)) {
      newCollapsed.delete(processId);
    } else {
      newCollapsed.add(processId);
    }
    setCollapsedProcesses(newCollapsed);
  };

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
        return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100';
      case 'IN_PROGRESS':
        return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
      case 'FAILED':
        return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
      case 'PENDING':
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'PENDING':
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTaskStatusCount = (tasks: Array<{ status: string }>) => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'COMPLETED').length;
    return { total, completed };
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
          <div key={process.id} className="bg-white rounded-lg shadow">
            <div 
              className="p-4 cursor-pointer"
              onClick={() => toggleProcess(process.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  {getProcessIcon(process.type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{process.title}</h4>
                      <span className="text-sm text-gray-500">
                        ({getTaskStatusCount(process.tasks).completed}/{getTaskStatusCount(process.tasks).total} tasks)
                      </span>
                    </div>
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProcess(process);
                      setShowEditModal(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this process?')) {
                        setLoading(`delete-process-${process.id}`, true);
                        try {
                          const response = await fetch(
                            `/api/clients/${clientId}/requests/${requestId}/processes/${process.id}`,
                            { method: 'DELETE' }
                          );
                          if (!response.ok) throw new Error('Failed to delete process');
                          addToast('Process deleted successfully', 'success');
                          onUpdate();
                        } catch (error) {
                          console.error('Error:', error);
                          addToast('Failed to delete process', 'error');
                        } finally {
                          setLoading(`delete-process-${process.id}`, false);
                        }
                      }
                    }}
                    isLoading={isLoading(`delete-process-${process.id}`)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <select
                    value={process.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleStatusChange(process.id, e.target.value);
                    }}
                    className={`
                      ${getStatusColor(process.status)}
                      inline-flex items-center px-3 py-1 
                      rounded-full text-sm font-medium border
                      transition-colors duration-150 ease-in-out
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                    disabled={isLoading(`processStatus-${process.id}`)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="PENDING" className="bg-white text-gray-700">
                      ⏳ Pending
                    </option>
                    <option value="IN_PROGRESS" className="bg-white text-blue-700">
                      🔄 In Progress
                    </option>
                    <option value="COMPLETED" className="bg-white text-green-700">
                      ✅ Completed
                    </option>
                    <option value="FAILED" className="bg-white text-red-700">
                      ❌ Failed
                    </option>
                  </select>
                  {collapsedProcesses.has(process.id) ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {!collapsedProcesses.has(process.id) && (
              <div className="px-4 pb-4 border-t pt-4">
                {process.tasks.length === 0 ? (
                  <div className="flex justify-between items-center">
                    <p className="text-gray-500 text-sm">No tasks yet. Add your first task to get started.</p>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProcess(process);
                        setShowAddTaskModal(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Task
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="text-sm font-medium">Tasks</h5>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
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
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="small"
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this task?')) {
                                  setLoading(`delete-task-${task.id}`, true);
                                  try {
                                    const response = await fetch(
                                      `/api/clients/${clientId}/requests/${requestId}/processes/${process.id}/tasks/${task.id}`,
                                      { method: 'DELETE' }
                                    );
                                    if (!response.ok) throw new Error('Failed to delete task');
                                    addToast('Task deleted successfully', 'success');
                                    onUpdate();
                                  } catch (error) {
                                    console.error('Error:', error);
                                    addToast('Failed to delete task', 'error');
                                  } finally {
                                    setLoading(`delete-task-${task.id}`, false);
                                  }
                                }
                              }}
                              isLoading={isLoading(`delete-task-${task.id}`)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <select
                              value={task.status}
                              onChange={(e) => handleTaskStatusChange(process.id, task.id, e.target.value)}
                              className={`
                                ${getStatusColor(task.status)}
                                inline-flex items-center px-3 py-1 
                                rounded-full text-xs font-medium border
                                transition-colors duration-150 ease-in-out
                                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                                disabled:opacity-50 disabled:cursor-not-allowed
                              `}
                              disabled={isLoading(`taskStatus-${task.id}`)}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="PENDING" className="bg-white text-gray-700">
                                ⏳ Pending
                              </option>
                              <option value="COMPLETED" className="bg-white text-green-700">
                                ✅ Completed
                              </option>
                              <option value="FAILED" className="bg-white text-red-700">
                                ❌ Failed
                              </option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

      {/* Add Edit Process Modal */}
      {showEditModal && selectedProcess && (
        <ProcessForm
          clientId={clientId}
          requestId={requestId}
          initialData={selectedProcess}
          onSubmit={() => {
            setShowEditModal(false);
            onUpdate();
          }}
          onCancel={() => setShowEditModal(false)}
          isEditing={true}
        />
      )}
    </div>
  );
} 