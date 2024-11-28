'use client';

import { useState } from 'react';
import Button from './Button';
import Select from './Select';

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  type: string;
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  features: string[];
}

interface EmailTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  clientName: string;
  onSend: (data: {
    subject: string;
    template: string;
    message: string;
  }) => void;
}

const EMAIL_TEMPLATES = [
  { value: 'standard', label: 'Standard Property List' },
  { value: 'detailed', label: 'Detailed Property Comparison' },
  { value: 'summary', label: 'Brief Summary' },
];

export default function EmailTemplateModal({
  isOpen,
  onClose,
  properties,
  clientName,
  onSend
}: EmailTemplateModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  const [subject, setSubject] = useState(`Property Recommendations for ${clientName}`);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const generateTemplatePreview = () => {
    let template = '';

    switch (selectedTemplate) {
      case 'standard':
        template = `Hi ${clientName},

I hope this email finds you well. Based on your requirements, I've selected the following properties that I believe would be perfect for you:

${properties.map(property => `
• ${property.title}
  ${property.address}
  ${formatPrice(property.price)}
  ${property.bedrooms} beds, ${property.bathrooms} baths, ${property.area} sqft
`).join('\n')}

Let me know if you'd like to schedule viewings for any of these properties.`;
        break;

      case 'detailed':
        template = `Dear ${clientName},

I've carefully reviewed your requirements and found some excellent matches. Here's a detailed comparison of the properties:

${properties.map(property => `
${property.title}
--------------------
Location: ${property.address}
Price: ${formatPrice(property.price)}
Details: ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms
Area: ${property.area} square feet
Key Features:
${property.features.map(feature => `- ${feature}`).join('\n')}
`).join('\n\n')}

Each property has been selected based on your specific needs. I'd be happy to provide more information or arrange viewings.`;
        break;

      case 'summary':
        template = `Hi ${clientName},

Quick update on some properties that match your criteria:

${properties.map(property => `• ${property.title} - ${formatPrice(property.price)}`).join('\n')}

Would you like to learn more about any of these options?`;
        break;
    }

    return template;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSend({
      subject,
      template: selectedTemplate,
      message: message || generateTemplatePreview()
    });
    setIsSending(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-blue-900">
            Send Property Recommendations
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Email Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="block w-full rounded-lg border border-blue-200 px-3 py-2 focus:border-blue-400 focus:ring-blue-400"
                required
              />
            </div>

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Template
              </label>
              <Select
                options={EMAIL_TEMPLATES}
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
              />
            </div>

            {/* Template Preview / Custom Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                rows={12}
                value={message || generateTemplatePreview()}
                onChange={(e) => setMessage(e.target.value)}
                className="block w-full rounded-lg border border-blue-200 px-3 py-2 focus:border-blue-400 focus:ring-blue-400 font-mono text-sm"
              />
              {!message && (
                <p className="mt-1 text-sm text-gray-500">
                  This is a template preview. Edit the message to customize it.
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSending}
              loadingText="Sending..."
            >
              Send Email
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 