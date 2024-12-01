'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from './Button';
import { Search, Building2, Plus } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  type: string;
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  images?: string[];
  link?: string;
}

interface Filters {
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
}

interface Props {
  onSelect: (propertyId: string) => void;
  filters?: Filters;
}

export default function PropertySearch({ onSelect, filters }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { setLoading, isLoading } = useLoadingStates();

  useEffect(() => {
    searchProperties();
  }, [debouncedSearch, filters]);

  const searchProperties = async () => {
    setLoading('searchProperties', true);
    try {
      const queryParams = new URLSearchParams();
      if (debouncedSearch) queryParams.append('q', debouncedSearch);
      if (filters) {
        if (filters?.type) queryParams.append('type', filters.type);
        if (filters?.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
        if (filters?.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
        if (filters?.bedrooms) queryParams.append('bedrooms', filters.bedrooms.toString());
        if (filters?.bathrooms) queryParams.append('bathrooms', filters.bathrooms.toString());
      }

      const response = await fetch(`/api/properties?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch properties');
      const data = await response.json();
      setProperties(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading('searchProperties', false);
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
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Search properties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      {/* Active Filters */}
      {filters && Object.keys(filters).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.type && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Type: {filters.type}
            </span>
          )}
          {(filters.minPrice || filters.maxPrice) && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Price: {filters.minPrice ? formatPrice(filters.minPrice) : '$0'} - {filters.maxPrice ? formatPrice(filters.maxPrice) : '∞'}
            </span>
          )}
          {filters.bedrooms && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {filters.bedrooms} bed
            </span>
          )}
          {filters.bathrooms && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {filters.bathrooms} bath
            </span>
          )}
        </div>
      )}

      {/* Properties List */}
      <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto">
        {isLoading('searchProperties') ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        ) : properties.length > 0 ? (
          properties.map((property) => (
            <div
              key={property.id}
              className="flex gap-4 p-4 bg-white rounded-lg shadow-sm border hover:border-blue-500 transition-colors"
            >
              {/* Property Image */}
              <div className="w-24 h-24 flex-shrink-0">
                {property.images?.[0] ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Property Details */}
              <div className="flex-grow">
                <h3 className="font-medium">{property.title}</h3>
                <p className="text-sm text-gray-500">{property.address}</p>
                <p className="text-sm font-medium mt-1">{formatPrice(property.price)}</p>
                <div className="flex gap-2 mt-1 text-sm text-gray-500">
                  {property.bedrooms && <span>{property.bedrooms} bed</span>}
                  {property.bathrooms && <span>{property.bathrooms} bath</span>}
                  <span>{property.area} sqft</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-start">
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => onSelect(property.id)}
                  isLoading={isLoading(`gather-${property.id}`)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Gather
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            No properties found
          </div>
        )}
      </div>
    </div>
  );
} 