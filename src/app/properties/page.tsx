'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from '@/components/Button';
import { Plus, Building2, Share2 } from 'lucide-react';
import SharePropertiesModal from '@/components/SharePropertiesModal';
import Link from 'next/link';

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  type: string;
  listingType: string;
  status: string;
  images?: string[];
  bedrooms?: number;
  bathrooms?: number;
  area: number;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading('loadProperties', true);
    try {
      const response = await fetch('/api/properties');
      if (!response.ok) throw new Error('Failed to fetch properties');
      const data = await response.json();
      setProperties(data);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to load properties', 'error');
    } finally {
      setLoading('loadProperties', false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Properties</h1>
        <Link href="/properties/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </Link>
      </div>

      {isLoading('loadProperties') ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="relative h-48">
                {property.images?.[0] ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Building2 className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => {
                      setSelectedProperty(property);
                      setShowShareModal(true);
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4">
                <Link href={`/properties/${property.id}`}>
                  <h2 className="font-semibold text-lg mb-1 hover:text-blue-600">
                    {property.title}
                  </h2>
                </Link>
                <p className="text-gray-500 text-sm mb-2">{property.address}</p>
                <p className="font-medium text-lg mb-2">
                  {formatPrice(property.price)}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {property.bedrooms && <span>{property.bedrooms} beds</span>}
                  {property.bathrooms && <span>{property.bathrooms} baths</span>}
                  <span>{property.area} sqft</span>
                </div>
                <div className="mt-2 flex gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {property.type}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {property.listingType}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No properties</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new property.
          </p>
        </div>
      )}

      {selectedProperty && (
        <SharePropertiesModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setSelectedProperty(null);
          }}
          property={selectedProperty}
        />
      )}
    </div>
  );
} 