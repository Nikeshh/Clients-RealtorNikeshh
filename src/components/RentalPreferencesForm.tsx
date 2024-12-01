'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from './Button';
import { Calendar } from 'lucide-react';

interface Props {
  clientId: string;
  requestId: string;
  requirementId: string;
  onSubmit: () => void;
  onCancel: () => void;
  initialData?: {
    leaseTerm: string;
    furnished: boolean;
    petsAllowed: boolean;
    maxRentalBudget: number;
    preferredMoveInDate?: string;
  };
}

export default function RentalPreferencesForm({ 
  clientId, 
  requestId, 
  requirementId, 
  onSubmit, 
  onCancel,
  initialData 
}: Props) {
  const [formData, setFormData] = useState({
    leaseTerm: initialData?.leaseTerm || 'LONG_TERM',
    furnished: initialData?.furnished || false,
    petsAllowed: initialData?.petsAllowed || false,
    maxRentalBudget: initialData?.maxRentalBudget || '',
    preferredMoveInDate: initialData?.preferredMoveInDate || '',
  });

  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('submitRentalPrefs', true);

    try {
      const response = await fetch(
        `/api/clients/${clientId}/requests/${requestId}/requirements/${requirementId}/rental-preferences`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            maxRentalBudget: parseFloat(formData.maxRentalBudget.toString()),
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to update rental preferences');
      
      addToast('Rental preferences updated successfully', 'success');
      onSubmit();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update rental preferences', 'error');
    } finally {
      setLoading('submitRentalPrefs', false);
    }
  };

  return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Lease Term
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.leaseTerm}
            onChange={(e) => setFormData({ ...formData, leaseTerm: e.target.value })}
            required
          >
            <option value="LONG_TERM">Long Term</option>
            <option value="SHORT_TERM">Short Term</option>
            <option value="FLEXIBLE">Flexible</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="furnished"
            checked={formData.furnished}
            onChange={(e) => setFormData({ ...formData, furnished: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="furnished" className="text-sm text-gray-700">
            Furnished Required
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="petsAllowed"
            checked={formData.petsAllowed}
            onChange={(e) => setFormData({ ...formData, petsAllowed: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="petsAllowed" className="text-sm text-gray-700">
            Pets Allowed Required
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Maximum Rental Budget
          </label>
          <input
            type="number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.maxRentalBudget}
            onChange={(e) => setFormData({ ...formData, maxRentalBudget: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Preferred Move-in Date
          </label>
          <div className="mt-1 relative">
            <input
              type="date"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-10"
              value={formData.preferredMoveInDate}
              onChange={(e) => setFormData({ ...formData, preferredMoveInDate: e.target.value })}
            />
            <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading('submitRentalPrefs')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading('submitRentalPrefs')}
          >
            Save Preferences
          </Button>
        </div>
      </form>
  );
} 