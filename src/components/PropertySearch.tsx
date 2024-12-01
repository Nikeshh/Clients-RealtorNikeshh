import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import Button from './Button';
import { Search } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  images?: string[];
  bedrooms?: number;
  bathrooms?: number;
}

interface Props {
  onSelect: (propertyId: string) => void;
  filters?: {
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
  };
}

export default function PropertySearch({ onSelect, filters }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearch) {
      searchProperties();
    } else {
      setProperties([]);
    }
  }, [debouncedSearch]);

  const searchProperties = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        q: debouncedSearch,
        ...(filters?.type && { type: filters.type }),
        ...(filters?.minPrice && { minPrice: filters.minPrice.toString() }),
        ...(filters?.maxPrice && { maxPrice: filters.maxPrice.toString() }),
        ...(filters?.bedrooms && { bedrooms: filters.bedrooms.toString() }),
        ...(filters?.bathrooms && { bathrooms: filters.bathrooms.toString() }),
      });

      const response = await fetch(`/api/properties/search?${queryParams}`);
      if (!response.ok) throw new Error('Failed to search properties');
      const data = await response.json();
      setProperties(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          className="w-full px-4 py-2 border rounded-lg pr-10"
          placeholder="Search properties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {properties.map((property) => (
            <div
              key={property.id}
              className="border rounded-lg p-4 flex gap-4"
            >
              {property.images?.[0] && (
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h4 className="font-medium">{property.title}</h4>
                <p className="text-sm text-gray-500">{property.address}</p>
                <p className="text-sm font-medium">
                  ${property.price.toLocaleString()}
                </p>
                {property.bedrooms && (
                  <p className="text-sm text-gray-500">
                    {property.bedrooms} beds, {property.bathrooms} baths
                  </p>
                )}
              </div>
              <Button
                variant="secondary"
                size="small"
                onClick={() => onSelect(property.id)}
              >
                Select
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 