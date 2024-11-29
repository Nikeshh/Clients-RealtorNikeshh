'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast-context';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import { formatCurrency } from '@/lib/utils';

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  type: string;
  listingType: string; // SALE or RENTAL
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  status: string;
  description?: string;
  features: string[];
  images: string[];
  source: string;
  location: string;
  yearBuilt?: number;
  // Rental specific fields
  furnished?: boolean;
  petsAllowed?: boolean;
  leaseTerm?: string;
  // Purchase specific fields
  lotSize?: number;
  basement?: boolean;
  garage?: boolean;
  parkingSpaces?: number;
  propertyStyle?: string;
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

  useEffect(() => {
    loadProperty();
  }, []);

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
        body: JSON.stringify({
          status: newStatus,
        }),
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

  const handleSaveChanges = async () => {
    setLoading('saveChanges', true);
    try {
      const response = await fetch(`/api/properties/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedData),
      });

      if (!response.ok) throw new Error('Failed to update property');

      const updatedProperty = await response.json();
      setProperty(updatedProperty);
      setIsEditing(false);
      addToast('Property updated successfully', 'success');
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update property', 'error');
    } finally {
      setLoading('saveChanges', false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

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
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    setEditedData({
      ...editedData,
      features: editedData.features.map(
        (feature: string, i: number) => (i === index ? value : feature)
      ),
    });
  };

  const handleImageChange = (index: number, value: string) => {
    setEditedData({
      ...editedData,
      images: editedData.images.map(
        (image: string, i: number) => (i === index ? value : image)
      ),
    });
  };

  const addFeature = () => {
    setEditedData({
      ...editedData,
      features: [...editedData.features, ''],
    });
  };

  const addImage = () => {
    setEditedData({
      ...editedData,
      images: [...editedData.images, ''],
    });
  };

  const removeFeature = (index: number) => {
    setEditedData({
      ...editedData,
      features: editedData.features.filter((_: string, i: number) => i !== index),
    });
  };

  const removeImage = (index: number) => {
    setEditedData({
      ...editedData,
      images: editedData.images.filter((_: string, i: number) => i !== index),
    });
  };

  if (isLoading('loadProperty')) {
    return <LoadingSpinner size="large" />;
  }

  if (!property) {
    return <div>Property not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Actions */}
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Property' : property?.title}
        </h1>
        <div className="flex items-center gap-4">
          {!isEditing && (
            <>
              <select
                value={property?.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isLoading('statusUpdate')}
                className={`rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                  isLoading('statusUpdate') ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="Available">Available</option>
                <option value="Under Contract">Under Contract</option>
                <option value="Sold">Sold</option>
              </select>
              <Button
                onClick={() => setIsEditing(true)}
                variant="primary"
                disabled={isLoading('saveChanges')}
              >
                Edit
              </Button>
              <Button
                onClick={handleDelete}
                variant="danger"
                isLoading={isLoading('deleteProperty')}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={editedData.title}
                  onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  value={editedData.address}
                  onChange={(e) => setEditedData({ ...editedData, address: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  value={editedData.location}
                  onChange={(e) => setEditedData({ ...editedData, location: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={editedData.type}
                  onChange={(e) => setEditedData({ ...editedData, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="House">House</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Condo">Condo</option>
                  <option value="Land">Land</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  value={editedData.price}
                  onChange={(e) => setEditedData({ ...editedData, price: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={editedData.status}
                  onChange={(e) => setEditedData({ ...editedData, status: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="Available">Available</option>
                  <option value="Under Contract">Under Contract</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Property Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                  <input
                    type="number"
                    value={editedData.bedrooms || ''}
                    onChange={(e) => setEditedData({
                      ...editedData,
                      bedrooms: e.target.value ? parseInt(e.target.value) : null
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                  <input
                    type="number"
                    value={editedData.bathrooms || ''}
                    onChange={(e) => setEditedData({
                      ...editedData,
                      bathrooms: e.target.value ? parseInt(e.target.value) : null
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Area (sqft)</label>
                  <input
                    type="number"
                    value={editedData.area}
                    onChange={(e) => setEditedData({ ...editedData, area: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  value={editedData.description || ''}
                  onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Features</h2>
              <button
                type="button"
                onClick={addFeature}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Add Feature
              </button>
            </div>
            <div className="space-y-2">
              {editedData.features.map((feature: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="px-2 py-1 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Images</h2>
              <button
                type="button"
                onClick={addImage}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Add Image URL
              </button>
            </div>
            <div className="space-y-2">
              {editedData.images.map((image: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="px-2 py-1 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              onClick={() => setIsEditing(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              variant="primary"
            >
              Save Changes
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Property Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-gray-900">{property.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="text-gray-900">{property.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="text-gray-900">
                  {formatCurrency(property.price)}
                  {property.listingType === 'RENTAL' && <span className="text-sm text-gray-500">/month</span>}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="text-gray-900">{property.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-gray-900">{property.status}</p>
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

              {/* Rental specific details */}
              {property.listingType === 'RENTAL' && (
                <>
                  {property.leaseTerm && (
                    <div>
                      <p className="text-sm text-gray-500">Lease Term</p>
                      <p className="text-gray-900">{property.leaseTerm}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Amenities</p>
                    <p className="text-gray-900">
                      {property.furnished && 'Furnished • '}
                      {property.petsAllowed && 'Pets Allowed'}
                    </p>
                  </div>
                </>
              )}

              {/* Purchase specific details */}
              {property.listingType === 'SALE' && (
                <>
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
                    <p className="text-gray-900">
                      {property.basement && 'Basement • '}
                      {property.garage && 'Garage • '}
                      {property.parkingSpaces && `${property.parkingSpaces} Parking Spaces`}
                    </p>
                  </div>
                </>
              )}
            </div>

            {property.description && (
              <div className="mt-4">
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-gray-900 mt-1">{property.description}</p>
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

          {/* Images */}
          {property.images.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.images.map((image, index) => (
                  <div key={index} className="aspect-w-16 aspect-h-9">
                    <img
                      src={image}
                      alt={`Property image ${index + 1}`}
                      className="object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shared With */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Shared With</h2>
            <div className="space-y-4">
              {property.sharedWith?.length > 0 ? (
                property.sharedWith.map((share) => (
                  <div key={share.id} className="flex justify-between items-center border-b pb-4">
                    <div>
                      <p className="font-medium">{share.client.name}</p>
                      <p className="text-sm text-gray-500">{share.client.email}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      Shared on {new Date(share.sharedDate).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">Not shared with any clients yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 