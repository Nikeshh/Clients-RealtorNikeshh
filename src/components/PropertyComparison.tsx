'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
  features: string[];
  images: string[];
}

interface PropertyComparisonProps {
  properties: Property[];
  onClose: () => void;
}

export default function PropertyComparison({ properties, onClose }: PropertyComparisonProps) {
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get all unique features across all properties
  const allFeatures = Array.from(
    new Set(properties.flatMap(p => p.features))
  );

  const displayedFeatures = showAllFeatures 
    ? allFeatures 
    : allFeatures.slice(0, 5);

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center">
        <div className="fixed inset-0" onClick={onClose} />

        <div className="inline-block w-full max-w-7xl my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-blue-900">
              Compare Properties ({properties.length})
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              ✕
            </button>
          </div>

          {/* Comparison Table */}
          <div className="p-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Images */}
              <tr>
                <th className="w-48 px-3 py-2 text-left text-sm font-semibold text-gray-500">
                  Image
                </th>
                {properties.map(property => (
                  <td key={property.id} className="px-3 py-2">
                    <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100">
                      {property.images[0] && (
                        <Image
                          src={property.images[0]}
                          alt={property.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Basic Info */}
              <tr>
                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-500">
                  Property
                </th>
                {properties.map(property => (
                  <td key={property.id} className="px-3 py-2">
                    <div className="font-medium text-blue-900">{property.title}</div>
                    <div className="text-sm text-gray-500">{property.address}</div>
                  </td>
                ))}
              </tr>

              <tr>
                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-500">
                  Price
                </th>
                {properties.map(property => (
                  <td key={property.id} className="px-3 py-2">
                    <div className="font-medium text-blue-600">
                      {formatPrice(property.price)}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Details */}
              {[
                { label: 'Type', key: 'type' },
                { label: 'Bedrooms', key: 'bedrooms' },
                { label: 'Bathrooms', key: 'bathrooms' },
                { label: 'Area', key: 'area', suffix: 'sqft' },
                { label: 'Status', key: 'status' },
              ].map(({ label, key, suffix }) => (
                <tr key={key}>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-500">
                    {label}
                  </th>
                  {properties.map(property => (
                    <td key={property.id} className="px-3 py-2 text-sm text-gray-700">
                      {property[key as keyof Property]}
                      {suffix && property[key as keyof Property] ? ` ${suffix}` : ''}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Features */}
              <tr>
                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-500">
                  Features
                </th>
                {properties.map(property => (
                  <td key={property.id} className="px-3 py-2">
                    <ul className="space-y-1">
                      {displayedFeatures.map(feature => (
                        <li 
                          key={feature}
                          className={`text-sm ${
                            property.features.includes(feature)
                              ? 'text-gray-700'
                              : 'text-gray-300 line-through'
                          }`}
                        >
                          • {feature}
                        </li>
                      ))}
                    </ul>
                    {allFeatures.length > 5 && (
                      <button
                        onClick={() => setShowAllFeatures(!showAllFeatures)}
                        className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                      >
                        {showAllFeatures ? 'Show Less' : `Show ${allFeatures.length - 5} More`}
                      </button>
                    )}
                  </td>
                ))}
              </tr>
            </table>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Share Comparison
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 