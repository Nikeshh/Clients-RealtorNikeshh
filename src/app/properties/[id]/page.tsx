'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast-context';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import { formatCurrency } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  type: string;
  listingType: 'SALE' | 'RENTAL';
  bedrooms?: number | null;
  bathrooms?: number | null;
  area: number;
  status: string;
  description?: string;
  features: string[];
  images: string[];
  source: string;
  location: string;
  yearBuilt?: number | null;
  
  // Rental specific fields
  furnished?: boolean | null;
  petsAllowed?: boolean | null;
  leaseTerm?: string | null;
  
  // Purchase specific fields
  lotSize?: number | null;
  basement?: boolean | null;
  garage?: boolean | null;
  parkingSpaces?: number | null;
  propertyStyle?: string | null;
  createdAt: string;
  
  sharedWith: Array<{
    id: string;
    sharedDate: string;
    client: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

export default function PropertyPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [editedData, setEditedData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedProperty, setEditedProperty] = useState<Property | null>(null);

  useEffect(() => {
    loadProperty();
  }, []);

  useEffect(() => {
    if (clientSearchTerm) {
      searchClients();
    } else {
      setSearchResults([]);
    }
  }, [clientSearchTerm]);

  const loadProperty = async () => {
    setLoading('loadProperty', true);
    try {
      const response = await fetch(`/api/properties/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch property');
      const data = await response.json();
      setProperty(data);
      setEditedData(data);
    } catch (error) {
      addToast('Failed to load property details', 'error');
      console.error('Error:', error);
    } finally {
      setLoading('loadProperty', false);
      setInitialLoadComplete(true);
    }
  };

  const searchClients = async () => {
    try {
      const response = await fetch(`/api/clients/search?q=${encodeURIComponent(clientSearchTerm)}`);
      if (!response.ok) throw new Error('Failed to search clients');
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching clients:', error);
    }
  };

  const handleShare = async (clientId: string) => {
    setLoading('shareProperty', true);
    try {
      const shareResponse = await fetch('/api/properties/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: property?.id,
          clientId,
        }),
      });

      if (!shareResponse.ok) {
        const error = await shareResponse.json();
        throw new Error(error.error || 'Failed to share property');
      }

      addToast('Property shared successfully', 'success');
      loadProperty(); // Reload to update shared with list
      
      // Close the modal and reset states
      setShowShareModal(false);
      setClientSearchTerm('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to share property', 'error');
    } finally {
      setLoading('shareProperty', false);
    }
  };

  const handleDelete = async () => {
    setLoading('deleteProperty', true);
    try {
      const response = await fetch(`/api/properties/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete property');

      addToast('Property deleted successfully', 'success');
      router.push('/properties');
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to delete property', 'error');
    } finally {
      setLoading('deleteProperty', false);
      setShowDeleteModal(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setLoading('statusUpdate', true);
    try {
      const response = await fetch(`/api/properties/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      const updatedProperty = await response.json();
      setProperty(updatedProperty);
      addToast('Status updated successfully', 'success');
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update status', 'error');
    } finally {
      setLoading('statusUpdate', false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'under contract':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = async () => {
    if (!editedProperty) return;
    
    setLoading('editProperty', true);
    try {
      const response = await fetch(`/api/properties/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedProperty),
      });

      if (!response.ok) throw new Error('Failed to update property');

      const updatedProperty = await response.json();
      setProperty(updatedProperty);
      addToast('Property updated successfully', 'success');
      setShowEditModal(false);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update property', 'error');
    } finally {
      setLoading('editProperty', false);
    }
  };

  // Show loading spinner during initial load
  if (!initialLoadComplete || isLoading('loadProperty')) {
    return <LoadingSpinner size="large" />;
  }

  // Show error state if property is not found after loading
  if (!property && initialLoadComplete) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Property not found</h2>
          <p className="mt-2 text-gray-600">The property you're looking for doesn't exist or has been removed.</p>
          <div className="mt-6">
            <Link href="/properties">
              <Button variant="primary">Back to Properties</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!property) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Actions */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
          <p className="text-gray-500">{property.address}</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={property.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="Available">Available</option>
            <option value="Under Contract">Under Contract</option>
            <option value="Sold">Sold</option>
          </select>
          <Button
            onClick={() => setShowShareModal(true)}
            variant="secondary"
          >
            Share
          </Button>
          <Button
            onClick={() => setIsEditing(true)}
            variant="primary"
          >
            Edit
          </Button>
          <Button
            onClick={() => setShowDeleteModal(true)}
            variant="danger"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Images and Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {property.images.length > 0 ? (
              <div>
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={property.images[selectedImage]}
                    alt={`Property image ${selectedImage + 1}`}
                    className="object-cover w-full h-full"
                  />
                </div>
                {property.images.length > 1 && (
                  <div className="p-4 flex gap-2 overflow-x-auto">
                    {property.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                          selectedImage === index ? 'border-blue-500' : 'border-transparent'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-w-16 aspect-h-9 bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">No images available</p>
              </div>
            )}
          </div>

          {/* Property Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(property.price)}
                  {property.listingType === 'RENTAL' && <span className="text-sm font-normal">/month</span>}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                  {property.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="text-gray-900">{property.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Area</p>
                <p className="text-gray-900">{property.area} sqft</p>
              </div>
              {property.bedrooms && (
                <div>
                  <p className="text-sm text-gray-500">Bedrooms</p>
                  <p className="text-gray-900">{property.bedrooms}</p>
                </div>
              )}
              {property.bathrooms && (
                <div>
                  <p className="text-sm text-gray-500">Bathrooms</p>
                  <p className="text-gray-900">{property.bathrooms}</p>
                </div>
              )}
            </div>

            {property.description && (
              <div className="mt-6">
                <p className="text-sm text-gray-500">Description</p>
                <p className="mt-2 text-gray-900 whitespace-pre-wrap">{property.description}</p>
              </div>
            )}
          </div>

          {/* Features */}
          {property.features.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Features</h2>
              <ul className="grid grid-cols-2 gap-4">
                {property.features.map((feature, index) => (
                  <li key={index} className="text-gray-600">• {feature}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column - Additional Info */}
        <div className="space-y-6">
          {/* Type-specific Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {property.listingType === 'RENTAL' ? 'Rental Details' : 'Property Details'}
            </h2>
            
            {property.listingType === 'RENTAL' ? (
              <div className="space-y-4">
                {property.leaseTerm && (
                  <div>
                    <p className="text-sm text-gray-500">Lease Term</p>
                    <p className="text-gray-900">{property.leaseTerm}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Amenities</p>
                  <ul className="mt-2 space-y-1">
                    {property.furnished && <li className="text-gray-600">• Furnished</li>}
                    {property.petsAllowed && <li className="text-gray-600">• Pets Allowed</li>}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {property.yearBuilt && (
                  <div>
                    <p className="text-sm text-gray-500">Year Built</p>
                    <p className="text-gray-900">{property.yearBuilt}</p>
                  </div>
                )}
                {property.lotSize && (
                  <div>
                    <p className="text-sm text-gray-500">Lot Size</p>
                    <p className="text-gray-900">{property.lotSize} sqft</p>
                  </div>
                )}
                {property.propertyStyle && (
                  <div>
                    <p className="text-sm text-gray-500">Style</p>
                    <p className="text-gray-900">{property.propertyStyle}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Features</p>
                  <ul className="mt-2 space-y-1">
                    {property.basement && <li className="text-gray-600">• Basement</li>}
                    {property.garage && <li className="text-gray-600">• Garage</li>}
                    {property.parkingSpaces && (
                      <li className="text-gray-600">• {property.parkingSpaces} Parking Spaces</li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Shared With */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Shared With</h2>
            <div className="space-y-4">
              {property.sharedWith?.length > 0 ? (
                property.sharedWith.map((share) => (
                  <div key={share.id} className="flex justify-between items-center border-b pb-4 last:border-b-0 last:pb-0">
                    <div>
                      <p className="font-medium">{share.client.name}</p>
                      <p className="text-sm text-gray-500">{share.client.email}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(share.sharedDate).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">Not shared with any clients yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setClientSearchTerm('');
          setSearchResults([]);
        }}
        title="Share Property"
      >
        <div className="space-y-6">
          {/* Property Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900">{property.title}</h4>
            <p className="text-sm text-gray-500">{property.address}</p>
            <p className="text-sm font-medium text-blue-600 mt-1">
              {formatCurrency(property.price)}
              {property.listingType === 'RENTAL' && <span className="text-sm font-normal">/month</span>}
            </p>
          </div>

          {/* Client Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Client
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Type client name or email..."
                value={clientSearchTerm}
                onChange={(e) => setClientSearchTerm(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-y-auto border border-gray-200">
                  {searchResults.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => handleShare(client.id)}
                      disabled={isLoading('shareProperty')}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 disabled:opacity-50 border-b last:border-b-0 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{client.name}</div>
                      <div className="text-sm text-gray-500">{client.email}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Shared With List */}
          {property.sharedWith?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Already shared with:</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto bg-gray-50 rounded-lg p-3">
                {property.sharedWith.map((share) => (
                  <div key={share.id} className="flex justify-between items-center text-sm p-2 hover:bg-gray-100 rounded-md">
                    <div>
                      <div className="font-medium text-gray-900">{share.client.name}</div>
                      <div className="text-gray-500">{share.client.email}</div>
                    </div>
                    <div className="text-gray-500 text-xs">
                      {new Date(share.sharedDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Add a close button at the bottom */}
        <div className="mt-6 flex justify-end">
          <Button
            variant="secondary"
            onClick={() => {
              setShowShareModal(false);
              setClientSearchTerm('');
              setSearchResults([]);
            }}
          >
            Close
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Property"
      >
        <div className="space-y-4">
          <p className="text-gray-500">
            Are you sure you want to delete this property? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => setShowDeleteModal(false)}
              variant="secondary"
              disabled={isLoading('deleteProperty')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="danger"
              isLoading={isLoading('deleteProperty')}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Property"
      >
        {editedProperty && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={editedProperty.title}
                onChange={(e) => setEditedProperty({ ...editedProperty, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                value={editedProperty.price}
                onChange={(e) => setEditedProperty({ ...editedProperty, price: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={editedProperty.status}
                onChange={(e) => setEditedProperty({ ...editedProperty, status: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Available">Available</option>
                <option value="Under Contract">Under Contract</option>
                <option value="Sold">Sold</option>
              </select>
            </div>

            {/* Add more fields as needed */}

            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setShowEditModal(false)}
                variant="secondary"
                disabled={isLoading('editProperty')}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEdit}
                variant="primary"
                isLoading={isLoading('editProperty')}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
} 