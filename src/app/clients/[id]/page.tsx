'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    loadClient();
  }, []);

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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!client) {
    return <div>Client not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Client details */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{client.name}</h1>
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
        <div className="bg-white shadow rounded-lg p-6 mb-6">
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
              <p className="text-gray-900">{client.requirements.preferredLocations.join(', ')}</p>
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
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Shared Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {client.sharedProperties.map((shared) => (
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
          ))}
        </div>
      </div>

      {/* Interactions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Interactions</h2>
        <div className="space-y-4">
          {client.interactions.map((interaction) => (
            <div key={interaction.id} className="border-b pb-4">
              <p className="text-sm text-gray-500">
                {new Date(interaction.date).toLocaleDateString()}
              </p>
              <p className="font-medium">{interaction.type}</p>
              <p className="text-gray-600">{interaction.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 