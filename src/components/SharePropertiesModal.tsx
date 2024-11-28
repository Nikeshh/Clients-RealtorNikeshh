'use client';

import { useState } from 'react';

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
}

interface SharePropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  onShare: (data: { email: string; message: string }) => void;
}

export default function SharePropertiesModal({ 
  isOpen, 
  onClose, 
  properties,
  onShare 
}: SharePropertiesModalProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onShare({ email, message });
    setIsSending(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-auto overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-blue-900">
            Share Properties ({properties.length})
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Selected Properties Preview */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Selected Properties:</h4>
              <div className="space-y-2">
                {properties.map(property => (
                  <div key={property.id} className="text-sm text-gray-600">
                    • {property.title}
                  </div>
                ))}
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Client Email *
              </label>
              <input
                type="email"
                id="email"
                required
                className="mt-1 block w-full rounded-lg border border-blue-200 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-400 focus:ring-blue-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
              />
            </div>

            {/* Message Input */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                className="mt-1 block w-full rounded-lg border border-blue-200 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-400 focus:ring-blue-400"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personal message..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSending ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isSending ? 'Sending...' : 'Share Properties'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 