'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AddInteractionModal from '@/components/AddInteractionModal';
import EditClientModal from '@/components/EditClientModal';

// Mock data
const MOCK_CLIENT = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1 234 567 8900',
  status: 'Active',
  lastContact: '2024-03-20',
  requirements: {
    propertyType: 'Residential',
    budget: {
      min: 500000,
      max: 750000
    },
    bedrooms: 3,
    bathrooms: 2,
    preferredLocations: ['Downtown', 'West End'],
    additionalRequirements: 'Looking for modern finishes, preferably with a balcony or outdoor space'
  },
  sharedProperties: [
    {
      id: '1',
      title: 'Modern Downtown Apartment',
      address: '123 Main St',
      price: 650000,
      sharedDate: '2024-03-18',
      status: 'Interested'
    },
    {
      id: '2',
      title: 'West End Condo',
      address: '456 Park Ave',
      price: 725000,
      sharedDate: '2024-03-15',
      status: 'Not Interested'
    }
  ],
  interactions: [
    {
      id: '1',
      type: 'Email',
      date: '2024-03-20',
      description: 'Sent property recommendations',
      notes: 'Client expressed interest in downtown properties'
    },
    {
      id: '2',
      type: 'Call',
      date: '2024-03-15',
      description: 'Initial consultation',
      notes: 'Discussed budget and requirements'
    }
  ]
};

export default function ClientPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'interactions'>('overview');
  const [isAddInteractionModalOpen, setIsAddInteractionModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSaveInteraction = async (data: any) => {
    console.log('Saving interaction:', data);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In real app, update the interactions list here
  };

  const handleSaveClient = async (data: any) => {
    console.log('Saving client:', data);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In real app, update the client data here
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/clients"
              className="text-blue-600 hover:text-blue-800 font-medium text-sm mb-2 inline-block"
            >
              ← Back to Clients
            </Link>
            <h1 className="text-2xl font-bold text-blue-900">{MOCK_CLIENT.name}</h1>
            <div className="mt-1 space-x-4 text-gray-600">
              <span>{MOCK_CLIENT.email}</span>
              <span>•</span>
              <span>{MOCK_CLIENT.phone}</span>
            </div>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setIsAddInteractionModalOpen(true)}
              className="inline-flex items-center rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100 transition-colors"
            >
              Add Interaction
            </button>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Edit Client
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px space-x-8">
          {['overview', 'properties', 'interactions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`py-4 px-1 text-sm font-medium border-b-2 ${
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

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Requirements Card */}
              <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-4">Property Requirements</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-500">Property Type</div>
                    <div className="font-medium">{MOCK_CLIENT.requirements.propertyType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Budget Range</div>
                    <div className="font-medium">
                      {formatPrice(MOCK_CLIENT.requirements.budget.min)} - {formatPrice(MOCK_CLIENT.requirements.budget.max)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Bedrooms</div>
                    <div className="font-medium">{MOCK_CLIENT.requirements.bedrooms}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Bathrooms</div>
                    <div className="font-medium">{MOCK_CLIENT.requirements.bathrooms}</div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">Preferred Locations</div>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_CLIENT.requirements.preferredLocations.map((location) => (
                      <span
                        key={location}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {location}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Additional Requirements</div>
                  <div className="text-gray-700">{MOCK_CLIENT.requirements.additionalRequirements}</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {MOCK_CLIENT.interactions.slice(0, 3).map((interaction) => (
                    <div key={interaction.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                          {interaction.type === 'Email' ? '✉️' : '📞'}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{interaction.description}</div>
                        <div className="text-sm text-gray-500">{interaction.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'properties' && (
            <div className="bg-white rounded-xl shadow-md border border-blue-100">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-4">Shared Properties</h2>
                <div className="space-y-4">
                  {MOCK_CLIENT.sharedProperties.map((property) => (
                    <div
                      key={property.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{property.title}</div>
                        <div className="text-sm text-gray-500">{property.address}</div>
                        <div className="text-sm text-gray-500">Shared on {property.sharedDate}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-blue-600">{formatPrice(property.price)}</div>
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          property.status === 'Interested'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {property.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'interactions' && (
            <div className="bg-white rounded-xl shadow-md border border-blue-100">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-4">Interaction History</h2>
                <div className="space-y-6">
                  {MOCK_CLIENT.interactions.map((interaction) => (
                    <div key={interaction.id} className="border-l-2 border-blue-200 pl-4">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          interaction.type === 'Email'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {interaction.type}
                        </span>
                        <span className="text-sm text-gray-500">{interaction.date}</span>
                      </div>
                      <div className="font-medium text-gray-900">{interaction.description}</div>
                      <div className="text-sm text-gray-600 mt-1">{interaction.notes}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Client Status</h3>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                MOCK_CLIENT.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {MOCK_CLIENT.status}
              </span>
              <span className="text-sm text-gray-500">
                Last Contact: {MOCK_CLIENT.lastContact}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                📧 Send Email
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                🔍 Find Properties
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                📅 Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      </div>

      <AddInteractionModal
        isOpen={isAddInteractionModalOpen}
        onClose={() => setIsAddInteractionModalOpen(false)}
        onSave={handleSaveInteraction}
      />

      <EditClientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        client={MOCK_CLIENT}
        onSave={handleSaveClient}
      />
    </div>
  );
} 