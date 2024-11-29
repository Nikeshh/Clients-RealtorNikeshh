"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast-context";
import LoadingSpinner from "@/components/LoadingSpinner";
import Modal from "@/components/ui/Modal";
import Button from "@/components/Button";
import { useLoadingStates } from "@/hooks/useLoadingStates";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ClientRequirement {
  id: string;
  name: string;
  type: "PURCHASE" | "RENTAL";
  propertyType: string;
  budgetMin: number;
  budgetMax: number;
  bedrooms: number | null;
  bathrooms: number | null;
  preferredLocations: string[];
  additionalRequirements?: string;
  status: string;
  rentalPreferences?: {
    leaseTerm: string;
    furnished: boolean;
    petsAllowed: boolean;
    maxRentalBudget: number;
    preferredMoveInDate?: Date;
  };
  purchasePreferences?: {
    propertyAge?: string;
    preferredStyle?: string;
    parking?: number;
    lotSize?: number;
    basement: boolean;
    garage: boolean;
  };
  gatheredProperties: Array<{
    id: string;
    notes?: string;
    status: string;
    property: {
      id: string;
      title: string;
      address: string;
      price: number;
      type: string;
    };
  }>;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  requirements: ClientRequirement[];
  interactions: Array<{
    id: string;
    type: string;
    date: string;
    description: string;
  }>;
  sharedProperties: Array<{
    id: string;
    sharedDate: string;
    property: {
      id: string;
      title: string;
      address: string;
      price: number;
    };
  }>;
}

interface NewRequirementForm {
  name: string;
  type: "PURCHASE" | "RENTAL";
  propertyType: string;
  budgetMin: string;
  budgetMax: string;
  bedrooms: string;
  bathrooms: string;
  preferredLocations: string[];
  additionalRequirements: string;
  rentalPreferences: {
    leaseTerm: string;
    furnished: boolean;
    petsAllowed: boolean;
    maxRentalBudget: string;
    preferredMoveInDate: string;
  };
  purchasePreferences: {
    propertyAge: string;
    preferredStyle: string;
    parking: string;
    lotSize: string;
    basement: boolean;
    garage: boolean;
  };
}

