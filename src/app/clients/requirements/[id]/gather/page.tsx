'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast-context';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  type: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area: number;
  status: string;
  location: string;
  features: string[];
  images: string[];
}

export default function GatherPropertiesPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const [requirement, setRequirement] = useState<any>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [propertyNotes, setPropertyNotes] = useState<Record<string, string>>({});
  const { setLoading, isLoading } = useLoadingStates();
  const [showMatchingOnly, setShowMatchingOnly] = useState(false);

  useEffect(() => {
    loadRequirementAndProperties();
  }, []);

  const loadRequirementAndProperties = async () => {
    setLoading('loadData', true);
    try {
      // Load requirement details
      const reqResponse = await fetch(`/api/clients/requirements/${params.id}`);
      if (!reqResponse.ok) throw new Error('Failed to fetch requirement');
      const reqData = await reqResponse.json();
      setRequirement(reqData);

      // Load all properties
      const propsResponse = await fetch('/api/properties');
      if (!propsResponse.ok) throw new Error('Failed to fetch properties');
      const propsData = await propsResponse.json();

      // Filter out already gathered properties
      const gatheredPropertyIds = new Set(reqData.gatheredProperties.map((gp: any) => gp.property.id));
      const availableProperties = propsData.filter((property: Property) => !gatheredPropertyIds.has(property.id));
      
      setProperties(availableProperties);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to load data', 'error');
    } finally {
      setLoading('loadData', false);
    }
  };

  const isPropertyMatching = (property: Property) => {
    if (!requirement) return false;

    const matchesType = property.type.toLowerCase() === requirement.propertyType.toLowerCase();
    const matchesBudget = property.price >= requirement.budgetMin && property.price <= requirement.budgetMax;
    const matchesBedrooms = !requirement.bedrooms || (property.bedrooms ?? 0) >= requirement.bedrooms;
    const matchesBathrooms = !requirement.bathrooms || (property.bathrooms ?? 0) >= requirement.bathrooms;
    const matchesLocation = requirement.preferredLocations.length === 0 || 
      requirement.preferredLocations.some((loc: string) => 
        property.location.toLowerCase().includes(loc.toLowerCase())
      );

    return matchesType && matchesBudget && matchesBedrooms && matchesBathrooms && matchesLocation;
  };

  const filteredProperties = showMatchingOnly 
    ? properties.filter(isPropertyMatching)
    : properties;

  const handlePropertySelect = (propertyId: string) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleNoteChange = (propertyId: string, note: string) => {
    setPropertyNotes(prev => ({
      ...prev,
      [propertyId]: note
    }));
  };

  const handleSubmit = async () => {
    if (selectedProperties.length === 0) {
      addToast('Please select at least one property', 'error');
      return;
    }

    setLoading('submitGather', true);
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
      router.push(`/clients/requirements/${params.id}`);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to gather properties', 'error');
    } finally {
      setLoading('submitGather', false);
    }
  };

  if (isLoading('loadData')) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link 
            href={`/clients/requirements/${params.id}`}
            className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
          >
            ← Back to Requirement
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Gather Properties</h1>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showMatchingOnly}
              onChange={(e) => setShowMatchingOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Show matching only</span>
          </label>
        </div>
      </div>

      {/* Requirements Summary */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Requirement Details</h2>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-500">Property Type</dt>
            <dd className="text-sm font-medium">{requirement?.propertyType}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Budget Range</dt>
            <dd className="text-sm font-medium">
              {formatCurrency(requirement?.budgetMin || 0)} - {formatCurrency(requirement?.budgetMax || 0)}
            </dd>
          </div>
          {requirement?.bedrooms && (
            <div>
              <dt className="text-sm text-gray-500">Bedrooms</dt>
              <dd className="text-sm font-medium">{requirement.bedrooms}+</dd>
            </div>
          )}
          {requirement?.bathrooms && (
            <div>
              <dt className="text-sm text-gray-500">Bathrooms</dt>
              <dd className="text-sm font-medium">{requirement.bathrooms}+</dd>
            </div>
          )}
          <div className="col-span-2">
            <dt className="text-sm text-gray-500">Preferred Locations</dt>
            <dd className="text-sm font-medium">
              {requirement?.preferredLocations.join(', ') || 'Any'}
            </dd>
          </div>
        </dl>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <div 
            key={property.id} 
            className={`relative bg-white shadow rounded-lg overflow-hidden
              ${isPropertyMatching(property) ? 'ring-2 ring-green-500' : ''}
            `}
          >
            {property.images[0] && (
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="object-cover w-full h-48"
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <input
                  type="checkbox"
                  checked={selectedProperties.includes(property.id)}
                  onChange={() => handlePropertySelect(property.id)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(property.price)}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{property.title}</h3>
              <p className="text-gray-600 text-sm mb-2">{property.address}</p>
              <div className="flex gap-4 text-sm text-gray-500 mb-4">
                {property.bedrooms && <span>{property.bedrooms} beds</span>}
                {property.bathrooms && <span>{property.bathrooms} baths</span>}
                <span>{property.area} sqft</span>
              </div>
              {selectedProperties.includes(property.id) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={propertyNotes[property.id] || ''}
                    onChange={(e) => handleNoteChange(property.id, e.target.value)}
                    rows={2}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Add notes about this property..."
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {properties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {requirement?.gatheredProperties?.length > 0 
              ? 'All available properties have already been gathered.'
              : 'No properties available.'}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end gap-4">
        <Button
          onClick={() => router.back()}
          variant="secondary"
          disabled={isLoading('submitGather')}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="primary"
          disabled={selectedProperties.length === 0}
          isLoading={isLoading('submitGather')}
        >
          Gather Selected Properties ({selectedProperties.length})
        </Button>
      </div>
    </div>
  );
} 