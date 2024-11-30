'use client';

import React, { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from '@/components/Button';

interface Props {
  stageId: string;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function RequirementForm({ stageId, onSubmit, onCancel }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'PURCHASE',
    propertyType: '',
    budgetMin: '',
    budgetMax: '',
    bedrooms: '',
    bathrooms: '',
    preferredLocations: [''],
    additionalRequirements: '',
  });

  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('submitRequirement', true);

    try {
      const response = await fetch(`/api/clients/${stageId}/stages/${stageId}/requirements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create requirement');

      addToast('Requirement created successfully', 'success');
      onSubmit();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to create requirement', 'error');
    } finally {
      setLoading('submitRequirement', false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Add other form fields here */}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={onCancel}
          variant="secondary"
          disabled={isLoading('submitRequirement')}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading('submitRequirement')}
        >
          Create Requirement
        </Button>
      </div>
    </form>
  );
} 