'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from '@/components/Button';
import Modal from '@/components/ui/Modal';
import { Mail, FileText, Calendar, ClipboardCheck } from 'lucide-react';

interface ProcessTemplate {
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

const defaultTemplates: ProcessTemplate[] = [
  {
    id: 'buyer',
    title: 'Buyer Process',
    description: 'Standard process for property buyers',
    actions: [
      {
        title: 'Initial Consultation',
        description: 'Schedule and conduct initial consultation meeting',
        type: 'MEETING',
        automatedTasks: [
          { type: 'CALENDAR_INVITE' },
          { type: 'EMAIL' }
        ]
      },
      {
        title: 'Document Collection',
        description: 'Collect necessary documents from client',
        type: 'DOCUMENT',
        automatedTasks: [
          { type: 'DOCUMENT_REQUEST' },
          { type: 'EMAIL' }
        ]
      },
      {
        title: 'Property Requirements',
        description: 'Define and document property requirements',
        type: 'TASK',
        automatedTasks: [
          { type: 'EMAIL' }
        ]
      }
    ]
  },
  {
    id: 'seller',
    title: 'Seller Process',
    description: 'Standard process for property sellers',
    actions: [
      {
        title: 'Property Evaluation',
        description: 'Schedule property evaluation meeting',
        type: 'MEETING',
        automatedTasks: [
          { type: 'CALENDAR_INVITE' },
          { type: 'EMAIL' }
        ]
      },
      {
        title: 'Marketing Materials',
        description: 'Prepare and review marketing materials',
        type: 'DOCUMENT',
        automatedTasks: [
          { type: 'DOCUMENT_REQUEST' },
          { type: 'EMAIL' }
        ]
      },
      {
        title: 'Listing Strategy',
        description: 'Define and document listing strategy',
        type: 'TASK',
        automatedTasks: [
          { type: 'EMAIL' }
        ]
      }
    ]
  }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: ProcessTemplate) => void;
}

export default function ProcessTemplates({ isOpen, onClose, onSelect }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('buyer');
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'EMAIL':
        return <Mail className="h-3 w-3 mr-1" />;
      case 'DOCUMENT_REQUEST':
        return <FileText className="h-3 w-3 mr-1" />;
      case 'CALENDAR_INVITE':
        return <Calendar className="h-3 w-3 mr-1" />;
      default:
        return <ClipboardCheck className="h-3 w-3 mr-1" />;
    }
  };

  const handleSelectTemplate = () => {
    const template = defaultTemplates.find(t => t.id === selectedTemplate);
    if (!template) {
      addToast('Please select a template', 'error');
      return;
    }
    onSelect(template);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Process Template"
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

        {/* Template Preview */}
        {selectedTemplate && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Template Actions</h3>
            <div className="space-y-3">
              {defaultTemplates
                .find(t => t.id === selectedTemplate)
                ?.actions.map((action, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg"
                  >
                    <p className="font-medium text-gray-900">{action.title}</p>
                    <p className="text-sm text-gray-500">{action.description}</p>
                    {action.automatedTasks.length > 0 && (
                      <div className="mt-2 flex gap-2">
                        {action.automatedTasks.map((task, taskIndex) => (
                          <span
                            key={taskIndex}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {getTaskIcon(task.type)}
                            {task.type.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSelectTemplate}
            variant="primary"
          >
            Use Template
          </Button>
        </div>
      </div>
    </Modal>
  );
} 