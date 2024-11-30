'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from '@/components/Button';
import Modal from '@/components/ui/Modal';
import { Checkbox } from "@/components/ui/checkbox";

interface OnboardingTemplate {
  id: string;
  title: string;
  description: string;
  actions: {
    title: string;
    description: string;
    type: 'DOCUMENT' | 'EMAIL' | 'MEETING' | 'TASK';
    automatedTasks: {
      type: 'EMAIL' | 'DOCUMENT_REQUEST' | 'CALENDAR_INVITE';
    }[];
  }[];
}

const defaultTemplates: OnboardingTemplate[] = [
  {
    id: 'buyer',
    title: 'Buyer Onboarding',
    description: 'Standard onboarding process for buyers',
    actions: [
      {
        title: 'Sign Buyer Representation Agreement',
        description: 'Get the buyer representation agreement signed',
        type: 'DOCUMENT',
        automatedTasks: [
          { type: 'EMAIL' },
          { type: 'DOCUMENT_REQUEST' }
        ]
      },
      {
        title: 'Initial Consultation Meeting',
        description: 'Schedule and conduct initial buyer consultation',
        type: 'MEETING',
        automatedTasks: [
          { type: 'CALENDAR_INVITE' },
          { type: 'EMAIL' }
        ]
      },
      {
        title: 'Mortgage Pre-Approval',
        description: 'Obtain mortgage pre-approval documentation',
        type: 'DOCUMENT',
        automatedTasks: [
          { type: 'EMAIL' },
          { type: 'DOCUMENT_REQUEST' }
        ]
      }
    ]
  },
  {
    id: 'seller',
    title: 'Seller Onboarding',
    description: 'Standard onboarding process for sellers',
    actions: [
      {
        title: 'Sign Listing Agreement',
        description: 'Get the listing agreement signed',
        type: 'DOCUMENT',
        automatedTasks: [
          { type: 'EMAIL' },
          { type: 'DOCUMENT_REQUEST' }
        ]
      },
      {
        title: 'Property Assessment Meeting',
        description: 'Schedule and conduct property assessment',
        type: 'MEETING',
        automatedTasks: [
          { type: 'CALENDAR_INVITE' },
          { type: 'EMAIL' }
        ]
      },
      {
        title: 'Collect Property Documents',
        description: 'Gather necessary property documentation',
        type: 'DOCUMENT',
        automatedTasks: [
          { type: 'EMAIL' },
          { type: 'DOCUMENT_REQUEST' }
        ]
      }
    ]
  }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  onStart: () => void;
}

export default function StartOnboardingModal({ isOpen, onClose, clientId, onStart }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('buyer');
  const [selectedActions, setSelectedActions] = useState<{[key: string]: boolean}>({});
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  const handleStartOnboarding = async () => {
    const template = defaultTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;

    const selectedTemplateActions = template.actions.filter((_, index) => selectedActions[index]);
    
    if (selectedTemplateActions.length === 0) {
      addToast('Please select at least one action', 'error');
      return;
    }

    setLoading('startOnboarding', true);
    try {
      const response = await fetch(`/api/clients/${clientId}/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actions: selectedTemplateActions
        }),
      });

      if (!response.ok) throw new Error('Failed to start onboarding');

      addToast('Onboarding process started successfully', 'success');
      onStart();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to start onboarding process', 'error');
    } finally {
      setLoading('startOnboarding', false);
    }
  };

  const currentTemplate = defaultTemplates.find(t => t.id === selectedTemplate);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Start Onboarding Process"
    >
      <div className="space-y-6">
        {/* Template Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Template
          </label>
          <div className="grid grid-cols-2 gap-4">
            {defaultTemplates.map(template => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-4 text-left border rounded-lg ${
                  selectedTemplate === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-200'
                }`}
              >
                <h3 className="font-medium text-gray-900">{template.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{template.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Actions Selection */}
        {currentTemplate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Actions
            </label>
            <div className="space-y-3">
              {currentTemplate.actions.map((action, index) => (
                <label
                  key={index}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <Checkbox
                    checked={selectedActions[index] || false}
                    onCheckedChange={(checked) => {
                      setSelectedActions(prev => ({
                        ...prev,
                        [index]: checked
                      }));
                    }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{action.title}</p>
                    <p className="text-sm text-gray-500">{action.description}</p>
                    {action.automatedTasks.length > 0 && (
                      <div className="mt-2 flex gap-2">
                        {action.automatedTasks.map((task, taskIndex) => (
                          <span
                            key={taskIndex}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {task.type.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="secondary"
            disabled={isLoading('startOnboarding')}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStartOnboarding}
            variant="primary"
            isLoading={isLoading('startOnboarding')}
          >
            Start Onboarding
          </Button>
        </div>
      </div>
    </Modal>
  );
} 