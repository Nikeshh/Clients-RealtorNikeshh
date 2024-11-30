'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from '@/components/Button';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import StageTemplates from './StageTemplates';

interface Stage {
  id: string;
  title: string;
  description?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate?: string;
  order: number;
  processes: Array<{
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
  }>;
  requirements: any[];
  checklist: any[];
  documents: any[];
  sharedProperties: any[];
  interactions: any[];
}

interface Props {
  clientId: string;
}

export default function ClientStages({ clientId }: Props) {
  const [stages, setStages] = useState<Stage[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedStages, setExpandedStages] = useState<string[]>([]);
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  useEffect(() => {
    loadStages();
  }, []);

  const loadStages = async () => {
    setLoading('loadStages', true);
    try {
      const response = await fetch(`/api/clients/${clientId}/stages`);
      if (!response.ok) throw new Error('Failed to fetch stages');
      const data = await response.json();
      setStages(data);
      // Expand the first stage by default
      if (data.length > 0 && expandedStages.length === 0) {
        setExpandedStages([data[0].id]);
      }
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to load stages', 'error');
    } finally {
      setLoading('loadStages', false);
    }
  };

  const handleAddStage = async (templates: any[]) => {
    setLoading('addStage', true);
    try {
      // Create stages sequentially to maintain order
      for (const template of templates) {
        const response = await fetch(`/api/clients/${clientId}/stages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: template.title,
            description: template.description,
            processes: template.processes
          }),
        });

        if (!response.ok) throw new Error('Failed to create stage');
      }

      addToast('Stages created successfully', 'success');
      loadStages();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to create stages', 'error');
    } finally {
      setLoading('addStage', false);
    }
  };

  const handleStageStatusChange = async (stageId: string, newStatus: Stage['status']) => {
    setLoading(`updateStage-${stageId}`, true);
    try {
      const response = await fetch(`/api/clients/${clientId}/stages/${stageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update stage status');

      addToast('Stage status updated successfully', 'success');
      loadStages();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update stage status', 'error');
    } finally {
      setLoading(`updateStage-${stageId}`, false);
    }
  };

  const toggleStageExpansion = (stageId: string) => {
    setExpandedStages(prev => 
      prev.includes(stageId) 
        ? prev.filter(id => id !== stageId)
        : [...prev, stageId]
    );
  };

  const getStatusColor = (status: Stage['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (isLoading('loadStages')) {
    return <div className="animate-pulse space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
      ))}
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Stages</h2>
        <Button
          onClick={() => setShowAddModal(true)}
          variant="primary"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Stage
        </Button>
      </div>

      <div className="space-y-4">
        {stages.map((stage) => (
          <div key={stage.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
              onClick={() => toggleStageExpansion(stage.id)}
            >
              <div className="flex items-center gap-4">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(stage.status)}`}>
                  {stage.status}
                </span>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{stage.title}</h3>
                  {stage.description && (
                    <p className="text-sm text-gray-500">{stage.description}</p>
                  )}
                </div>
              </div>
              {expandedStages.includes(stage.id) ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>

            {expandedStages.includes(stage.id) && (
              <div className="border-t border-gray-200 p-4">
                <div className="space-y-6">
                  {/* Stage Actions */}
                  <div className="flex justify-end gap-2">
                    {stage.status === 'ACTIVE' && (
                      <>
                        <Button
                          onClick={() => handleStageStatusChange(stage.id, 'COMPLETED')}
                          variant="success"
                          size="small"
                        >
                          Complete Stage
                        </Button>
                        <Button
                          onClick={() => handleStageStatusChange(stage.id, 'CANCELLED')}
                          variant="danger"
                          size="small"
                        >
                          Cancel Stage
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Stage Content Sections */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Processes Section */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-4">Processes</h4>
                      {stage.processes.length > 0 ? (
                        <div className="space-y-4">
                          {stage.processes.map((process) => (
                            <div key={process.id} className="border rounded-lg p-3">
                              <h5 className="font-medium">{process.title}</h5>
                              {process.description && (
                                <p className="text-sm text-gray-500 mt-1">{process.description}</p>
                              )}
                              {process.tasks.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {process.tasks.map((task) => (
                                    <span
                                      key={task.id}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                    >
                                      {task.type}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No processes added yet</p>
                      )}
                    </div>

                    {/* Requirements Section */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-4">Requirements</h4>
                      {stage.requirements.length > 0 ? (
                        <div className="space-y-4">
                          {stage.requirements.map((requirement) => (
                            <div key={requirement.id} className="border rounded-lg p-3">
                              <h5 className="font-medium">{requirement.title}</h5>
                              <p className="text-sm text-gray-500 mt-1">{requirement.description}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No requirements added yet</p>
                      )}
                    </div>
                  </div>

                  {/* Checklist Section */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Checklist</h4>
                    {stage.checklist.length > 0 ? (
                      <div className="space-y-2">
                        {stage.checklist.map((item) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => {/* Handle checklist item toggle */}}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{item.text}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No checklist items added yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {stages.length === 0 && (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No stages found</p>
          </div>
        )}
      </div>

      {/* Add Stage Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Stage"
      >
        <StageTemplates
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSelect={handleAddStage}
        />
      </Modal>
    </div>
  );
} 