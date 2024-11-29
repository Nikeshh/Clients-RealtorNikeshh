'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast-context';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import { formatCurrency, formatDate } from '@/lib/utils';
import AddInteractionModal from '@/components/AddInteractionModal';

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
  gatheredProperties: Array<{
    id: string;
    status: string;
    notes?: string;
    property: {
      id: string;
      title: string;
      price: number;
      address: string;
    };
  }>;
  interactions: Array<{
    id: string;
    type: string;
    date: string;
    description: string;
    notes?: string;
  }>;
}

export default function RequirementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const { setLoading, isLoading } = useLoadingStates();
  const [showAddInteractionModal, setShowAddInteractionModal] = useState(false);

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
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to load requirement details', 'error');
    } finally {
      setLoading('loadRequirement', false);
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
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{requirement.name}</h1>
          <p className="text-sm text-gray-500">
            Client: {requirement.client.name}
          </p>
        </div>
        <Button
          onClick={() => setShowAddInteractionModal(true)}
          variant="primary"
        >
          Add Interaction
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Type</dt>
                <dd className="text-sm font-medium">{requirement.type}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Property Type</dt>
                <dd className="text-sm font-medium">{requirement.propertyType}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Budget Range</dt>
                <dd className="text-sm font-medium">
                  {formatCurrency(requirement.budgetMin)} - {formatCurrency(requirement.budgetMax)}
                </dd>
              </div>
              {requirement.bedrooms && (
                <div>
                  <dt className="text-sm text-gray-500">Bedrooms</dt>
                  <dd className="text-sm font-medium">{requirement.bedrooms}</dd>
                </div>
              )}
              {requirement.bathrooms && (
                <div>
                  <dt className="text-sm text-gray-500">Bathrooms</dt>
                  <dd className="text-sm font-medium">{requirement.bathrooms}</dd>
                </div>
              )}
              {requirement.preferredLocations.length > 0 && (
                <div className="col-span-2">
                  <dt className="text-sm text-gray-500">Preferred Locations</dt>
                  <dd className="text-sm font-medium">
                    {requirement.preferredLocations.join(', ')}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Type-specific Preferences */}
          {requirement.type === 'RENTAL' && requirement.rentalPreferences && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Rental Preferences</h2>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Lease Term</dt>
                  <dd className="text-sm font-medium">{requirement.rentalPreferences.leaseTerm}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Features</dt>
                  <dd className="text-sm font-medium">
                    {requirement.rentalPreferences.furnished && 'Furnished • '}
                    {requirement.rentalPreferences.petsAllowed && 'Pets Allowed'}
                  </dd>
                </div>
                {requirement.rentalPreferences.preferredMoveInDate && (
                  <div>
                    <dt className="text-sm text-gray-500">Preferred Move-in Date</dt>
                    <dd className="text-sm font-medium">
                      {formatDate(requirement.rentalPreferences.preferredMoveInDate)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {requirement.type === 'PURCHASE' && requirement.purchasePreferences && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Purchase Preferences</h2>
              <dl className="grid grid-cols-2 gap-4">
                {requirement.purchasePreferences.propertyAge && (
                  <div>
                    <dt className="text-sm text-gray-500">Property Age</dt>
                    <dd className="text-sm font-medium">{requirement.purchasePreferences.propertyAge}</dd>
                  </div>
                )}
                {requirement.purchasePreferences.preferredStyle && (
                  <div>
                    <dt className="text-sm text-gray-500">Preferred Style</dt>
                    <dd className="text-sm font-medium">{requirement.purchasePreferences.preferredStyle}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-gray-500">Features</dt>
                  <dd className="text-sm font-medium">
                    {requirement.purchasePreferences.basement && 'Basement • '}
                    {requirement.purchasePreferences.garage && 'Garage'}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Gathered Properties */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Gathered Properties</h2>
              <Button
                onClick={() => router.push(`/clients/requirements/${requirement.id}/gather`)}
                variant="secondary"
              >
                Gather Properties
              </Button>
            </div>
            {requirement.gatheredProperties.length > 0 ? (
              <div className="space-y-4">
                {requirement.gatheredProperties.map((gathered) => (
                  <div key={gathered.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">{gathered.property.title}</h3>
                      <p className="text-sm text-gray-500">{gathered.property.address}</p>
                      <p className="text-sm font-medium">{formatCurrency(gathered.property.price)}</p>
                    </div>
                    <span className="px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                      {gathered.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                No properties gathered yet
              </p>
            )}
          </div>
        </div>

        {/* Interactions Timeline */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Interactions</h2>
          {requirement.interactions?.length > 0 ? (
            <div className="flow-root">
              <ul className="-mb-8">
                {requirement.interactions.map((interaction, idx) => (
                  <li key={interaction.id}>
                    <div className="relative pb-8">
                      {idx !== requirement.interactions.length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                            <span className="text-white text-sm">
                              {interaction.type[0]}
                            </span>
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-500">
                              {interaction.description}
                            </p>
                            {interaction.notes && (
                              <p className="mt-1 text-sm text-gray-600">
                                {interaction.notes}
                              </p>
                            )}
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500">
                            {formatDate(interaction.date)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              No interactions recorded yet
            </p>
          )}
        </div>
      </div>

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