'use client';

import { useState } from 'react';
import Modal from './ui/Modal';
import Button from './Button';

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  images?: string[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { subject: string; message: string; propertyIds: string[] }) => void;
  properties: Property[];
  isLoading?: boolean;
}

export default function EmailTemplateModal({ isOpen, onClose, onSubmit, properties, isLoading }: Props) {
  const [subject, setSubject] = useState('Property Suggestions for Your Review');
  const [message, setMessage] = useState('');
  const [selectedProperties, setSelectedProperties] = useState<string[]>(properties.map(p => p.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      subject,
      message,
      propertyIds: selectedProperties,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Property Email">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Subject</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Message</label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a personal message..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Properties to Include
          </label>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {properties.map((property) => (
              <label key={property.id} className="flex items-start p-2 border rounded-lg">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={selectedProperties.includes(property.id)}
                  onChange={(e) => {
                    setSelectedProperties(prev =>
                      e.target.checked
                        ? [...prev, property.id]
                        : prev.filter(id => id !== property.id)
                    );
                  }}
                />
                <div className="ml-3">
                  <p className="font-medium">{property.title}</p>
                  <p className="text-sm text-gray-500">{property.address}</p>
                  <p className="text-sm">${property.price.toLocaleString()}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
          >
            Send Email
          </Button>
        </div>
      </form>
    </Modal>
  );
} 