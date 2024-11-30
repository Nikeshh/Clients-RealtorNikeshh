'use client';

import { useState } from 'react';
import Button from './Button';

interface StageTemplate {
  id: string;
  title: string;
  description: string;
  processes?: Array<{
    title: string;
    description: string;
    type: string;
    automatedTasks: Array<{
      type: string;
    }>;
  }>;
}

const stageTemplates: StageTemplate[] = [
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
    description: 'Active property search and viewings phase',
    processes: [
      {
        title: 'Property Viewings',
        description: 'Schedule and conduct property viewings',
        type: 'MEETING',
        automatedTasks: [
          { type: 'CALENDAR_INVITE' },
          { type: 'EMAIL' }
        ]
      }
    ]
  },
  {
    id: 'offer-negotiation',
    title: 'Offer & Negotiation',
    description: 'Prepare and submit offers, handle negotiations',
    processes: [
      {
        title: 'Offer Preparation',
        description: 'Prepare and review offer documents',
        type: 'DOCUMENT',
        automatedTasks: [
          { type: 'DOCUMENT_REQUEST' },
          { type: 'EMAIL' }
        ]
      }
    ]
  },
  {
    id: 'due-diligence',
    title: 'Due Diligence',
    description: 'Property inspection and document review period',
    processes: [
      {
        title: 'Property Inspection',
        description: 'Schedule and conduct property inspection',
        type: 'MEETING',
        automatedTasks: [
          { type: 'CALENDAR_INVITE' },
          { type: 'EMAIL' }
        ]
      }
    ]
  },
  {
    id: 'closing',
    title: 'Closing',
    description: 'Final walkthrough and closing process',
    processes: [
      {
        title: 'Final Walkthrough',
        description: 'Schedule and conduct final property walkthrough',
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
  onSelect: (template: StageTemplate) => void;
  onClose: () => void;
}

export default function StageTemplates({ onSelect, onClose }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<StageTemplate | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {stageTemplates.map((template) => (
          <div
            key={template.id}
            className={`p-4 border rounded-lg cursor-pointer ${
              selectedTemplate?.id === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => setSelectedTemplate(template)}
          >
            <h3 className="font-medium text-gray-900">{template.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{template.description}</p>
            {selectedTemplate?.id === template.id && template.processes && (
              <div className="mt-3 pl-4 border-l-2 border-blue-200">
                <p className="text-sm font-medium text-gray-700">Included Processes:</p>
                <ul className="mt-1 space-y-1">
                  {template.processes.map((process, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      • {process.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3">
        <Button
          onClick={onClose}
          variant="secondary"
        >
          Cancel
        </Button>
        <Button
          onClick={() => selectedTemplate && onSelect(selectedTemplate)}
          variant="primary"
          disabled={!selectedTemplate}
        >
          Add Client Stage
        </Button>
      </div>
    </div>
  );
} 