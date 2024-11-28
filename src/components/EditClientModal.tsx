'use client';

import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import type { Client, ClientFormData } from '@/types/client';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onSave: (data: ClientFormData) => void;
}

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Closed', label: 'Closed' },
];

const PROPERTY_TYPES = [
  { value: 'Residential', label: 'Residential' },
  { value: 'Commercial', label: 'Commercial' },
  { value: 'Industrial', label: 'Industrial' },
];

export default function EditClientModal({
  isOpen,
  onClose,
  client,
  onSave
}: EditClientModalProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    name: client.name,
    email: client.email,
    phone: client.phone,
    status: client.status,
    requirements: {
      propertyType: client.requirements.propertyType,
      budgetMin: client.requirements.budgetMin,
      budgetMax: client.requirements.budgetMax,
      bedrooms: client.requirements.bedrooms,
      bathrooms: client.requirements.bathrooms,
      preferredLocations: [...client.requirements.preferredLocations],
      additionalRequirements: client.requirements.additionalRequirements
    }
  });
  const [newLocation, setNewLocation] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'requirements') {
        setFormData(prev => ({
          ...prev,
          requirements: {
            ...prev.requirements,
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'requirements') {
        setFormData(prev => ({
          ...prev,
          requirements: {
            ...prev.requirements,
            [child]: value ? Number(value) : null
          }
        }));
      }
    }
  };

  const addLocation = () => {
    if (newLocation.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: {
          ...prev.requirements,
          preferredLocations: [...prev.requirements.preferredLocations, newLocation.trim()]
        }
      }));
      setNewLocation('');
    }
  };

  const removeLocation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        preferredLocations: prev.requirements.preferredLocations.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving client:', error);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-auto max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-blue-900">
            Edit Client
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                <Select
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={STATUS_OPTIONS}
                />
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-4">Property Requirements</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Property Type"
                  name="requirements.propertyType"
                  value={formData.requirements.propertyType}
                  onChange={handleChange}
                  options={PROPERTY_TYPES}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Min Budget"
                    type="number"
                    name="requirements.budgetMin"
                    value={formData.requirements.budgetMin}
                    onChange={handleNumberChange}
                  />
                  <Input
                    label="Max Budget"
                    type="number"
                    name="requirements.budgetMax"
                    value={formData.requirements.budgetMax}
                    onChange={handleNumberChange}
                  />
                </div>
                <Input
                  label="Bedrooms"
                  type="number"
                  name="requirements.bedrooms"
                  value={formData.requirements.bedrooms || ''}
                  onChange={handleNumberChange}
                />
                <Input
                  label="Bathrooms"
                  type="number"
                  name="requirements.bathrooms"
                  value={formData.requirements.bathrooms || ''}
                  onChange={handleNumberChange}
                />
              </div>
            </div>

            {/* Preferred Locations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Locations
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Add location..."
                  fullWidth={false}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addLocation}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.requirements.preferredLocations.map((location, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {location}
                    <button
                      type="button"
                      onClick={() => removeLocation(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Additional Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Requirements
              </label>
              <textarea
                name="requirements.additionalRequirements"
                value={formData.requirements.additionalRequirements || ''}
                onChange={handleChange}
                rows={4}
                className="block w-full rounded-lg border border-blue-200 px-3 py-2 focus:border-blue-400 focus:ring-blue-400"
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
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 