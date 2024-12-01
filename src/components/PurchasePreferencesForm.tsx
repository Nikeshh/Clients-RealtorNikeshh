'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from './Button';

interface PurchasePreferences {
  propertyAge?: string;
  preferredStyle?: string;
  parking?: number;
  lotSize?: number;
  basement?: boolean;
  garage?: boolean;
}

interface Props {
  clientId: string;
  requestId: string;
  requirementId: string;
  initialData?: PurchasePreferences;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function PurchasePreferencesForm({
  clientId,
  requestId,
  requirementId,
  initialData,
  onSubmit,
  onCancel,
}: Props) {
  const [formData, setFormData] = useState<PurchasePreferences>(
    initialData || {
      propertyAge: '',
      preferredStyle: '',
      parking: 0,
      lotSize: undefined,
      basement: false,
      garage: false,
    }
  );

  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('submitPreferences', true);

    try {
      const response = await fetch(
        `/api/clients/${clientId}/requests/${requestId}/requirements/${requirementId}/purchase-preferences`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error('Failed to save preferences');
      
      addToast('Preferences saved successfully', 'success');
      onSubmit();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to save preferences', 'error');
    } finally {
      setLoading('submitPreferences', false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Property Age
        </label>
        <select
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.propertyAge || ''}
          onChange={(e) => setFormData({ ...formData, propertyAge: e.target.value })}
        >
          <option value="">Select age range</option>
          <option value="0-5">0-5 years</option>
          <option value="6-10">6-10 years</option>
          <option value="11-20">11-20 years</option>
          <option value="20+">20+ years</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Preferred Style
        </label>
        <select
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.preferredStyle || ''}
          onChange={(e) => setFormData({ ...formData, preferredStyle: e.target.value })}
        >
          <option value="">Select style</option>
          <option value="Modern">Modern</option>
          <option value="Traditional">Traditional</option>
          <option value="Contemporary">Contemporary</option>
          <option value="Colonial">Colonial</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Parking Spaces
        </label>
        <input
          type="number"
          min="0"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.parking || 0}
          onChange={(e) => setFormData({ ...formData, parking: parseInt(e.target.value) })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Lot Size (sq ft)
        </label>
        <input
          type="number"
          min="0"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.lotSize || ''}
          onChange={(e) => setFormData({ ...formData, lotSize: parseFloat(e.target.value) })}
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={formData.basement}
            onChange={(e) => setFormData({ ...formData, basement: e.target.checked })}
          />
          <span className="text-sm text-gray-700">Basement</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={formData.garage}
            onChange={(e) => setFormData({ ...formData, garage: e.target.checked })}
          />
          <span className="text-sm text-gray-700">Garage</span>
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading('submitPreferences')}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isLoading('submitPreferences')}
        >
          Save Preferences
        </Button>
      </div>
    </form>
  );
} 