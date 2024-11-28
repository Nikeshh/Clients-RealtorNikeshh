'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useToast } from '@/components/ui/toast-context';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useDebounce } from '@/hooks/useDebounce';

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
  description?: string;
  features: string[];
  images: string[];
  location: string;
}

export default function PropertyPage() {
  const params = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchClient, setSearchClient] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const { addToast } = useToast();
  const debouncedSearch = useDebounce(searchClient, 300);

  useEffect(() => {
    loadProperty();
  }, []);

  useEffect(() => {
    const searchClients = async () => {
      if (debouncedSearch.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`/api/clients/search?q=${debouncedSearch}`);
        if (!response.ok) throw new Error('Failed to search clients');
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Error searching clients:', error);
      } finally {
        setIsSearching(false);
      }
    };

    searchClients();
  }, [debouncedSearch]);

  const loadProperty = async () => {
    try {
      const response = await fetch(`/api/properties/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch property');
      const data = await response.json();
      setProperty(data);
    } catch (error) {
      addToast('Failed to load property details', 'error');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const response = await fetch('/api/properties/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyIds: [property?.id],
          clientId: selectedClients[0], // For now, sharing with first selected client
        }),
      });

      if (!response.ok) throw new Error('Failed to share property');

      addToast('Property shared successfully!', 'success');
      setShowShareModal(false);
      setSelectedClients([]);
      setSearchClient('');
    } catch (error) {
      addToast('Failed to share property', 'error');
      console.error('Error:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!property) {
    return <div>Property not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
              <p className="mt-1 text-gray-500">{property.address}</p>
            </div>
            <button
              onClick={() => setShowShareModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Share Property
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Details</h2>
              <dl className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Price</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatPrice(property.price)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Type</dt>
                  <dd className="text-gray-900">{property.type}</dd>
                </div>
                {property.bedrooms && (
                  <div>
                    <dt className="text-sm text-gray-500">Bedrooms</dt>
                    <dd className="text-gray-900">{property.bedrooms}</dd>
                  </div>
                )}
                {property.bathrooms && (
                  <div>
                    <dt className="text-sm text-gray-500">Bathrooms</dt>
                    <dd className="text-gray-900">{property.bathrooms}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-gray-500">Area</dt>
                  <dd className="text-gray-900">{property.area} sqft</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Status</dt>
                  <dd className="text-gray-900">{property.status}</dd>
                </div>
              </dl>
            </div>

            {property.description && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Description</h2>
                <p className="mt-2 text-gray-600">{property.description}</p>
              </div>
            )}
          </div>

          {property.features.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900">Features</h2>
              <ul className="mt-2 grid grid-cols-2 gap-4">
                {property.features.map((feature, index) => (
                  <li key={index} className="text-gray-600">• {feature}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Share Property</h3>
            
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search clients..."
                  className="w-full p-2 border rounded-md"
                  value={searchClient}
                  onChange={(e) => setSearchClient(e.target.value)}
                />
                
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {searchResults.map(client => (
                      <button
                        key={client.id}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 ${
                          selectedClients.includes(client.id) ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedClients([client.id])} // For now, single selection
                      >
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-gray-600">{client.email}</div>
                      </button>
                    ))}
                  </div>
                )}

                {isSearching && (
                  <div className="absolute right-2 top-2">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowShareModal(false);
                    setSelectedClients([]);
                    setSearchClient('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShare}
                  disabled={selectedClients.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 