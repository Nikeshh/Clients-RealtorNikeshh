'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/Button';
import { useLoadingStates } from '@/hooks/useLoadingStates';

interface EmailTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  properties: Array<{
    id: string;
    title: string;
    address: string;
    price: number;
  }>;
  recipients: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

export default function EmailTemplateModal({
  isOpen,
  onClose,
  onSubmit,
  properties,
  recipients,
}: EmailTemplateModalProps) {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });
  const { setLoading, isLoading } = useLoadingStates();

  const handleSubmit = async () => {
    setLoading('sendEmail', true);
    try {
      await onSubmit({
        ...formData,
        properties,
        recipients,
      });
      setFormData({
        subject: '',
        message: '',
      });
      onClose();
    } finally {
      setLoading('sendEmail', false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Email Properties">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Recipients</label>
          <div className="mt-1 text-sm text-gray-500">
            {recipients.map(recipient => (
              <div key={recipient.id}>
                {recipient.name} ({recipient.email})
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Subject</label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Property recommendations for you"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Message</label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="I thought you might be interested in these properties..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Selected Properties</label>
          <div className="mt-1 space-y-2">
            {properties.map(property => (
              <div key={property.id} className="text-sm">
                <div className="font-medium">{property.title}</div>
                <div className="text-gray-500">{property.address}</div>
                <div className="text-gray-500">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                  }).format(property.price)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading('sendEmail')}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading('sendEmail')}
          >
            Send Email
          </Button>
        </div>
      </div>
    </Modal>
  );
} 