'use client';

import { useState } from 'react';
import Button from './Button';

interface InteractionType {
  value: string;
  label: string;
  icon: string;
}

const INTERACTION_TYPES: InteractionType[] = [
  { value: 'email', label: 'Email', icon: '✉️' },
  { value: 'call', label: 'Phone Call', icon: '📞' },
  { value: 'meeting', label: 'Meeting', icon: '👥' },
  { value: 'showing', label: 'Property Showing', icon: '🏠' },
];

interface AddInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    type: string;
    date: string;
    description: string;
    notes: string;
  }) => void;
}

export default function AddInteractionModal({
  isOpen,
  onClose,
  onSave
}: AddInteractionModalProps) {
  const [formData, setFormData] = useState({
    type: 'email',
    date: new Date().toISOString().split('T')[0],
    description: '',
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSave(formData);
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-blue-900">
            Add New Interaction
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Interaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type of Interaction
              </label>
              <div className="grid grid-cols-2 gap-3">
                {INTERACTION_TYPES.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: value }))}
                    className={`flex items-center p-3 rounded-lg border ${
                      formData.type === value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <span className="text-xl mr-2">{icon}</span>
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="block w-full rounded-lg border border-blue-200 px-3 py-2 focus:border-blue-400 focus:ring-blue-400"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="block w-full rounded-lg border border-blue-200 px-3 py-2 focus:border-blue-400 focus:ring-blue-400"
                placeholder="Brief description of the interaction"
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="block w-full rounded-lg border border-blue-200 px-3 py-2 focus:border-blue-400 focus:ring-blue-400"
                placeholder="Additional details about the interaction"
              />
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
              isLoading={isSaving}
              loadingText="Saving..."
            >
              Save Interaction
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 