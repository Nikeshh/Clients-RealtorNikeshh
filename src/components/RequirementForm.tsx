'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from './Button';
import Modal from './ui/Modal';

interface Requirement {
  id: string;
  name: string;
  type: string;
  propertyType: string;
  budgetMin: number;
  budgetMax: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  preferredLocations: string[];
  additionalRequirements?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  requestId: string | null;
}

interface Props {
  clientId: string;
  requestId: string;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  initialData?: Requirement;
  isEditing?: boolean;
}

export default function RequirementForm({ 
  clientId, 
  requestId, 
  onSubmit, 
  onCancel,
  initialData,
  isEditing = false 
}: Props) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'PURCHASE',
    propertyType: initialData?.propertyType || 'HOUSE',
    budgetMin: initialData?.budgetMin || 0,
    budgetMax: initialData?.budgetMax || 0,
    bedrooms: initialData?.bedrooms || 0,
    bathrooms: initialData?.bathrooms || 0,
    preferredLocations: initialData?.preferredLocations || [],
    additionalRequirements: initialData?.additionalRequirements || '',
    status: initialData?.status || 'Active',
  });

  const [location, setLocation] = useState('');
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('submitRequirement', true);

    try {
      const url = isEditing 
        ? `/api/clients/${clientId}/requests/${requestId}/requirements/${initialData?.id}`
        : `/api/clients/${clientId}/requests/${requestId}/requirements`;

      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          budgetMin: Number(formData.budgetMin),
          budgetMax: Number(formData.budgetMax),
          bedrooms: Number(formData.bedrooms) || null,
          bathrooms: Number(formData.bathrooms) || null,
        }),
      });

      if (!response.ok) throw new Error(`Failed to ${isEditing ? 'update' : 'create'} requirement`);
      
      const data = await response.json();
      addToast(`Requirement ${isEditing ? 'updated' : 'created'} successfully`, 'success');
      onSubmit(data);
    } catch (error) {
      console.error('Error:', error);
      addToast(`Failed to ${isEditing ? 'update' : 'create'} requirement`, 'error');
    } finally {
      setLoading('submitRequirement', false);
    }
  };

  const addLocation = () => {
    if (location && !formData.preferredLocations.includes(location)) {
      setFormData({
        ...formData,
        preferredLocations: [...formData.preferredLocations, location],
      });
      setLocation('');
    }
  };

  const removeLocation = (locationToRemove: string) => {
    setFormData({
      ...formData,
      preferredLocations: formData.preferredLocations.filter(loc => loc !== locationToRemove),
    });
  };

  return (
    <Modal isOpen={true} onClose={onCancel} title={isEditing ? "Edit Requirement" : "Add Requirement"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            >
              <option value="PURCHASE">Purchase</option>
              <option value="RENTAL">Rental</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Property Type
            </label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.propertyType}
              onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
              required
            >
              <option value="HOUSE">House</option>
              <option value="APARTMENT">Apartment</option>
              <option value="CONDO">Condo</option>
              <option value="LAND">Land</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Min Budget
            </label>
            <input
              type="number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.budgetMin}
              onChange={(e) => setFormData({ ...formData, budgetMin: parseFloat(e.target.value) })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Max Budget
            </label>
            <input
              type="number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.budgetMax}
              onChange={(e) => setFormData({ ...formData, budgetMax: parseFloat(e.target.value) })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bedrooms
            </label>
            <input
              type="number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.bedrooms}
              onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bathrooms
            </label>
            <input
              type="number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.bathrooms}
              onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Preferred Locations
          </label>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
            />
            <Button
              type="button"
              onClick={addLocation}
            >
              Add
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.preferredLocations.map((loc) => (
              <span
                key={loc}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {loc}
                <button
                  type="button"
                  className="ml-1 text-blue-600 hover:text-blue-800"
                  onClick={() => removeLocation(loc)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Additional Requirements
          </label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
            value={formData.additionalRequirements}
            onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading('submitRequirement')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading('submitRequirement')}
          >
            {isEditing ? 'Update' : 'Create'} Requirement
          </Button>
        </div>
      </form>
    </Modal>
  );
} 