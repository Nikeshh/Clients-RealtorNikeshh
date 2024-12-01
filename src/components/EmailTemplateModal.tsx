'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from './Button';
import Modal from './ui/Modal';

interface Property {
  title: string;
  address: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  link?: string;
  images?: string[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  onSubmit: () => void;
}

export default function EmailTemplateModal({ isOpen, onClose, properties, onSubmit }: Props) {
  const [subject, setSubject] = useState('Property Recommendations');
  const [message, setMessage] = useState('');
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('sendEmail', true);

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          message,
          properties,
          template: 'PropertyEmail',
        }),
      });

      if (!response.ok) throw new Error('Failed to send email');
      
      addToast('Email sent successfully', 'success');
      onSubmit();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to send email', 'error');
    } finally {
      setLoading('sendEmail', false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Properties">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Subject
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Message
          </label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a personal message..."
          />
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Selected Properties ({properties.length})
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {properties.map((property, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
              >
                {property.images?.[0] && (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div>
                  <div className="font-medium">{property.title}</div>
                  <div className="text-sm text-gray-500">{property.address}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading('sendEmail')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading('sendEmail')}
          >
            Send Email
          </Button>
        </div>
      </form>
    </Modal>
  );
} 