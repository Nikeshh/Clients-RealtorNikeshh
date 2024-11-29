"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast-context";
import LoadingSpinner from "@/components/LoadingSpinner";
import Button from "@/components/Button";
import { useLoadingStates } from "@/hooks/useLoadingStates";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import AddInteractionModal from '@/components/AddInteractionModal';
import Modal from "@/components/ui/Modal";

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
  createdAt: string;
  notes: string;
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
  const [isEditing, setIsEditing] = useState(false);
  const [editedClientData, setEditedClientData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "",
    notes: "",
  });
  const [showNewRequirementModal, setShowNewRequirementModal] = useState(false);
  const { setLoading, isLoading } = useLoadingStates();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
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
  const [showAddInteractionModal, setShowAddInteractionModal] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<ClientRequirement | null>(null);
  const [showEditRequirementModal, setShowEditRequirementModal] = useState(false);

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
        notes: data.notes,
      });
    } catch (error) {
      console.error("Error:", error);
      addToast("Failed to load client details", "error");
    } finally {
      setLoading("loadClient", false);
      setInitialLoadComplete(true);
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
      setIsEditing(false);
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

  const handleStatusChange = async (newStatus: string) => {
    setLoading('statusUpdate', true);
    try {
      const response = await fetch(`/api/clients/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      const updatedClient = await response.json();
      setClient(updatedClient);
      addToast('Status updated successfully', 'success');
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update status', 'error');
    } finally {
      setLoading('statusUpdate', false);
    }
  };

  const handleAddInteraction = async (data: any) => {
    setLoading('addInteraction', true);
    try {
      const response = await fetch(`/api/clients/${params.id}/interactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to add interaction');

      const updatedClient = await response.json();
      setClient(updatedClient);
      setShowAddInteractionModal(false);
      addToast('Interaction added successfully', 'success');
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to add interaction', 'error');
    } finally {
      setLoading('addInteraction', false);
    }
  };

  const handleEditRequirement = async (data: any) => {
    setLoading('editRequirement', true);
    try {
      const response = await fetch(`/api/clients/requirements/${editingRequirement?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update requirement');

      const updatedClient = await response.json();
      setClient(updatedClient);
      setShowEditRequirementModal(false);
      addToast('Requirement updated successfully', 'success');
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update requirement', 'error');
    } finally {
      setLoading('editRequirement', false);
    }
  };

  if (!initialLoadComplete || isLoading("loadClient")) {
    return <LoadingSpinner size="large" />;
  }

  if (!client && initialLoadComplete) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Client not found</h2>
          <p className="mt-2 text-gray-600">The client you're looking for doesn't exist or has been removed.</p>
          <div className="mt-6">
            <Button onClick={() => router.push('/clients')} variant="primary">
              Back to Clients
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Actions */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Client' : client?.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Client since {client && new Date(client.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {!isEditing && (
            <>
              <select
                value={client?.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Lead">Lead</option>
              </select>
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Edit Details
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Client Information Card */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        {isEditing ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={editedClientData.notes}
                  onChange={(e) => setEditedClientData({ ...editedClientData, notes: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Add any notes about this client..."
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button onClick={() => setIsEditing(false)} variant="secondary">
                Cancel
              </Button>
              <Button onClick={handleSaveClientChanges} variant="primary" isLoading={isLoading('saveChanges')}>
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{client?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{client?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{client?.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-flex mt-1 items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${client?.status === 'Active' ? 'bg-green-100 text-green-800' : 
                    client?.status === 'Inactive' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'}`}>
                  {client?.status}
                </span>
              </div>
            </div>
            {client?.notes && (
              <div className="p-6">
                <p className="text-sm text-gray-500">Notes</p>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Requirements Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Requirements</h2>
          <Button onClick={() => setShowNewRequirementModal(true)} variant="primary">
            Add Requirement
          </Button>
        </div>
        <div className="p-6">
          {client?.requirements && client?.requirements?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {client.requirements.map((requirement) => (
                <div key={requirement.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{requirement.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {requirement.type} • {requirement.propertyType}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/clients/requirements/${requirement.id}/gather`}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                        >
                          Gather
                        </Link>
                        <button
                          onClick={() => {
                            setEditingRequirement(requirement);
                            setShowEditRequirementModal(true);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">Budget Range</p>
                        <p className="text-sm font-medium">
                          {formatCurrency(requirement.budgetMin)} - {formatCurrency(requirement.budgetMax)}
                        </p>
                      </div>

                      <div className="flex gap-4">
                        {requirement.bedrooms && (
                          <div>
                            <p className="text-xs text-gray-500">Bedrooms</p>
                            <p className="text-sm font-medium">{requirement.bedrooms}+</p>
                          </div>
                        )}
                        {requirement.bathrooms && (
                          <div>
                            <p className="text-xs text-gray-500">Bathrooms</p>
                            <p className="text-sm font-medium">{requirement.bathrooms}+</p>
                          </div>
                        )}
                      </div>

                      {requirement.preferredLocations.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500">Locations</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {requirement.preferredLocations.map((location, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {location}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {requirement.additionalRequirements && (
                        <div>
                          <p className="text-xs text-gray-500">Notes</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {requirement.additionalRequirements}
                          </p>
                        </div>
                      )}

                      {requirement.gatheredProperties && requirement.gatheredProperties.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">
                            Gathered Properties ({requirement.gatheredProperties.length})
                          </p>
                          <div className="space-y-2">
                            {requirement.gatheredProperties.slice(0, 3).map((gathered) => (
                              <div key={gathered.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                                <div className="truncate">
                                  <p className="font-medium truncate">{gathered.property.title}</p>
                                  <p className="text-xs text-gray-500">{formatCurrency(gathered.property.price)}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full
                                  ${gathered.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                    gathered.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'}`}
                                >
                                  {gathered.status}
                                </span>
                              </div>
                            ))}
                            {requirement.gatheredProperties.length > 3 && (
                              <p className="text-xs text-gray-500 text-center">
                                +{requirement.gatheredProperties.length - 3} more properties
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">No requirements added yet.</p>
              <Button
                onClick={() => setShowNewRequirementModal(true)}
                variant="outline"
                className="mt-2"
              >
                Add First Requirement
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Interactions */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Recent Interactions</h2>
          <Button variant="outline" onClick={() => setShowAddInteractionModal(true)}>
            Add Interaction
          </Button>
        </div>
        <div className="divide-y divide-gray-200">
          {client?.interactions.map((interaction) => (
            <div key={interaction.id} className="p-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{interaction.type}</p>
                  <p className="mt-1 text-sm text-gray-500">{interaction.description}</p>
                </div>
                <p className="text-sm text-gray-500">
                  {formatDate(interaction.date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Edit Requirement Modal */}
      {showEditRequirementModal && editingRequirement && (
        <Modal
          isOpen={showEditRequirementModal}
          onClose={() => {
            setShowEditRequirementModal(false);
            setEditingRequirement(null);
          }}
          title="Edit Requirement"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={editingRequirement.name}
                onChange={(e) => setEditingRequirement({
                  ...editingRequirement,
                  name: e.target.value
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            {/* Add other requirement fields here */}

            <div className="flex justify-end gap-3">
              <Button
                onClick={() => {
                  setShowEditRequirementModal(false);
                  setEditingRequirement(null);
                }}
                variant="secondary"
                disabled={isLoading('editRequirement')}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleEditRequirement(editingRequirement)}
                variant="primary"
                isLoading={isLoading('editRequirement')}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Interaction Modal */}
      {showAddInteractionModal && (
        <AddInteractionModal
          isOpen={showAddInteractionModal}
          onClose={() => setShowAddInteractionModal(false)}
          onSubmit={handleAddInteraction}
          clientId={params.id as string}
        />
      )}
    </div>
  );
}
