'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast-context';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useDebounce } from '@/hooks/useDebounce';
import Modal from '@/components/ui/Modal';
import Button from '@/components/Button';

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  type: string;
  listingType: string;
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  status: string;
  location: string;
  furnished?: boolean;
  petsAllowed?: boolean;
  leaseTerm?: string;
  lotSize?: number;
  basement?: boolean;
  garage?: boolean;
  parkingSpaces?: number;
  propertyStyle?: string;
  yearBuilt?: number;
}

interface EmailRecipient {
  id: string;
  name: string;
  email: string;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailFormData, setEmailFormData] = useState({
    clientEmail: '',
    clientName: '',
  });
  const { addToast } = useToast();
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [searchClient, setSearchClient] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearch = useDebounce(searchClient, 300);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState<string | null>(null);
  const [filterListingType, setFilterListingType] = useState('all');

  useEffect(() => {
    loadProperties();
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
        addToast('Failed to search clients', 'error');
      } finally {
        setIsSearching(false);
      }
    };

    searchClients();
  }, [debouncedSearch]);

  const loadProperties = async () => {
    try {
      const response = await fetch('/api/properties');
      if (!response.ok) throw new Error('Failed to fetch properties');
      const data = await response.json();
      setProperties(data);
    } catch (error) {
      addToast('Failed to load properties', 'error');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      filterType === 'all' || 
      property.type.toLowerCase() === filterType.toLowerCase();

    const matchesListingType =
      filterListingType === 'all' ||
      property.listingType === filterListingType;

    return matchesSearch && matchesType && matchesListingType;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handlePropertySelect = (propertyId: string) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const addRecipient = (client: any) => {
    if (!recipients.find(r => r.id === client.id)) {
      setRecipients([...recipients, {
        id: client.id,
        name: client.name,
        email: client.email
      }]);
    }
    setSearchClient('');
    setSearchResults([]);
  };

  const removeRecipient = (id: string) => {
    setRecipients(recipients.filter(r => r.id !== id));
  };

  const handleSendEmail = async () => {
    try {
      const selectedProps = properties.filter(p => selectedProperties.includes(p.id));
      
      await Promise.all(recipients.map(recipient => 
        fetch('/api/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientEmail: recipient.email,
            clientName: recipient.name,
            properties: selectedProps,
          }),
        })
      ));

      addToast('Emails sent successfully!', 'success');
      setShowEmailForm(false);
      setSelectedProperties([]);
      setRecipients([]);
    } catch (error) {
      addToast('Failed to send emails', 'error');
      console.error('Error:', error);
    }
  };

  const handleDelete = async (property: Property) => {
    setPropertyToDelete(property);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/properties/${propertyToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete property');

      addToast('Property deleted successfully', 'success');
      setProperties(properties.filter(p => p.id !== propertyToDelete.id));
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to delete property', 'error');
    } finally {
      setIsDeleting(false);
      setPropertyToDelete(null);
    }
  };

  const handleStatusChange = async (propertyId: string, newStatus: string) => {
    setIsStatusUpdating(propertyId);
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      setProperties(properties.map(property => 
        property.id === propertyId ? { ...property, status: newStatus } : property
      ));
      addToast('Status updated successfully', 'success');
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update status', 'error');
    } finally {
      setIsStatusUpdating(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-blue-900 sm:truncate sm:text-3xl">
            Properties
          </h2>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link href="/properties/new">
            <Button variant="primary">Add New Property</Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div>
          <input
            type="text"
            placeholder="Search properties..."
            className="block w-full rounded-lg border border-blue-200 px-4 py-2.5 text-gray-700 focus:border-blue-400 focus:ring-blue-400 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            className="block w-full rounded-lg border border-blue-200 px-4 py-2.5 text-gray-700 focus:border-blue-400 focus:ring-blue-400 transition-colors"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="condo">Condo</option>
            <option value="land">Land</option>
          </select>
        </div>
        <div>
          <select
            className="block w-full rounded-lg border border-blue-200 px-4 py-2.5 text-gray-700 focus:border-blue-400 focus:ring-blue-400 transition-colors"
            value={filterListingType}
            onChange={(e) => setFilterListingType(e.target.value)}
          >
            <option value="all">All Listings</option>
            <option value="SALE">For Sale</option>
            <option value="RENTAL">For Rent</option>
          </select>
        </div>
      </div>

      {selectedProperties.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowEmailForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Send Properties ({selectedProperties.length})
          </button>
        </div>
      )}

      <Modal
        isOpen={showEmailForm}
        onClose={() => setShowEmailForm(false)}
        title="Send Properties"
      >
        <div className="space-y-4">
          {/* Recipients List */}
          <div className="flex flex-wrap gap-2 mb-2">
            {recipients.map(recipient => (
              <div 
                key={recipient.id}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
              >
                <span>{recipient.name}</span>
                <button
                  onClick={() => removeRecipient(recipient.id)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Client Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search clients..."
              className="w-full p-2 border rounded-md"
              value={searchClient}
              onChange={(e) => setSearchClient(e.target.value)}
            />
            
            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                {searchResults.map(client => (
                  <button
                    key={client.id}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100"
                    onClick={() => addRecipient(client)}
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

          {/* Selected Properties Summary */}
          <div className="mt-4 p-2 bg-gray-50 rounded-md">
            <div className="text-sm font-medium text-gray-700">
              Selected Properties: {selectedProperties.length}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button
              onClick={() => setShowEmailForm(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              variant="primary"
              disabled={recipients.length === 0}
            >
              Send Email
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      {propertyToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Property</h3>
            <p className="text-gray-500 mb-4">
              Are you sure you want to delete {propertyToDelete.title}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPropertyToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Properties Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProperties.map((property) => (
          <div key={property.id} className="relative bg-white rounded-lg shadow overflow-hidden">
            {/* Checkbox Container */}
            <div className="absolute top-4 left-4 z-10">
              <input
                type="checkbox"
                checked={selectedProperties.includes(property.id)}
                onChange={() => handlePropertySelect(property.id)}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            {/* Status and Delete Options */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <select
                value={property.status}
                onChange={(e) => handleStatusChange(property.id, e.target.value)}
                disabled={isStatusUpdating === property.id}
                className={`rounded-md border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white ${
                  isStatusUpdating === property.id ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="Available">Available</option>
                <option value="Under Contract">Under Contract</option>
                <option value="Sold">Sold</option>
              </select>
              <button
                onClick={() => handleDelete(property)}
                className="text-red-600 hover:text-red-800 transition-colors bg-white rounded-md p-1"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* Property Content */}
            <div className="p-6 pt-12">
              <Link href={`/properties/${property.id}`}>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">{property.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{property.address}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-blue-600">
                    {formatPrice(property.price)}
                    {property.listingType === 'RENTAL' && <span className="text-sm font-normal">/month</span>}
                  </span>
                  <span className="text-sm font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                    {property.listingType === 'SALE' ? 'For Sale' : 'For Rent'}
                  </span>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500 gap-4">
                  {property.bedrooms && (
                    <span>{property.bedrooms} beds</span>
                  )}
                  {property.bathrooms && (
                    <span>{property.bathrooms} baths</span>
                  )}
                  <span>{property.area} sqft</span>
                </div>
                {/* Type-specific details */}
                {property.listingType === 'RENTAL' && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {property.furnished && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        Furnished
                      </span>
                    )}
                    {property.petsAllowed && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        Pets Allowed
                      </span>
                    )}
                    {property.leaseTerm && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {property.leaseTerm}
                      </span>
                    )}
                  </div>
                )}
                {property.listingType === 'SALE' && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {property.yearBuilt && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        Built {property.yearBuilt}
                      </span>
                    )}
                    {property.garage && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        Garage
                      </span>
                    )}
                    {property.basement && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        Basement
                      </span>
                    )}
                  </div>
                )}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No properties found. Add your first property to get started.</p>
        </div>
      )}
    </div>
  );
} 