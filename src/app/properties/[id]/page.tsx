'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast-context';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import { formatCurrency, formatDate } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';
import { Upload } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";

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
  link: string;
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
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    loadProperty();
  }, []);

  useEffect(() => {
    if (clientSearchTerm) {
      const filtered = searchResults.filter(
        client => 
          client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
          client.email.toLowerCase().includes(clientSearchTerm.toLowerCase())
      );
      setSearchResults(filtered);
    } else if (isSearchFocused) {
      loadClients();
    }
  }, [clientSearchTerm, isSearchFocused]);

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

  const loadClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) throw new Error('Failed to fetch clients');
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error loading clients:', error);
      addToast('Failed to load clients', 'error');
    }
  };

  const handleShare = async () => {
    if (selectedClients.length === 0) {
      addToast('Please select at least one client', 'error');
      return;
    }

    setLoading('shareProperty', true);
    try {
      const response = await fetch('/api/properties/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: property?.id,
          clientIds: selectedClients,
        }),
      });

      if (!response.ok) throw new Error('Failed to share property');

      addToast('Property shared successfully', 'success');
      loadProperty(); // Reload to update shared with list
      setShowShareModal(false);
      setClientSearchTerm('');
      setSearchResults([]);
      setSelectedClients([]);
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

  const handleEditClick = () => {
    setEditedProperty(property); // Set the current property data to edit
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
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
      setEditedProperty(null);
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
            onClick={handleEditClick}
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
          setSelectedClients([]);
          setIsSearchFocused(false);
        }}
        title="Share Property"
      >
        <div className="space-y-6">
          {/* Property Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              {property.images[0] && (
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="h-12 w-12 object-cover rounded"
                />
              )}
              <div>
                <h4 className="font-medium text-gray-900">{property.title}</h4>
                <p className="text-sm text-gray-500">{property.address}</p>
                <p className="text-sm font-medium text-blue-600 mt-1">
                  {formatCurrency(property.price)}
                  {property.listingType === 'RENTAL' && <span className="text-sm font-normal">/month</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Client Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Clients
            </label>
            <input
              type="text"
              value={clientSearchTerm}
              onChange={(e) => setClientSearchTerm(e.target.value)}
              onFocus={() => {
                setIsSearchFocused(true);
                if (!searchResults.length) {
                  loadClients();
                }
              }}
              placeholder="Search by name or email..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Client List */}
          <div className="border rounded-md max-h-60 overflow-y-auto">
            {isSearchFocused && searchResults.map((client) => (
              <label
                key={`client-${client.id}`}
                className="flex items-center gap-2 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              >
                <Checkbox
                  checked={selectedClients.includes(client.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedClients([...selectedClients, client.id]);
                    } else {
                      setSelectedClients(selectedClients.filter(id => id !== client.id));
                    }
                  }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{client.name}</p>
                  <p className="text-sm text-gray-500">{client.email}</p>
                </div>
              </label>
            ))}
            {isSearchFocused && searchResults.length === 0 && (
              <p className="text-center py-4 text-gray-500">
                No clients found matching your search
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => {
                setShowShareModal(false);
                setClientSearchTerm('');
                setSearchResults([]);
                setSelectedClients([]);
                setIsSearchFocused(false);
              }}
              variant="secondary"
              disabled={isLoading('shareProperty')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              variant="primary"
              isLoading={isLoading('shareProperty')}
              disabled={selectedClients.length === 0}
            >
              Share with {selectedClients.length} client{selectedClients.length !== 1 ? 's' : ''}
            </Button>
          </div>
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
        onClose={() => {
          setShowEditModal(false);
          setEditedProperty(null);
        }}
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
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                value={editedProperty.address}
                onChange={(e) => setEditedProperty({ ...editedProperty, address: e.target.value })}
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
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={editedProperty.description || ''}
                onChange={(e) => setEditedProperty({ ...editedProperty, description: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                <input
                  type="number"
                  value={editedProperty.bedrooms || ''}
                  onChange={(e) => setEditedProperty({ ...editedProperty, bedrooms: e.target.value ? parseInt(e.target.value) : null })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                <input
                  type="number"
                  value={editedProperty.bathrooms || ''}
                  onChange={(e) => setEditedProperty({ ...editedProperty, bathrooms: e.target.value ? parseInt(e.target.value) : null })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Area (sqft)</label>
              <input
                type="number"
                value={editedProperty.area}
                onChange={(e) => setEditedProperty({ ...editedProperty, area: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Property Link</label>
              <input
                type="url"
                value={editedProperty.link}
                onChange={(e) => setEditedProperty({ ...editedProperty, link: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://www.realtor.ca/property/..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Original listing URL
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
              <div className="grid grid-cols-4 gap-4">
                {editedProperty.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Property ${index + 1}`}
                      className="h-24 w-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => {
                        const newImages = [...editedProperty.images];
                        newImages.splice(index, 1);
                        setEditedProperty({ ...editedProperty, images: newImages });
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 
                                 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                
                {/* Upload Button */}
                <label className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-lg 
                                 flex flex-col items-center justify-center cursor-pointer 
                                 hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files) {
                        setLoading('uploadImages', true);
                        try {
                          const formData = new FormData();
                          Array.from(e.target.files).forEach((file) => {
                            formData.append('images', file);
                          });

                          const response = await fetch('/api/upload', {
                            method: 'POST',
                            body: formData,
                          });

                          if (!response.ok) throw new Error('Failed to upload images');

                          const { urls } = await response.json();
                          setEditedProperty({
                            ...editedProperty,
                            images: [...editedProperty.images, ...urls],
                          });
                          addToast('Images uploaded successfully', 'success');
                        } catch (error) {
                          console.error('Error:', error);
                          addToast('Failed to upload images', 'error');
                        } finally {
                          setLoading('uploadImages', false);
                        }
                      }
                    }}
                  />
                  {isLoading('uploadImages') ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-gray-400" />
                      <span className="mt-2 text-sm text-gray-500">Add Images</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                onClick={() => {
                  setShowEditModal(false);
                  setEditedProperty(null);
                }}
                variant="secondary"
                disabled={isLoading('editProperty')}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSubmit}
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