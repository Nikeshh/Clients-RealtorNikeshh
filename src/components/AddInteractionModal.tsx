'use client';

import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import type { Interaction } from '@/types/client';

interface AddInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Interaction, 'id' | 'clientId'>) => void;
}

const INTERACTION_TYPES = [
  { value: 'Email', label: 'Email', icon: '✉️' },
  { value: 'Call', label: 'Phone Call', icon: '📞' },
  { value: 'Meeting', label: 'Meeting', icon: '👥' },
  { value: 'Showing', label: 'Property Showing', icon: '🏠' },
];

export default function AddInteractionModal({
  isOpen,
  onClose,
  onSave
}: AddInteractionModalProps) {
  const [formData, setFormData] = useState({
    type: 'Email',
    date: new Date().toISOString().split('T')[0],
    description: '',
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving interaction:', error);
    } finally {
      setIsSaving(false);
      onClose();
    }
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
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />

            {/* Description */}
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the interaction"
              required
            />

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
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