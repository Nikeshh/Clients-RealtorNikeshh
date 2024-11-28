'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast-context';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ClientRequirements {
  propertyType: string;
  budgetMin: number;
  budgetMax: number;
  bedrooms: number | null;
  bathrooms: number | null;
  preferredLocations: string[];
  additionalRequirements?: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  requirements: ClientRequirements;
  interactions: Array<{
    id: string;
    type: string;
    date: string;
    description: string;
  }>;
  sharedProperties: Array<{
    id: string;
    sharedDate: string;
    property: {
      id: string;
      title: string;
      address: string;
      price: number;
    };
  }>;
}

export default function ClientPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    loadClient();
  }, []);

  useEffect(() => {
    if (client && !editedData) {
      setEditedData({
        name: client.name,
        email: client.email,
        phone: client.phone,
        status: client.status,
        requirements: {
          ...client.requirements,
          preferredLocations: [...client.requirements.preferredLocations],
        },
      });
    }
  }, [client]);

  const loadClient = async () => {
    try {
      const response = await fetch(`/api/clients/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch client');
      const data = await response.json();
      setClient(data);
    } catch (error) {
      addToast('Failed to load client details', 'error');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/clients/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...client,
          status: newStatus,
        }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      const updatedClient = await response.json();
      setClient(updatedClient);
      addToast('Status updated successfully', 'success');
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update status', 'error');
    }
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`/api/clients/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedData),
      });

      if (!response.ok) throw new Error('Failed to update client');

      const updatedClient = await response.json();
      setClient(updatedClient);
      setIsEditing(false);
      addToast('Client updated successfully', 'success');
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update client', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/clients/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete client');

      addToast('Client deleted successfully', 'success');
      router.push('/clients');
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to delete client', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLocationChange = (index: number, value: string) => {
    setEditedData({
      ...editedData,
      requirements: {
        ...editedData.requirements,
        preferredLocations: editedData.requirements.preferredLocations.map(
          (loc: string, i: number) => (i === index ? value : loc)
        ),
      },
    });
  };

  const addLocation = () => {
    setEditedData({
      ...editedData,
      requirements: {
        ...editedData.requirements,
        preferredLocations: [...editedData.requirements.preferredLocations, ''],
      },
    });
  };

  const removeLocation = (index: number) => {
    setEditedData({
      ...editedData,
      requirements: {
        ...editedData.requirements,
        preferredLocations: editedData.requirements.preferredLocations.filter(
          (_: string, i: number) => i !== index
        ),
      },
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!client) {
    return <div>Client not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Actions */}
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Client' : client?.name}
        </h1>
        <div className="flex items-center gap-4">
          {!isEditing && (
            <>
              <select
                value={client?.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Lead">Lead</option>
              </select>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={editedData.name}
                  onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={editedData.email}
                  onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={editedData.phone}
                  onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={editedData.status}
                  onChange={(e) => setEditedData({ ...editedData, status: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Lead">Lead</option>
                </select>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Requirements</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Property Type</label>
                <select
                  value={editedData.requirements.propertyType}
                  onChange={(e) => setEditedData({
                    ...editedData,
                    requirements: { ...editedData.requirements, propertyType: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
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
                    value={editedData.requirements.budgetMin}
                    onChange={(e) => setEditedData({
                      ...editedData,
                      requirements: { ...editedData.requirements, budgetMin: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Budget Max</label>
                  <input
                    type="number"
                    value={editedData.requirements.budgetMax}
                    onChange={(e) => setEditedData({
                      ...editedData,
                      requirements: { ...editedData.requirements, budgetMax: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                  <input
                    type="number"
                    value={editedData.requirements.bedrooms || ''}
                    onChange={(e) => setEditedData({
                      ...editedData,
                      requirements: { ...editedData.requirements, bedrooms: e.target.value ? parseInt(e.target.value) : null }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                  <input
                    type="number"
                    value={editedData.requirements.bathrooms || ''}
                    onChange={(e) => setEditedData({
                      ...editedData,
                      requirements: { ...editedData.requirements, bathrooms: e.target.value ? parseInt(e.target.value) : null }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Locations
                </label>
                {editedData.requirements.preferredLocations.map((location: string, index: number) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => handleLocationChange(index, e.target.value)}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                  value={editedData.requirements.additionalRequirements || ''}
                  onChange={(e) => setEditedData({
                    ...editedData,
                    requirements: { ...editedData.requirements, additionalRequirements: e.target.value }
                  })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Client details */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900">{client.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-900">{client.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-gray-900">{client.status}</p>
              </div>
            </div>
          </div>

          {/* Requirements */}
          {client.requirements && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Property Type</p>
                  <p className="text-gray-900">{client.requirements.propertyType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Budget Range</p>
                  <p className="text-gray-900">
                    {formatCurrency(client.requirements.budgetMin)} - {formatCurrency(client.requirements.budgetMax)}
                  </p>
                </div>
                {client.requirements.bedrooms && (
                  <div>
                    <p className="text-sm text-gray-500">Bedrooms</p>
                    <p className="text-gray-900">{client.requirements.bedrooms}</p>
                  </div>
                )}
                {client.requirements.bathrooms && (
                  <div>
                    <p className="text-sm text-gray-500">Bathrooms</p>
                    <p className="text-gray-900">{client.requirements.bathrooms}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Preferred Locations</p>
                  <p className="text-gray-900">
                    {client.requirements.preferredLocations?.join(', ') || 'None specified'}
                  </p>
                </div>
                {client.requirements.additionalRequirements && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Additional Requirements</p>
                    <p className="text-gray-900">{client.requirements.additionalRequirements}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Shared Properties */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Shared Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {client.sharedProperties?.length > 0 ? (
                client.sharedProperties.map((shared) => (
                  <div key={shared.id} className="border rounded-lg p-4">
                    <h3 className="font-medium">{shared.property.title}</h3>
                    <p className="text-sm text-gray-500">{shared.property.address}</p>
                    <p className="text-sm font-medium text-blue-600">
                      {formatCurrency(shared.property.price)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Shared on {new Date(shared.sharedDate).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500">
                  No properties shared yet
                </div>
              )}
            </div>
          </div>

          {/* Interactions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Interactions</h2>
            <div className="space-y-4">
              {client.interactions?.length > 0 ? (
                client.interactions.map((interaction) => (
                  <div key={interaction.id} className="border-b pb-4">
                    <p className="text-sm text-gray-500">
                      {new Date(interaction.date).toLocaleDateString()}
                    </p>
                    <p className="font-medium">{interaction.type}</p>
                    <p className="text-gray-600">{interaction.description}</p>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">
                  No interactions recorded
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 