export default function ClientPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedClientData, setEditedClientData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "",
  });
  const [showNewRequirementModal, setShowNewRequirementModal] = useState(false);
  const { setLoading, isLoading } = useLoadingStates();
  const [newRequirement, setNewRequirement] = useState<NewRequirementForm>({
    name: '',
    type: 'PURCHASE',
    propertyType: '',
    budgetMin: '',
    budgetMax: '',
    bedrooms: '',
    bathrooms: '',
    preferredLocations: [''],
    additionalRequirements: '',
    rentalPreferences: {
      leaseTerm: 'Long-term',
      furnished: false,
      petsAllowed: false,
      maxRentalBudget: '',
      preferredMoveInDate: '',
    },
    purchasePreferences: {
      propertyAge: '',
      preferredStyle: '',
      parking: '',
      lotSize: '',
      basement: false,
      garage: false,
    }
  });

  useEffect(() => {
    loadClient();
  }, []);

  const loadClient = async () => {
    setLoading("loadClient", true);
    try {
      const response = await fetch(`/api/clients/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch client");
      const data = await response.json();
      setClient(data);
      setEditedClientData({
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status,
      });
    } catch (error) {
      console.error("Error:", error);
      addToast("Failed to load client details", "error");
    } finally {
      setLoading("loadClient", false);
    }
  };

  const handleSaveClientChanges = async () => {
    setLoading('saveChanges', true);
    try {
      const response = await fetch(`/api/clients/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedClientData),
      });

      if (!response.ok) throw new Error('Failed to update client');

      const updatedClient = await response.json();
      setClient(updatedClient);
      setEditMode(false);
      addToast('Client updated successfully', 'success');
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update client', 'error');
    } finally {
      setLoading('saveChanges', false);
    }
  };

  const handleAddRequirement = async () => {
    setLoading('addRequirement', true);
    try {
      const response = await fetch(`/api/clients/${params.id}/requirements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRequirement),
      });

      if (!response.ok) throw new Error('Failed to add requirement');

      const updatedClient = await response.json();
      setClient(updatedClient);
      setShowNewRequirementModal(false);
      addToast('Requirement added successfully', 'success');
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to add requirement', 'error');
    } finally {
      setLoading('addRequirement', false);
    }
  };

  if (isLoading("loadClient")) {
    return <LoadingSpinner size="large" />;
  }

  if (!client) {
    return <div>Client not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Client Information Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Client Information</h2>
          <div className="flex gap-2">
            {!editMode ? (
              <Button onClick={() => setEditMode(true)} variant="secondary">
                Edit Client
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => setEditMode(false)}
                  variant="secondary"
                  disabled={isLoading('saveChanges')}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveClientChanges}
                  variant="primary"
                  isLoading={isLoading('saveChanges')}
                >
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {editMode ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={editedClientData.name}
                  onChange={(e) => setEditedClientData({ ...editedClientData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={editedClientData.email}
                  onChange={(e) => setEditedClientData({ ...editedClientData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={editedClientData.phone}
                  onChange={(e) => setEditedClientData({ ...editedClientData, phone: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={editedClientData.status}
                  onChange={(e) => setEditedClientData({ ...editedClientData, status: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Lead">Lead</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{client.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{client.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{client.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{client.status}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Requirements Section */}
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Requirements</h2>
          <Button
            onClick={() => setShowNewRequirementModal(true)}
            variant="primary"
          >
            Add Requirement
          </Button>
        </div>

        <div className="space-y-6">
          {client.requirements?.length > 0 ? (
            client.requirements.map((requirement) => (
              <div key={requirement.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-lg">{requirement.name}</h3>
                    <p className="text-sm text-gray-500">
                      {requirement.type} • {requirement.propertyType}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => router.push(`/clients/requirements/${requirement.id}/gather`)}
                      variant="secondary"
                      size="small"
                    >
                      Gather Properties
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Budget Range</p>
                    <p className="text-sm font-medium">
                      {formatCurrency(requirement.budgetMin)} - {formatCurrency(requirement.budgetMax)}
                    </p>
                  </div>
                  {requirement.bedrooms && (
                    <div>
                      <p className="text-sm text-gray-500">Bedrooms</p>
                      <p className="text-sm font-medium">{requirement.bedrooms}</p>
                    </div>
                  )}
                  {requirement.bathrooms && (
                    <div>
                      <p className="text-sm text-gray-500">Bathrooms</p>
                      <p className="text-sm font-medium">{requirement.bathrooms}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Preferred Locations</p>
                    <p className="text-sm font-medium">
                      {requirement.preferredLocations.join(', ')}
                    </p>
                  </div>
                </div>

                {/* Gathered Properties */}
                {requirement.gatheredProperties?.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Gathered Properties
                    </h4>
                    <div className="space-y-2">
                      {requirement.gatheredProperties.map((gathered) => (
                        <div
                          key={gathered.id}
                          className="flex justify-between items-center text-sm"
                        >
                          <div>
                            <p className="font-medium">{gathered.property.title}</p>
                            <p className="text-gray-500">
                              {formatCurrency(gathered.property.price)}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              gathered.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : gathered.status === 'Accepted'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {gathered.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">No requirements added yet</p>
          )}
        </div>
      </div>

      {/* Shared Properties Section */}
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Shared Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {client.sharedProperties?.length > 0 ? (
            client.sharedProperties.map((shared) => (
              <div key={shared.id} className="border rounded-lg p-4">
                <h3 className="font-medium">{shared.property.title}</h3>
                <p className="text-sm text-gray-500">{shared.property.address}</p>
                <p className="text-sm font-medium text-blue-600">
                  {formatCurrency(shared.property.price)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Shared on {formatDate(shared.sharedDate)}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              No properties shared yet
            </div>
          )}
        </div>
      </div>

      {/* Interactions Section */}
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Interactions</h2>
        <div className="space-y-4">
          {client.interactions?.length > 0 ? (
            client.interactions.map((interaction) => (
              <div key={interaction.id} className="border-b pb-4">
                <div className="flex justify-between">
                  <p className="font-medium">{interaction.type}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(interaction.date)}
                  </p>
                </div>
                <p className="text-sm text-gray-600 mt-1">{interaction.description}</p>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">No interactions recorded</div>
          )}
        </div>
      </div>

      {/* Add Requirement Modal */}
      {showNewRequirementModal && (
        <Modal
          isOpen={showNewRequirementModal}
          onClose={() => setShowNewRequirementModal(false)}
          title="Add Requirement"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={newRequirement.name}
                onChange={(e) => setNewRequirement({ ...newRequirement, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g., Primary Residence Search"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={newRequirement.type}
                onChange={(e) => setNewRequirement({ ...newRequirement, type: e.target.value as 'PURCHASE' | 'RENTAL' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="PURCHASE">Purchase</option>
                <option value="RENTAL">Rental</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Property Type</label>
              <select
                value={newRequirement.propertyType}
                onChange={(e) => setNewRequirement({ ...newRequirement, propertyType: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select type</option>
                <option value="House">House</option>
                <option value="Apartment">Apartment</option>
                <option value="Condo">Condo</option>
                <option value="Land">Land</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Budget Min</label>
                <input
                  type="number"
                  value={newRequirement.budgetMin}
                  onChange={(e) => setNewRequirement({ ...newRequirement, budgetMin: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Budget Max</label>
                <input
                  type="number"
                  value={newRequirement.budgetMax}
                  onChange={(e) => setNewRequirement({ ...newRequirement, budgetMax: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                <input
                  type="number"
                  value={newRequirement.bedrooms}
                  onChange={(e) => setNewRequirement({ ...newRequirement, bedrooms: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                <input
                  type="number"
                  value={newRequirement.bathrooms}
                  onChange={(e) => setNewRequirement({ ...newRequirement, bathrooms: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Preferred Locations</label>
              {newRequirement.preferredLocations.map((location, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => {
                      const newLocations = [...newRequirement.preferredLocations];
                      newLocations[index] = e.target.value;
                      setNewRequirement({ ...newRequirement, preferredLocations: newLocations });
                    }}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newLocations = newRequirement.preferredLocations.filter((_, i) => i !== index);
                        setNewRequirement({ ...newRequirement, preferredLocations: newLocations });
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setNewRequirement({
                  ...newRequirement,
                  preferredLocations: [...newRequirement.preferredLocations, '']
                })}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
              >
                Add Location
              </button>
            </div>

            {newRequirement.type === 'RENTAL' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Lease Term</label>
                  <select
                    value={newRequirement.rentalPreferences.leaseTerm}
                    onChange={(e) => setNewRequirement({
                      ...newRequirement,
                      rentalPreferences: {
                        ...newRequirement.rentalPreferences,
                        leaseTerm: e.target.value
                      }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="Short-term">Short-term</option>
                    <option value="Long-term">Long-term</option>
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newRequirement.rentalPreferences.furnished}
                      onChange={(e) => setNewRequirement({
                        ...newRequirement,
                        rentalPreferences: {
                          ...newRequirement.rentalPreferences,
                          furnished: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Furnished</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newRequirement.rentalPreferences.petsAllowed}
                      onChange={(e) => setNewRequirement({
                        ...newRequirement,
                        rentalPreferences: {
                          ...newRequirement.rentalPreferences,
                          petsAllowed: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Pets Allowed</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Preferred Move-in Date</label>
                  <input
                    type="date"
                    value={newRequirement.rentalPreferences.preferredMoveInDate}
                    onChange={(e) => setNewRequirement({
                      ...newRequirement,
                      rentalPreferences: {
                        ...newRequirement.rentalPreferences,
                        preferredMoveInDate: e.target.value
                      }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Property Age</label>
                  <select
                    value={newRequirement.purchasePreferences.propertyAge}
                    onChange={(e) => setNewRequirement({
                      ...newRequirement,
                      purchasePreferences: {
                        ...newRequirement.purchasePreferences,
                        propertyAge: e.target.value
                      }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select age</option>
                    <option value="New">New Construction</option>
                    <option value="0-5">0-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newRequirement.purchasePreferences.basement}
                      onChange={(e) => setNewRequirement({
                        ...newRequirement,
                        purchasePreferences: {
                          ...newRequirement.purchasePreferences,
                          basement: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Basement</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newRequirement.purchasePreferences.garage}
                      onChange={(e) => setNewRequirement({
                        ...newRequirement,
                        purchasePreferences: {
                          ...newRequirement.purchasePreferences,
                          garage: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Garage</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Lot Size (sqft)</label>
                  <input
                    type="number"
                    value={newRequirement.purchasePreferences.lotSize}
                    onChange={(e) => setNewRequirement({
                      ...newRequirement,
                      purchasePreferences: {
                        ...newRequirement.purchasePreferences,
                        lotSize: e.target.value
                      }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Additional Requirements</label>
              <textarea
                value={newRequirement.additionalRequirements}
                onChange={(e) => setNewRequirement({ ...newRequirement, additionalRequirements: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setShowNewRequirementModal(false)}
                variant="secondary"
                disabled={isLoading('addRequirement')}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddRequirement}
                variant="primary"
                isLoading={isLoading('addRequirement')}
              >
                Add Requirement
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
