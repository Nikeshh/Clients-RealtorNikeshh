'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast-context';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  type: string;
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  status: string;
  location: string;
}

interface Requirement {
  id: string;
  name: string;
  propertyType: string;
  budgetMin: number;
  budgetMax: number;
  bedrooms?: number;
  bathrooms?: number;
  preferredLocations: string[];
  additionalRequirements?: string;
  status: string;
  client: {
    id: string;
    name: string;
    email: string;
  };
}

export default function GatherPropertiesPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [propertyNotes, setPropertyNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    loadRequirementAndProperties();
  }, []);

  const loadRequirementAndProperties = async () => {
    try {
      // Load requirement details
      const reqResponse = await fetch(`/api/clients/requirements/${params.id}`);
      if (!reqResponse.ok) throw new Error('Failed to fetch requirement');
      const reqData = await reqResponse.json();
      setRequirement(reqData);

      // Load matching properties
      const propResponse = await fetch('/api/properties');
      if (!propResponse.ok) throw new Error('Failed to fetch properties');
      const propData = await propResponse.json();
      
      // Filter properties based on requirement criteria
      const filteredProperties = propData.filter((property: Property) => {
        const matchesType = property.type.toLowerCase() === reqData.propertyType.toLowerCase();
        const matchesBudget = property.price >= reqData.budgetMin && property.price <= reqData.budgetMax;
        const matchesBedrooms = !reqData.bedrooms || property.bedrooms === reqData.bedrooms;
        const matchesBathrooms = !reqData.bathrooms || property.bathrooms === reqData.bathrooms;
        const matchesLocation = reqData.preferredLocations.some((loc: string) => 
          property.location.toLowerCase().includes(loc.toLowerCase())
        );

        return matchesType && matchesBudget && matchesBedrooms && matchesBathrooms && matchesLocation;
      });

      setProperties(filteredProperties);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to load data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedProperties.length === 0) {
      addToast('Please select at least one property', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/clients/requirements/${params.id}/gather`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyIds: selectedProperties,
          notes: propertyNotes,
        }),
      });

      if (!response.ok) throw new Error('Failed to gather properties');

      addToast('Properties gathered successfully', 'success');
      router.push(`/clients/${requirement?.client.id}`);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to gather properties', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  if (!requirement) {
    return <div>Requirement not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gather Properties</h1>
        <p className="mt-2 text-sm text-gray-600">
          Requirement: {requirement.name} for {requirement.client.name}
        </p>
      </div>

      {/* Requirements Summary */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Requirement Details</h2>
        <dl className="grid grid-cols-2 gap-4">
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
          <div className="col-span-2">
            <dt className="text-sm text-gray-500">Preferred Locations</dt>
            <dd className="text-sm font-medium">{requirement.preferredLocations.join(', ')}</dd>
          </div>
        </dl>
      </div>

      {/* Matching Properties */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Matching Properties</h2>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedProperties.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Gathering...' : 'Gather Selected'}
          </button>
        </div>

        {properties.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            No properties match these requirements
          </p>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => (
              <div key={property.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedProperties.includes(property.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProperties([...selectedProperties, property.id]);
                      } else {
                        setSelectedProperties(selectedProperties.filter(id => id !== property.id));
                      }
                    }}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{property.title}</h3>
                    <p className="text-sm text-gray-500">{property.address}</p>
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span className="font-medium text-blue-600">
                        {formatCurrency(property.price)}
                      </span>
                      {property.bedrooms && <span>{property.bedrooms} beds</span>}
                      {property.bathrooms && <span>{property.bathrooms} baths</span>}
                      <span>{property.area} sqft</span>
                    </div>
                    {selectedProperties.includes(property.id) && (
                      <div className="mt-2">
                        <textarea
                          placeholder="Add notes about this property..."
                          value={propertyNotes[property.id] || ''}
                          onChange={(e) => setPropertyNotes({
                            ...propertyNotes,
                            [property.id]: e.target.value
                          })}
                          className="w-full text-sm border rounded-md p-2"
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 