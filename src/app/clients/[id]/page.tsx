'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { clientApi } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import AddInteractionModal from '@/components/AddInteractionModal';
import EditClientModal from '@/components/EditClientModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { Client, Interaction, ClientFormData } from '@/types/client';

export default function ClientPage() {
  const params = useParams();
  const { showToast } = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'interactions'>('overview');
  const [isAddInteractionModalOpen, setIsAddInteractionModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    loadClient();
  }, [params.id]);

  const loadClient = async () => {
    try {
      const data = await clientApi.getById(params.id as string);
      setClient(data);
    } catch (error) {
      showToast('Error loading client', 'error');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSaveInteraction = async (data: Omit<Interaction, 'id' | 'clientId'>) => {
    try {
      await clientApi.addInteraction(params.id as string, data);
      showToast('Interaction added successfully', 'success');
      loadClient();
      setIsAddInteractionModalOpen(false);
    } catch (error) {
      showToast('Error adding interaction', 'error');
      console.error('Error:', error);
    }
  };

  const handleSaveClient = async (data: ClientFormData) => {
    try {
      await clientApi.update(params.id as string, data);
      showToast('Client updated successfully', 'success');
      loadClient();
      setIsEditModalOpen(false);
    } catch (error) {
      showToast('Error updating client', 'error');
      console.error('Error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Client not found</h2>
          <p className="mt-2 text-gray-600">The client you're looking for doesn't exist.</p>
          <Link
            href="/clients"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            ← Back to Clients
          </Link>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-blue-900">{client.name}</h1>
            <div className="mt-1 space-x-4 text-gray-600">
              <span>{client.email}</span>
              <span>•</span>
              <span>{client.phone}</span>
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
                    <div className="font-medium">{client.requirements.propertyType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Budget Range</div>
                    <div className="font-medium">
                      {formatPrice(client.requirements.budgetMin)} - {formatPrice(client.requirements.budgetMax)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Bedrooms</div>
                    <div className="font-medium">{client.requirements.bedrooms}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Bathrooms</div>
                    <div className="font-medium">{client.requirements.bathrooms}</div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">Preferred Locations</div>
                  <div className="flex flex-wrap gap-2">
                    {client.requirements.preferredLocations.map((location) => (
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
                  <div className="text-gray-700">{client.requirements.additionalRequirements}</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {client.interactions.slice(0, 3).map((interaction) => (
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
                  {client.sharedProperties.map((property) => (
                    <div
                      key={property.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{property.property.title}</div>
                        <div className="text-sm text-gray-500">{property.property.address}</div>
                        <div className="text-sm text-gray-500">Shared on {property.sharedDate}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-blue-600">{formatPrice(property.property.price)}</div>
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
                  {client.interactions.map((interaction) => (
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
                client.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {client.status}
              </span>
              <span className="text-sm text-gray-500">
                Last Contact: {client.lastContact}
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
        client={client}
        onSave={handleSaveClient}
      />
    </div>
  );
} 