'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast-context';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import { formatCurrency } from '@/lib/utils';

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
}

interface Requirement {
  id: string;
  name: string;
  type: 'PURCHASE' | 'RENTAL';
  propertyType: string;
  budgetMin: number;
  budgetMax: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
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
}

export default function GatherPropertiesPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [propertyNotes, setPropertyNotes] = useState<Record<string, string>>({});
  const { setLoading, isLoading } = useLoadingStates();

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

      // Load matching properties
      const propsResponse = await fetch('/api/properties');
      if (!propsResponse.ok) throw new Error('Failed to fetch properties');
      const propsData = await propsResponse.json();

      // Filter properties based on requirement criteria
      const filteredProperties = propsData.filter((property: Property) => {
        // Basic criteria matching
        const matchesType = property.type.toLowerCase() === reqData.propertyType.toLowerCase();
        const matchesBudget = property.price >= reqData.budgetMin && property.price <= reqData.budgetMax;
        const matchesBedrooms = !reqData.bedrooms || (property.bedrooms ?? 0) >= reqData.bedrooms;
        const matchesBathrooms = !reqData.bathrooms || (property.bathrooms ?? 0) >= reqData.bathrooms;
        const matchesLocation = reqData.preferredLocations.length === 0 || 
          reqData.preferredLocations.some((loc: string) => 
            property.location.toLowerCase().includes(loc.toLowerCase())
          );

        // Type-specific criteria
        if (reqData.type === 'RENTAL' && reqData.rentalPreferences) {
          // Rental-specific matching
          const features = property.features.map(f => f.toLowerCase());
          const matchesFurnished = !reqData.rentalPreferences.furnished || 
            features.some(f => f.includes('furnished'));
          const matchesPets = !reqData.rentalPreferences.petsAllowed || 
            features.some(f => f.includes('pets allowed') || f.includes('pet friendly'));

          return matchesType && matchesBudget && matchesBedrooms && 
                 matchesBathrooms && matchesLocation && 
                 matchesFurnished && matchesPets;
        } else if (reqData.type === 'PURCHASE' && reqData.purchasePreferences) {
          // Purchase-specific matching
          const features = property.features.map(f => f.toLowerCase());
          const matchesBasement = !reqData.purchasePreferences.basement || 
            features.some(f => f.includes('basement'));
          const matchesGarage = !reqData.purchasePreferences.garage || 
            features.some(f => f.includes('garage'));
          const matchesLotSize = !reqData.purchasePreferences.lotSize || 
            property.area >= reqData.purchasePreferences.lotSize;

          // Property age matching
          let matchesAge = true;
          if (reqData.purchasePreferences.propertyAge) {
            const ageFeature = features.find(f => f.includes('built') || f.includes('year'));
            if (ageFeature) {
              const year = parseInt(ageFeature.match(/\d{4}/)?.[0] || '0');
              const currentYear = new Date().getFullYear();
              const age = currentYear - year;

              matchesAge = reqData.purchasePreferences.propertyAge === 'New' ? age <= 2 :
                          reqData.purchasePreferences.propertyAge === '0-5' ? age <= 5 :
                          reqData.purchasePreferences.propertyAge === '5-10' ? age <= 10 && age > 5 :
                          age > 10;
            }
          }

          return matchesType && matchesBudget && matchesBedrooms && 
                 matchesBathrooms && matchesLocation && 
                 matchesBasement && matchesGarage && 
                 matchesLotSize && matchesAge;
        }

        return matchesType && matchesBudget && matchesBedrooms && 
               matchesBathrooms && matchesLocation;
      });

      setProperties(filteredProperties);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to load data', 'error');
    } finally {
      setLoading('loadData', false);
    }
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
      router.push(`/clients/${requirement?.client.id}`);
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gather Properties</h1>
        <p className="mt-2 text-sm text-gray-600">
          Requirement: {requirement?.name} ({requirement?.type.toLowerCase()}) for {requirement?.client.name}
        </p>
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
              <dd className="text-sm font-medium">{requirement.bedrooms}</dd>
            </div>
          )}
          {requirement?.bathrooms && (
            <div>
              <dt className="text-sm text-gray-500">Bathrooms</dt>
              <dd className="text-sm font-medium">{requirement.bathrooms}</dd>
            </div>
          )}
          <div className="col-span-2">
            <dt className="text-sm text-gray-500">Preferred Locations</dt>
            <dd className="text-sm font-medium">{requirement?.preferredLocations.join(', ')}</dd>
          </div>
          {requirement?.type === 'RENTAL' && requirement.rentalPreferences && (
            <>
              <div>
                <dt className="text-sm text-gray-500">Lease Term</dt>
                <dd className="text-sm font-medium">{requirement.rentalPreferences.leaseTerm}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Preferences</dt>
                <dd className="text-sm font-medium">
                  {requirement.rentalPreferences.furnished && 'Furnished, '}
                  {requirement.rentalPreferences.petsAllowed && 'Pets Allowed'}
                </dd>
              </div>
              {requirement.rentalPreferences.preferredMoveInDate && (
                <div>
                  <dt className="text-sm text-gray-500">Preferred Move-in</dt>
                  <dd className="text-sm font-medium">
                    {new Date(requirement.rentalPreferences.preferredMoveInDate).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </>
          )}

          {requirement?.type === 'PURCHASE' && requirement.purchasePreferences && (
            <>
              {requirement.purchasePreferences.propertyAge && (
                <div>
                  <dt className="text-sm text-gray-500">Property Age</dt>
                  <dd className="text-sm font-medium">{requirement.purchasePreferences.propertyAge}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-gray-500">Features</dt>
                <dd className="text-sm font-medium">
                  {requirement.purchasePreferences.basement && 'Basement, '}
                  {requirement.purchasePreferences.garage && 'Garage'}
                </dd>
              </div>
              {requirement.purchasePreferences.lotSize && (
                <div>
                  <dt className="text-sm text-gray-500">Minimum Lot Size</dt>
                  <dd className="text-sm font-medium">{requirement.purchasePreferences.lotSize} sqft</dd>
                </div>
              )}
            </>
          )}
        </dl>
      </div>
    </div>
  );
} 