'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from '@/components/Button';
import Modal from '@/components/ui/Modal';
import { Mail, FileText, Calendar, ClipboardCheck } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";

interface StageTemplate {
  id: string;
  title: string;
  description: string;
  processes: {
    title: string;
    description: string;
    type: 'DOCUMENT' | 'EMAIL' | 'MEETING' | 'TASK';
    automatedTasks: {
      type: 'EMAIL' | 'DOCUMENT_REQUEST' | 'CALENDAR_INVITE';
    }[];
  }[];
}

const defaultTemplates: StageTemplate[] = [
  {
    id: 'buyer-consultation',
    title: 'Buyer Consultation',
    description: 'Initial consultation and requirements gathering for buyers',
    processes: [
      {
        title: 'Initial Consultation Meeting',
        description: 'Schedule and conduct initial consultation meeting',
        type: 'MEETING',
        automatedTasks: [
          { type: 'CALENDAR_INVITE' },
          { type: 'EMAIL' }
        ]
      },
      {
        title: 'Requirements Documentation',
        description: 'Document buyer requirements and preferences',
        type: 'DOCUMENT',
        automatedTasks: [
          { type: 'DOCUMENT_REQUEST' }
        ]
      }
    ]
  },
  {
    id: 'property-search',
    title: 'Property Search',
    description: 'Active property search and viewings',
    processes: [
      {
        title: 'Property Viewings',
        description: 'Schedule and coordinate property viewings',
        type: 'MEETING',
        automatedTasks: [
          { type: 'CALENDAR_INVITE' },
          { type: 'EMAIL' }
        ]
      },
      {
        title: 'Viewing Feedback',
        description: 'Collect and document feedback on viewed properties',
        type: 'DOCUMENT',
        automatedTasks: [
          { type: 'DOCUMENT_REQUEST' },
          { type: 'EMAIL' }
        ]
      }
    ]
  },
  {
    id: 'offer-submission',
    title: 'Offer Submission',
    description: 'Prepare and submit property offer',
    processes: [
      {
        title: 'Offer Documentation',
        description: 'Prepare and review offer documents',
        type: 'DOCUMENT',
        automatedTasks: [
          { type: 'DOCUMENT_REQUEST' }
        ]
      },
      {
        title: 'Offer Review Meeting',
        description: 'Review offer details with client',
        type: 'MEETING',
        automatedTasks: [
          { type: 'CALENDAR_INVITE' },
          { type: 'EMAIL' }
        ]
      }
    ]
  }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templates: StageTemplate[]) => void;
}

export default function StageTemplates({ isOpen, onClose, onSelect }: Props) {
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const { addToast } = useToast();
  const { isLoading } = useLoadingStates();

  const handleSelectTemplates = () => {
    if (selectedTemplates.length === 0) {
      addToast('Please select at least one template', 'error');
      return;
    }

    const templates = defaultTemplates.filter(template => 
      selectedTemplates.includes(template.id)
    );
    onSelect(templates);
  };

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Stage Template"
    >
      <div className="space-y-6">
        {/* Template Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Templates
          </label>
          <div className="space-y-4">
            {defaultTemplates.map(template => (
              <label
                key={template.id}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <Checkbox
                  checked={selectedTemplates.includes(template.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedTemplates([...selectedTemplates, template.id]);
                    } else {
                      setSelectedTemplates(selectedTemplates.filter(id => id !== template.id));
                    }
                  }}
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{template.title}</p>
                  <p className="text-sm text-gray-500">{template.description}</p>
                  {template.processes.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {template.processes.map((process, index) => (
                        <div
                          key={index}
                          className="text-sm text-gray-600 pl-4 border-l-2 border-gray-200"
                        >
                          <p>{process.title}</p>
                          {process.automatedTasks.length > 0 && (
                            <div className="mt-1 flex gap-2">
                              {process.automatedTasks.map((task, taskIndex) => (
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
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSelectTemplates}
            variant="primary"
            disabled={selectedTemplates.length === 0}
          >
            Start {selectedTemplates.length} Stage{selectedTemplates.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    </Modal>
  );
} 