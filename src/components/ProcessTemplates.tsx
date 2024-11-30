'use client';

import { useState } from 'react';
import Button from './Button';

interface ProcessTemplate {
  id: string;
  title: string;
  description: string;
  type: string;
  automatedTasks: Array<{
    type: string;
  }>;
}

const processTemplates: ProcessTemplate[] = [
  {
    id: 'buyer-consultation',
    title: 'Buyer Consultation',
    description: 'Initial consultation and requirements gathering',
    type: 'MEETING',
    automatedTasks: [
      { type: 'CALENDAR_INVITE' },
      { type: 'EMAIL' }
    ]
  },
  {
    id: 'property-viewing',
    title: 'Property Viewing',
    description: 'Schedule and conduct property viewing',
    type: 'MEETING',
    automatedTasks: [
      { type: 'CALENDAR_INVITE' },
      { type: 'EMAIL' }
    ]
  },
  {
    id: 'offer-submission',
    title: 'Offer Submission',
    description: 'Prepare and submit offer',
    type: 'DOCUMENT',
    automatedTasks: [
      { type: 'DOCUMENT_REQUEST' },
      { type: 'EMAIL' }
    ]
  },
  {
    id: 'seller-listing',
    title: 'Seller Listing',
    description: 'Prepare property listing',
    type: 'DOCUMENT',
    automatedTasks: [
      { type: 'DOCUMENT_REQUEST' },
      { type: 'EMAIL' }
    ]
  },
  // Add more process templates as needed
];

interface Props {
  onSelect: (template: ProcessTemplate) => void;
  onClose: () => void;
}

export default function ProcessTemplates({ onSelect, onClose }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<ProcessTemplate | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {processTemplates.map((template) => (
          <div
            key={template.id}
            className={`p-4 border rounded-lg cursor-pointer ${
              selectedTemplate?.id === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => setSelectedTemplate(template)}
          >
            <h3 className="font-medium text-gray-900">{template.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{template.description}</p>
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
          Add Process
        </Button>
      </div>
    </div>
  );
} 