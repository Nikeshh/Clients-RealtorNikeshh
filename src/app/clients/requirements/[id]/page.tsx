'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast-context';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import { formatCurrency, formatDate } from '@/lib/utils';
import AddInteractionModal from '@/components/AddInteractionModal';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';

interface Requirement {
  id: string;
  name: string;
  type: 'PURCHASE' | 'RENTAL';
  propertyType: string;
  budgetMin: number;
  budgetMax: number;
  bedrooms: number | null;
  bathrooms: number | null;
  preferredLocations: string[];
  additionalRequirements?: string;
  status: string;
  client: {
    id: string;
    name: string;
  };
  rentalPreferences?: {
    leaseTerm: string;
    furnished: boolean;
    petsAllowed: boolean;
    maxRentalBudget: number;
    preferredMoveInDate?: Date;
  };
  purchasePreferences?: {
    propertyAge?: string;
    preferredStyle?: string;
    parking?: number;
    lotSize?: number;
    basement: boolean;
    garage: boolean;
  };
  interactions: Array<{
    id: string;
    type: string;
    date: string;
    description: string;
    notes?: string;
  }>;
}

export default function RequirementPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedRequirement, setEditedRequirement] = useState<Requirement | null>(null);
  const [showAddInteractionModal, setShowAddInteractionModal] = useState(false);
  const { setLoading, isLoading } = useLoadingStates();

  useEffect(() => {
    loadRequirement();
  }, []);

  const loadRequirement = async () => {
    setLoading('loadRequirement', true);
    try {
      const response = await fetch(`/api/clients/requirements/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch requirement');
      const data = await response.json();
      setRequirement(data);
      setEditedRequirement(data);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to load requirement details', 'error');
    } finally {
      setLoading('loadRequirement', false);
    }
  };

  const handleDelete = async () => {
    if (!requirement) return;

    setLoading('deleteRequirement', true);
    try {
      const response = await fetch(`/api/clients/requirements/${requirement.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete requirement');

      addToast('Requirement deleted successfully', 'success');
      router.push(`/clients/${requirement.client.id}`);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to delete requirement', 'error');
    } finally {
      setLoading('deleteRequirement', false);
      setShowDeleteModal(false);
    }
  };

  const handleEdit = async () => {
    if (!editedRequirement) return;

    setLoading('editRequirement', true);
    try {
      const response = await fetch(`/api/clients/requirements/${editedRequirement.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedRequirement),
      });

      if (!response.ok) throw new Error('Failed to update requirement');

      const updatedRequirement = await response.json();
      setRequirement(updatedRequirement);
      addToast('Requirement updated successfully', 'success');
      setShowEditModal(false);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update requirement', 'error');
    } finally {
      setLoading('editRequirement', false);
    }
  };

  const handleInteractionAdded = () => {
    loadRequirement();
  };

  if (isLoading('loadRequirement')) {
    return <LoadingSpinner size="large" />;
  }

  if (!requirement) {
    return <div>Requirement not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link 
            href={`/clients/${requirement.client.id}`}
            className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
          >
            ← Back to {requirement.client.name}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{requirement.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowEditModal(true)}
            variant="primary"
          >
            Edit
          </Button>
          <Button
            onClick={() => setShowDeleteModal(true)}
            variant="danger"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Requirement Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirement Details</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="mt-1 text-sm text-gray-900">{requirement.type}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Property Type</dt>
                <dd className="mt-1 text-sm text-gray-900">{requirement.propertyType}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Budget Range</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatCurrency(requirement.budgetMin)} - {formatCurrency(requirement.budgetMax)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">{requirement.status}</dd>
              </div>
              {requirement.bedrooms && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Bedrooms</dt>
                  <dd className="mt-1 text-sm text-gray-900">{requirement.bedrooms}</dd>
                </div>
              )}
              {requirement.bathrooms && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Bathrooms</dt>
                  <dd className="mt-1 text-sm text-gray-900">{requirement.bathrooms}</dd>
                </div>
              )}
              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500">Preferred Locations</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {requirement.preferredLocations.join(', ')}
                </dd>
              </div>
              {requirement.additionalRequirements && (
                <div className="col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Additional Requirements</dt>
                  <dd className="mt-1 text-sm text-gray-900">{requirement.additionalRequirements}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Type-specific Preferences */}
          {requirement.type === 'RENTAL' && requirement.rentalPreferences && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Rental Preferences</h2>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Lease Term</dt>
                  <dd className="mt-1 text-sm text-gray-900">{requirement.rentalPreferences.leaseTerm}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Features</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {requirement.rentalPreferences.furnished && 'Furnished • '}
                    {requirement.rentalPreferences.petsAllowed && 'Pets Allowed'}
                  </dd>
                </div>
                {requirement.rentalPreferences.preferredMoveInDate && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Preferred Move-in Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(requirement.rentalPreferences.preferredMoveInDate)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {requirement.type === 'PURCHASE' && requirement.purchasePreferences && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Purchase Preferences</h2>
              <dl className="grid grid-cols-2 gap-4">
                {requirement.purchasePreferences.propertyAge && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Property Age</dt>
                    <dd className="mt-1 text-sm text-gray-900">{requirement.purchasePreferences.propertyAge}</dd>
                  </div>
                )}
                {requirement.purchasePreferences.preferredStyle && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Preferred Style</dt>
                    <dd className="mt-1 text-sm text-gray-900">{requirement.purchasePreferences.preferredStyle}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Features</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {requirement.purchasePreferences.basement && 'Basement • '}
                    {requirement.purchasePreferences.garage && 'Garage'}
                  </dd>
                </div>
                {requirement.purchasePreferences.lotSize && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Minimum Lot Size</dt>
                    <dd className="mt-1 text-sm text-gray-900">{requirement.purchasePreferences.lotSize} sqft</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Gathered Properties */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Gathered Properties</h2>
              <Link href={`/clients/requirements/${requirement.id}/gather`}>
                <Button variant="primary">Gather Properties</Button>
              </Link>
            </div>
            {/* ... gathered properties content ... */}
          </div>
        </div>

        {/* Right Column - Interactions */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Interactions</h2>
              <Button
                onClick={() => setShowAddInteractionModal(true)}
                variant="primary"
              >
                Add Interaction
              </Button>
            </div>
            
            <div className="space-y-4">
              {requirement.interactions?.map((interaction) => (
                <div 
                  key={interaction.id} 
                  className="border-l-4 border-blue-500 pl-4 py-2"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-900">
                      {interaction.type}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(interaction.date)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {interaction.description}
                  </p>
                  {interaction.notes && (
                    <p className="text-sm text-gray-500 mt-1 italic">
                      {interaction.notes}
                    </p>
                  )}
                </div>
              ))}

              {requirement.interactions?.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No interactions yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Requirement"
      >
        <div className="space-y-4">
          <p className="text-gray-500">
            Are you sure you want to delete this requirement? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => setShowDeleteModal(false)}
              variant="secondary"
              disabled={isLoading('deleteRequirement')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="danger"
              isLoading={isLoading('deleteRequirement')}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Requirement"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={editedRequirement?.name || ''}
              onChange={(e) => setEditedRequirement(prev => ({ ...prev!, name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Property Type</label>
            <input
              type="text"
              value={editedRequirement?.propertyType || ''}
              onChange={(e) => setEditedRequirement(prev => ({ ...prev!, propertyType: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Budget Min</label>
              <input
                type="number"
                value={editedRequirement?.budgetMin || ''}
                onChange={(e) => setEditedRequirement(prev => ({ ...prev!, budgetMin: parseFloat(e.target.value) }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Budget Max</label>
              <input
                type="number"
                value={editedRequirement?.budgetMax || ''}
                onChange={(e) => setEditedRequirement(prev => ({ ...prev!, budgetMax: parseFloat(e.target.value) }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
              <input
                type="number"
                value={editedRequirement?.bedrooms || ''}
                onChange={(e) => setEditedRequirement(prev => ({ ...prev!, bedrooms: parseInt(e.target.value) }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
              <input
                type="number"
                value={editedRequirement?.bathrooms || ''}
                onChange={(e) => setEditedRequirement(prev => ({ ...prev!, bathrooms: parseInt(e.target.value) }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Preferred Locations</label>
            {editedRequirement?.preferredLocations.map((location, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => {
                    const newLocations = [...editedRequirement.preferredLocations];
                    newLocations[index] = e.target.value;
                    setEditedRequirement(prev => ({ ...prev!, preferredLocations: newLocations }));
                  }}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newLocations = editedRequirement.preferredLocations.filter((_, i) => i !== index);
                      setEditedRequirement(prev => ({ ...prev!, preferredLocations: newLocations }));
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setEditedRequirement(prev => ({
                  ...prev!,
                  preferredLocations: [...prev!.preferredLocations, '']
                }));
              }}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
            >
              Add Location
            </button>
          </div>

          {editedRequirement?.type === 'RENTAL' && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium text-gray-900">Rental Preferences</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">Lease Term</label>
                <select
                  value={editedRequirement.rentalPreferences?.leaseTerm || 'Long-term'}
                  onChange={(e) => setEditedRequirement(prev => ({
                    ...prev!,
                    rentalPreferences: {
                      ...prev!.rentalPreferences!,
                      leaseTerm: e.target.value
                    }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="Short-term">Short-term</option>
                  <option value="Long-term">Long-term</option>
                </select>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editedRequirement.rentalPreferences?.furnished}
                    onChange={(e) => setEditedRequirement(prev => ({
                      ...prev!,
                      rentalPreferences: {
                        ...prev!.rentalPreferences!,
                        furnished: e.target.checked
                      }
                    }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Furnished</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editedRequirement.rentalPreferences?.petsAllowed}
                    onChange={(e) => setEditedRequirement(prev => ({
                      ...prev!,
                      rentalPreferences: {
                        ...prev!.rentalPreferences!,
                        petsAllowed: e.target.checked
                      }
                    }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Pets Allowed</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred Move-in Date</label>
                <input
                  type="date"
                  value={editedRequirement.rentalPreferences?.preferredMoveInDate?.toString().split('T')[0] || ''}
                  onChange={(e) => setEditedRequirement(prev => ({
                    ...prev!,
                    rentalPreferences: {
                      ...prev!.rentalPreferences!,
                      preferredMoveInDate: e.target.value ? new Date(e.target.value) : undefined
                    }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {editedRequirement?.type === 'PURCHASE' && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium text-gray-900">Purchase Preferences</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">Property Age</label>
                <select
                  value={editedRequirement.purchasePreferences?.propertyAge || ''}
                  onChange={(e) => setEditedRequirement(prev => ({
                    ...prev!,
                    purchasePreferences: {
                      ...prev!.purchasePreferences!,
                      propertyAge: e.target.value
                    }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Any</option>
                  <option value="New">New Construction</option>
                  <option value="0-5">0-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Property Style</label>
                <input
                  type="text"
                  value={editedRequirement.purchasePreferences?.preferredStyle || ''}
                  onChange={(e) => setEditedRequirement(prev => ({
                    ...prev!,
                    purchasePreferences: {
                      ...prev!.purchasePreferences!,
                      preferredStyle: e.target.value
                    }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editedRequirement.purchasePreferences?.basement}
                    onChange={(e) => setEditedRequirement(prev => ({
                      ...prev!,
                      purchasePreferences: {
                        ...prev!.purchasePreferences!,
                        basement: e.target.checked
                      }
                    }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Basement</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editedRequirement.purchasePreferences?.garage}
                    onChange={(e) => setEditedRequirement(prev => ({
                      ...prev!,
                      purchasePreferences: {
                        ...prev!.purchasePreferences!,
                        garage: e.target.checked
                      }
                    }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Garage</span>
                </label>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={editedRequirement?.status || ''}
              onChange={(e) => setEditedRequirement(prev => ({ ...prev!, status: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Additional Requirements</label>
            <textarea
              value={editedRequirement?.additionalRequirements || ''}
              onChange={(e) => setEditedRequirement(prev => ({ ...prev!, additionalRequirements: e.target.value }))}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              onClick={() => setShowEditModal(false)}
              variant="secondary"
              disabled={isLoading('editRequirement')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              variant="primary"
              isLoading={isLoading('editRequirement')}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Interaction Modal */}
      {showAddInteractionModal && (
        <AddInteractionModal
          isOpen={showAddInteractionModal}
          onClose={() => setShowAddInteractionModal(false)}
          clientId={requirement.client.id}
          requirementId={requirement.id}
          onSubmit={handleInteractionAdded}
        />
      )}
    </div>
  );
} 