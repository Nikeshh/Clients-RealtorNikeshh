'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/Button';

interface EmailTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (template: string) => Promise<void>;
  initialTemplate?: string;
}

export default function EmailTemplateModal({
  isOpen,
  onClose,
  onSubmit,
  initialTemplate = ''
}: EmailTemplateModalProps) {
  const [template, setTemplate] = useState(initialTemplate);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(template);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Email Template"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Template Content</label>
          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            rows={10}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Enter your email template here..."
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!template.trim()}
            isLoading={isSubmitting}
          >
            Save Template
          </Button>
        </div>
      </div>
    </Modal>
  );
} 