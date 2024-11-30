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
    rentalPreferences: {
      leaseTerm: '',
      furnished: false,
      petsAllowed: false,
      maxRentalBudget: '',
      preferredMoveInDate: ''
    },
    purchasePreferences: {
      propertyAge: '',
      preferredStyle: '',
      parking: '',
      lotSize: '',
      basement: false,
      garage: false
    }
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
        body: JSON.stringify({
          ...formData,
          budgetMin: parseFloat(formData.budgetMin),
          budgetMax: parseFloat(formData.budgetMax),
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          rentalPreferences: formData.type === 'RENTAL' ? {
            ...formData.rentalPreferences,
            maxRentalBudget: parseFloat(formData.rentalPreferences.maxRentalBudget)
          } : undefined,
          purchasePreferences: formData.type === 'PURCHASE' ? {
            ...formData.purchasePreferences,
            parking: formData.purchasePreferences.parking ? parseInt(formData.purchasePreferences.parking) : null,
            lotSize: formData.purchasePreferences.lotSize ? parseFloat(formData.purchasePreferences.lotSize) : null
          } : undefined
        }),
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
      {/* Basic Information */}
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

        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'PURCHASE' | 'RENTAL' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="PURCHASE">Purchase</option>
            <option value="RENTAL">Rental</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Property Type</label>
          <select
            value={formData.propertyType}
            onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select type</option>
            <option value="HOUSE">House</option>
            <option value="APARTMENT">Apartment</option>
            <option value="CONDO">Condo</option>
            <option value="TOWNHOUSE">Townhouse</option>
            <option value="LAND">Land</option>
          </select>
        </div>

        {/* Budget Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Minimum Budget</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                required
                value={formData.budgetMin}
                onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Maximum Budget</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                required
                value={formData.budgetMax}
                onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Bedrooms & Bathrooms */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
            <input
              type="number"
              value={formData.bedrooms}
              onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
            <input
              type="number"
              value={formData.bathrooms}
              onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Preferred Locations */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Preferred Locations</label>
          {formData.preferredLocations.map((location, index) => (
            <div key={index} className="mt-1 flex gap-2">
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  const newLocations = [...formData.preferredLocations];
                  newLocations[index] = e.target.value;
                  setFormData({ ...formData, preferredLocations: newLocations });
                }}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {index === formData.preferredLocations.length - 1 && (
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    preferredLocations: [...formData.preferredLocations, '']
                  })}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  +
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Type-specific preferences */}
        {formData.type === 'RENTAL' && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium text-gray-900">Rental Preferences</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Lease Term</label>
              <select
                value={formData.rentalPreferences.leaseTerm}
                onChange={(e) => setFormData({
                  ...formData,
                  rentalPreferences: { ...formData.rentalPreferences, leaseTerm: e.target.value }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select term</option>
                <option value="SHORT_TERM">Short Term</option>
                <option value="LONG_TERM">Long Term</option>
                <option value="FLEXIBLE">Flexible</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.rentalPreferences.furnished}
                  onChange={(e) => setFormData({
                    ...formData,
                    rentalPreferences: { ...formData.rentalPreferences, furnished: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Furnished</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.rentalPreferences.petsAllowed}
                  onChange={(e) => setFormData({
                    ...formData,
                    rentalPreferences: { ...formData.rentalPreferences, petsAllowed: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Pets Allowed</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Preferred Move-in Date</label>
              <input
                type="date"
                value={formData.rentalPreferences.preferredMoveInDate}
                onChange={(e) => setFormData({
                  ...formData,
                  rentalPreferences: { ...formData.rentalPreferences, preferredMoveInDate: e.target.value }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {formData.type === 'PURCHASE' && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium text-gray-900">Purchase Preferences</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Property Age</label>
                <select
                  value={formData.purchasePreferences.propertyAge}
                  onChange={(e) => setFormData({
                    ...formData,
                    purchasePreferences: { ...formData.purchasePreferences, propertyAge: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Any</option>
                  <option value="NEW">New Construction</option>
                  <option value="0-5">0-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10-20">10-20 years</option>
                  <option value="20+">20+ years</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Property Style</label>
                <select
                  value={formData.purchasePreferences.preferredStyle}
                  onChange={(e) => setFormData({
                    ...formData,
                    purchasePreferences: { ...formData.purchasePreferences, preferredStyle: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Any</option>
                  <option value="MODERN">Modern</option>
                  <option value="TRADITIONAL">Traditional</option>
                  <option value="CONTEMPORARY">Contemporary</option>
                  <option value="COLONIAL">Colonial</option>
                  <option value="VICTORIAN">Victorian</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Parking Spaces</label>
                <input
                  type="number"
                  value={formData.purchasePreferences.parking}
                  onChange={(e) => setFormData({
                    ...formData,
                    purchasePreferences: { ...formData.purchasePreferences, parking: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Lot Size (acres)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.purchasePreferences.lotSize}
                  onChange={(e) => setFormData({
                    ...formData,
                    purchasePreferences: { ...formData.purchasePreferences, lotSize: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.purchasePreferences.basement}
                  onChange={(e) => setFormData({
                    ...formData,
                    purchasePreferences: { ...formData.purchasePreferences, basement: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Basement</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.purchasePreferences.garage}
                  onChange={(e) => setFormData({
                    ...formData,
                    purchasePreferences: { ...formData.purchasePreferences, garage: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Garage</span>
              </label>
            </div>
          </div>
        )}

        {/* Additional Requirements */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Additional Requirements</label>
          <textarea
            value={formData.additionalRequirements}
            onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
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