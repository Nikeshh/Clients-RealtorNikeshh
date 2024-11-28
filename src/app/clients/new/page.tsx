'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast-context';

export default function NewClientPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'Active',
    requirements: {
      propertyType: '',
      budgetMin: '',
      budgetMax: '',
      bedrooms: '',
      bathrooms: '',
      preferredLocations: [''],
      additionalRequirements: '',
    },
  });
  const [existingClients, setExistingClients] = useState<any[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const validateClient = async (data: any) => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'validate',
          ...data
        }),
      });

      const result = await response.json();

      if (response.status === 409) {
        setExistingClients(result.matches);
        setShowConfirmation(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error validating client:', error);
      addToast('Failed to validate client', 'error');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // First, validate the client
    const hasExisting = await validateClient(formData);
    if (hasExisting) {
      return; // Stop here and wait for user confirmation
    }

    await createClient(false);
  };

  const createClient = async (force: boolean) => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          forceCreate: force
        }),
      });

      if (!response.ok) throw new Error('Failed to create client');

      addToast('Client created successfully', 'success');
      router.push('/clients');
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to create client', 'error');
    }
  };

  const handleLocationChange = (index: number, value: string) => {
    const newLocations = [...formData.requirements.preferredLocations];
    newLocations[index] = value;
    setFormData({
      ...formData,
      requirements: {
        ...formData.requirements,
        preferredLocations: newLocations,
      },
    });
  };

  const addLocation = () => {
    setFormData({
      ...formData,
      requirements: {
        ...formData.requirements,
        preferredLocations: [...formData.requirements.preferredLocations, ''],
      },
    });
  };

  const removeLocation = (index: number) => {
    const newLocations = formData.requirements.preferredLocations.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      requirements: {
        ...formData.requirements,
        preferredLocations: newLocations,
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Add New Client</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Lead">Lead</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Requirements</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Property Type</label>
              <select
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.requirements.propertyType}
                onChange={(e) => setFormData({
                  ...formData,
                  requirements: { ...formData.requirements, propertyType: e.target.value }
                })}
              >
                <option value="">Select type</option>
                <option value="House">House</option>
                <option value="Apartment">Apartment</option>
                <option value="Condo">Condo</option>
                <option value="Land">Land</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Budget Min</label>
                <input
                  type="number"
                  required
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.requirements.budgetMin}
                  onChange={(e) => setFormData({
                    ...formData,
                    requirements: { ...formData.requirements, budgetMin: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Budget Max</label>
                <input
                  type="number"
                  required
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.requirements.budgetMax}
                  onChange={(e) => setFormData({
                    ...formData,
                    requirements: { ...formData.requirements, budgetMax: e.target.value }
                  })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.requirements.bedrooms}
                  onChange={(e) => setFormData({
                    ...formData,
                    requirements: { ...formData.requirements, bedrooms: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.requirements.bathrooms}
                  onChange={(e) => setFormData({
                    ...formData,
                    requirements: { ...formData.requirements, bathrooms: e.target.value }
                  })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Locations
              </label>
              {formData.requirements.preferredLocations.map((location, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    required
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={location}
                    onChange={(e) => handleLocationChange(index, e.target.value)}
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeLocation(index)}
                      className="px-2 py-1 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addLocation}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
              >
                Add Location
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Additional Requirements</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={3}
                value={formData.requirements.additionalRequirements}
                onChange={(e) => setFormData({
                  ...formData,
                  requirements: { ...formData.requirements, additionalRequirements: e.target.value }
                })}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Client'}
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Clients Found</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                We found similar clients in the system. Would you like to proceed with creating a new client?
              </p>
              <div className="mt-4 space-y-3">
                {existingClients.map((client) => (
                  <div key={client.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-gray-500">{client.email}</p>
                    <p className="text-sm text-gray-500">{client.phone}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  createClient(true);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Create Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 