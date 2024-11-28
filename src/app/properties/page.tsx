'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  location: string;
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

    return matchesSearch && matchesType;
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <LoadingSpinner size="large" />
      </div>
    );
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
          <Link
            href="/properties/new"
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Add New Property
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
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
      </div>

      {selectedProperties.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowEmailForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Email Selected Properties ({selectedProperties.length})
          </button>
        </div>
      )}

      {showEmailForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <button
              onClick={() => setShowEmailForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 className="text-lg font-semibold mb-4">Send Properties</h3>
            
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
                <button
                  onClick={() => setShowEmailForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={recipients.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Properties Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProperties.map((property) => (
          <div key={property.id} className="relative">
            <input
              type="checkbox"
              checked={selectedProperties.includes(property.id)}
              onChange={() => handlePropertySelect(property.id)}
              className="absolute top-4 right-4 h-5 w-5 z-10"
            />
            <Link
              href={`/properties/${property.id}`}
              className="block hover:shadow-lg transition-shadow duration-200"
            >
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">{property.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{property.address}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-600">
                      {formatPrice(property.price)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      property.status === 'Available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {property.status}
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
                </div>
              </div>
            </Link>
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