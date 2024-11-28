'use client';

import { useState } from 'react';
import Link from 'next/link';
import SharePropertiesModal from '@/components/SharePropertiesModal';
import PropertyComparison from '@/components/PropertyComparison';

// Mock data
const MOCK_PROPERTIES = [
  {
    id: '1',
    title: 'Modern Downtown Apartment',
    address: '123 Main St, City',
    price: 750000,
    type: 'Residential',
    bedrooms: 3,
    bathrooms: 2,
    area: 1500,
    status: 'Available',
    lastUpdated: '2024-03-20',
    source: 'Direct Import',
    features: [
      'Hardwood floors',
      'Stainless steel appliances',
      'In-unit laundry',
      'Central air',
      'Balcony'
    ],
    images: ['/placeholder1.jpg', '/placeholder2.jpg']
  },
  {
    id: '2',
    title: 'Commercial Office Space',
    address: '456 Business Ave, City',
    price: 1200000,
    type: 'Commercial',
    area: 2500,
    status: 'Available',
    lastUpdated: '2024-03-19',
    source: 'Broker Sheet',
    features: [
      'Open floor plan',
      'Meeting rooms',
      'Kitchen area',
      'Security system',
      'Parking included'
    ],
    images: ['/placeholder3.jpg', '/placeholder4.jpg']
  },
  {
    id: '3',
    title: 'Luxury Villa with Pool',
    address: '789 Palm Dr, Suburb',
    price: 1500000,
    type: 'Residential',
    bedrooms: 5,
    bathrooms: 4,
    area: 3500,
    status: 'Under Review',
    lastUpdated: '2024-03-18',
    source: 'Direct Import',
    features: [
      'Swimming pool',
      'Garden',
      'Smart home system',
      'Wine cellar',
      'Home theater'
    ],
    images: ['/placeholder5.jpg', '/placeholder6.jpg']
  },
];

export default function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const handleSelectProperty = (id: string) => {
    setSelectedProperties(prev => 
      prev.includes(id) 
        ? prev.filter(propId => propId !== id)
        : [...prev, id]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleShare = async (data: { email: string; message: string }) => {
    // Mock API call
    console.log('Sharing properties:', {
      properties: selectedProperties,
      ...data
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-blue-900 sm:truncate sm:text-3xl">
            Properties
          </h2>
        </div>
        <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
          {selectedProperties.length > 0 && (
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100 transition-colors"
            >
              Share Selected ({selectedProperties.length})
            </button>
          )}
          {selectedProperties.length > 1 && (
            <button
              type="button"
              onClick={() => setShowComparison(true)}
              className="inline-flex items-center rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100 transition-colors"
            >
              Compare Selected ({selectedProperties.length})
            </button>
          )}
          <Link
            href="/properties/import"
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Import Properties
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div>
          <input
            type="text"
            placeholder="Search properties..."
            className="block w-full rounded-lg border border-blue-200 px-4 py-2.5 text-gray-700 shadow-sm focus:border-blue-400 focus:ring-blue-400 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            className="block w-full rounded-lg border border-blue-200 px-4 py-2.5 text-gray-700 shadow-sm focus:border-blue-400 focus:ring-blue-400 transition-colors"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
          </select>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_PROPERTIES.map((property) => (
          <div
            key={property.id}
            className={`relative bg-white rounded-xl shadow-md border transition-colors ${
              selectedProperties.includes(property.id)
                ? 'border-blue-400 ring-2 ring-blue-400'
                : 'border-blue-100 hover:border-blue-200'
            }`}
          >
            {/* Property Image (placeholder) */}
            <div className="h-48 bg-gray-200 rounded-t-xl"></div>

            {/* Selection Checkbox */}
            <div className="absolute top-2 right-2">
              <input
                type="checkbox"
                checked={selectedProperties.includes(property.id)}
                onChange={() => handleSelectProperty(property.id)}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            {/* Property Details */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                {property.title}
              </h3>
              <p className="text-gray-600 text-sm mb-2">{property.address}</p>
              <p className="text-lg font-bold text-blue-600 mb-3">
                {formatPrice(property.price)}
              </p>

              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                {property.bedrooms && (
                  <div className="text-gray-600">
                    <span className="font-medium">Beds:</span> {property.bedrooms}
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-gray-600">
                    <span className="font-medium">Baths:</span> {property.bathrooms}
                  </div>
                )}
                <div className="text-gray-600">
                  <span className="font-medium">Area:</span> {property.area} sqft
                </div>
                <div className="text-gray-600">
                  <span className="font-medium">Type:</span> {property.type}
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  property.status === 'Available'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {property.status}
                </span>
                <Link
                  href={`/properties/${property.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Details →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <SharePropertiesModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        properties={MOCK_PROPERTIES.filter(p => selectedProperties.includes(p.id))}
        onShare={handleShare}
      />

      {showComparison && (
        <PropertyComparison
          properties={MOCK_PROPERTIES.filter(p => selectedProperties.includes(p.id))}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
} 