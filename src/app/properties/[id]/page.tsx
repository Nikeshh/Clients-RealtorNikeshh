'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import EditPropertyModal from '@/components/EditPropertyModal';
import PropertyImageGallery from '@/components/PropertyImageGallery';

// Mock data - in real app, fetch this based on the ID
const MOCK_PROPERTY = {
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
  description: 'Beautiful modern apartment in the heart of downtown. Features high-end finishes, open concept living, and stunning city views.',
  features: [
    'Hardwood floors throughout',
    'Stainless steel appliances',
    'In-unit laundry',
    'Central air conditioning',
    'Balcony with city views',
    'Secure building access'
  ],
  images: [
    '/placeholder1.jpg',
    '/placeholder2.jpg',
    '/placeholder3.jpg'
  ]
};

export default function PropertyPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'notes'>('details');
  const [showShareModal, setShowShareModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSave = async (updatedProperty: any) => {
    console.log('Saving property:', updatedProperty);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In real app, update the property data here
  };

  const handleImageUpload = async (files: FileList) => {
    setIsUploading(true);
    
    // Mock upload process
    console.log('Uploading images:', files);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsUploading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/properties"
              className="text-blue-600 hover:text-blue-800 font-medium text-sm mb-2 inline-block"
            >
              ← Back to Properties
            </Link>
            <h1 className="text-2xl font-bold text-blue-900">{MOCK_PROPERTY.title}</h1>
            <p className="text-gray-600 mt-1">{MOCK_PROPERTY.address}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100 transition-colors"
            >
              Share Property
            </button>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Edit Property
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Images */}
          <PropertyImageGallery
            images={MOCK_PROPERTY.images}
            onImageUpload={handleImageUpload}
            isEditable={true}
          />

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-md border border-blue-100">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {['details', 'history', 'notes'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as typeof activeTab)}
                    className={`py-4 px-6 text-sm font-medium border-b-2 ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <p className="text-gray-600">{MOCK_PROPERTY.description}</p>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Features</h3>
                    <ul className="grid grid-cols-2 gap-3">
                      {MOCK_PROPERTY.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-gray-600">
                          <span className="mr-2">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-4">
                  <div className="border-l-2 border-blue-200 pl-4">
                    <div className="text-sm text-gray-500">March 20, 2024</div>
                    <div className="text-gray-700">Property imported from MLS</div>
                  </div>
                  <div className="border-l-2 border-blue-200 pl-4">
                    <div className="text-sm text-gray-500">March 21, 2024</div>
                    <div className="text-gray-700">Shared with Client: John Doe</div>
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <textarea
                    rows={4}
                    className="block w-full rounded-lg border border-blue-200 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-400 focus:ring-blue-400"
                    placeholder="Add a note about this property..."
                  />
                  <button className="text-sm text-blue-600 font-medium">
                    Add Note
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Card */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100">
            <div className="text-2xl font-bold text-blue-900 mb-4">
              {formatPrice(MOCK_PROPERTY.price)}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Type</div>
                <div className="font-medium">{MOCK_PROPERTY.type}</div>
              </div>
              <div>
                <div className="text-gray-500">Status</div>
                <div className="font-medium">{MOCK_PROPERTY.status}</div>
              </div>
              <div>
                <div className="text-gray-500">Bedrooms</div>
                <div className="font-medium">{MOCK_PROPERTY.bedrooms}</div>
              </div>
              <div>
                <div className="text-gray-500">Bathrooms</div>
                <div className="font-medium">{MOCK_PROPERTY.bathrooms}</div>
              </div>
              <div>
                <div className="text-gray-500">Area</div>
                <div className="font-medium">{MOCK_PROPERTY.area} sqft</div>
              </div>
              <div>
                <div className="text-gray-500">Last Updated</div>
                <div className="font-medium">{MOCK_PROPERTY.lastUpdated}</div>
              </div>
            </div>
          </div>

          {/* Interested Clients */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Interested Clients</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 hover:bg-blue-50 rounded-lg">
                <div>
                  <div className="font-medium">John Doe</div>
                  <div className="text-sm text-gray-500">Shared on Mar 21</div>
                </div>
                <Link href="/clients/1" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditPropertyModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        property={MOCK_PROPERTY}
        onSave={handleSave}
      />
    </div>
  );
} 