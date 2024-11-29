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
    notes?: string;
    requirementId?: string;
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
  const [requirementToDelete, setRequirementToDelete] = useState<ClientRequirement | null>(null);
  const [selectedRequirement, setSelectedRequirement] = useState<ClientRequirement | null>(null);

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
        email: data.email || "",
        phone: data.phone || "",
        status: data.status || "",
        notes: data.notes || "",
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
        body: JSON.stringify({
          ...editedClientData,
          notes: editedClientData.notes || '',
        }),
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
        body: JSON.stringify({
          name: 'New Requirement',
          type: 'PURCHASE',
          propertyType: 'House',
          budgetMin: 0,
          budgetMax: 0,
          preferredLocations: [],
          purchasePreferences: {
            propertyAge: null,
            preferredStyle: null,
            parking: null,
            lotSize: null,
            basement: false,
            garage: false,
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to add requirement');

      const updatedClient = await response.json();
      setClient(updatedClient);
      addToast('Requirement added successfully', 'success');
      
      // Find the newly added requirement and open edit modal
      const newRequirement = updatedClient.requirements[updatedClient.requirements.length - 1];
      setEditingRequirement(newRequirement);
      setShowEditRequirementModal(true);
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

  const handleInteractionAdded = async () => {
    await loadClient();
    setShowAddInteractionModal(false);
    addToast('Interaction added successfully', 'success');
  };

  const handleDeleteRequirement = async (requirement: ClientRequirement) => {
    setRequirementToDelete(requirement);
  };

  const confirmDeleteRequirement = async () => {
    if (!requirementToDelete) return;

    setLoading('deleteRequirement', true);
    try {
      const response = await fetch(`/api/clients/requirements/${requirementToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete requirement');

      await loadClient(); // Refresh client data
      addToast('Requirement deleted successfully', 'success');
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to delete requirement', 'error');
    } finally {
      setLoading('deleteRequirement', false);
      setRequirementToDelete(null);
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
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Requirements</h3>
          <Button
            onClick={handleAddRequirement}
            variant="primary"
            isLoading={isLoading('addRequirement')}
          >
            Add Requirement
          </Button>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {client?.requirements && client.requirements.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {client.requirements.map((requirement) => (
                <div
                  key={requirement.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <Link 
                      href={`/clients/requirements/${requirement.id}`}
                      className="text-lg font-medium text-gray-900 hover:text-blue-600"
                    >
                      {requirement.name}
                    </Link>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingRequirement(requirement);
                          setShowEditRequirementModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRequirement(requirement)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    {requirement.type} - {requirement.propertyType}
                  </p>
                  <p className="text-sm text-gray-700">
                    Budget: {formatCurrency(requirement.budgetMin)} - {formatCurrency(requirement.budgetMax)}
                  </p>
                  {requirement.preferredLocations.length > 0 && (
                    <p className="text-sm text-gray-700 mt-2">
                      Locations: {requirement.preferredLocations.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No requirements added yet. Click the Add Requirement button to get started.
            </p>
          )}
        </div>
      </div>

      {/* Notes and Interactions Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Interactions</h3>
          <Button
            onClick={() => setShowAddInteractionModal(true)}
            variant="primary"
          >
            Add Interaction
          </Button>
        </div>
        <div className="px-4 py-5 sm:p-6 max-h-[500px] overflow-y-auto">
          {client?.interactions && client.interactions.length > 0 ? (
            <div className="flow-root">
              <ul className="-mb-8">
                {client.interactions.map((interaction, idx) => (
                  <li key={interaction.id}>
                    <div className="relative pb-8">
                      {idx !== client.interactions.length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                            <span className="text-white text-sm">
                              {interaction.type[0]}
                            </span>
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-600">
                              {interaction.description}
                            </p>
                            {interaction.notes && (
                              <p className="mt-1 text-sm text-gray-500">
                                {interaction.notes}
                              </p>
                            )}
                            {interaction.requirementId && (
                              <Link 
                                href={`/clients/requirements/${interaction.requirementId}`}
                                className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                                target="_blank"
                              >
                                Related to requirement
                              </Link>
                            )}
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500">
                            {formatDate(interaction.date)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              No interactions recorded yet
            </p>
          )}
        </div>
      </div>

      {/* Edit Requirement Modal */}
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

            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={editingRequirement.type}
                onChange={(e) => setEditingRequirement({
                  ...editingRequirement,
                  type: e.target.value as 'PURCHASE' | 'RENTAL'
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="PURCHASE">Purchase</option>
                <option value="RENTAL">Rental</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Property Type</label>
              <select
                value={editingRequirement.propertyType}
                onChange={(e) => setEditingRequirement({
                  ...editingRequirement,
                  propertyType: e.target.value
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="House">House</option>
                <option value="Apartment">Apartment</option>
                <option value="Condo">Condo</option>
                <option value="Land">Land</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Min Budget</label>
                <input
                  type="number"
                  value={editingRequirement.budgetMin.toString()}
                  onChange={(e) => setEditingRequirement({
                    ...editingRequirement,
                    budgetMin: e.target.value ? parseFloat(e.target.value) : 0
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Budget</label>
                <input
                  type="number"
                  value={editingRequirement.budgetMax.toString()}
                  onChange={(e) => setEditingRequirement({
                    ...editingRequirement,
                    budgetMax: e.target.value ? parseFloat(e.target.value) : 0
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                <input
                  type="number"
                  value={editingRequirement.bedrooms?.toString() || ''}
                  onChange={(e) => setEditingRequirement({
                    ...editingRequirement,
                    bedrooms: e.target.value ? parseInt(e.target.value) : null
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                <input
                  type="number"
                  value={editingRequirement.bathrooms?.toString() || ''}
                  onChange={(e) => setEditingRequirement({
                    ...editingRequirement,
                    bathrooms: e.target.value ? parseInt(e.target.value) : null
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Preferred Locations</label>
              <div className="space-y-2">
                {editingRequirement.preferredLocations.map((location, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => {
                        const newLocations = [...editingRequirement.preferredLocations];
                        newLocations[index] = e.target.value;
                        setEditingRequirement({
                          ...editingRequirement,
                          preferredLocations: newLocations
                        });
                      }}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newLocations = editingRequirement.preferredLocations.filter((_, i) => i !== index);
                        setEditingRequirement({
                          ...editingRequirement,
                          preferredLocations: newLocations
                        });
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setEditingRequirement({
                    ...editingRequirement,
                    preferredLocations: [...editingRequirement.preferredLocations, '']
                  })}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Add Location
                </button>
              </div>
            </div>

            {/* Type-specific preferences */}
            {editingRequirement.type === 'RENTAL' && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium text-gray-900">Rental Preferences</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Lease Term</label>
                  <select
                    value={editingRequirement.rentalPreferences?.leaseTerm || 'Long-term'}
                    onChange={(e) => setEditingRequirement({
                      ...editingRequirement,
                      rentalPreferences: {
                        ...editingRequirement.rentalPreferences!,
                        leaseTerm: e.target.value
                      }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="Short-term">Short-term</option>
                    <option value="Long-term">Long-term</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingRequirement.rentalPreferences?.furnished}
                      onChange={(e) => setEditingRequirement({
                        ...editingRequirement,
                        rentalPreferences: {
                          ...editingRequirement.rentalPreferences!,
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
                      checked={editingRequirement.rentalPreferences?.petsAllowed}
                      onChange={(e) => setEditingRequirement({
                        ...editingRequirement,
                        rentalPreferences: {
                          ...editingRequirement.rentalPreferences!,
                          petsAllowed: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Pets Allowed</span>
                  </label>
                </div>
              </div>
            )}

            {editingRequirement.type === 'PURCHASE' && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium text-gray-900">Purchase Preferences</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Property Age</label>
                    <select
                      value={editingRequirement.purchasePreferences?.propertyAge || ''}
                      onChange={(e) => setEditingRequirement({
                        ...editingRequirement,
                        purchasePreferences: {
                          ...editingRequirement.purchasePreferences!,
                          propertyAge: e.target.value
                        }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">Any</option>
                      <option value="New">New Construction</option>
                      <option value="0-5">0-5 years</option>
                      <option value="5-10">5-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Property Style</label>
                    <input
                      type="text"
                      value={editingRequirement.purchasePreferences?.preferredStyle || ''}
                      onChange={(e) => setEditingRequirement({
                        ...editingRequirement,
                        purchasePreferences: {
                          ...editingRequirement.purchasePreferences!,
                          preferredStyle: e.target.value
                        }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingRequirement.purchasePreferences?.basement}
                      onChange={(e) => setEditingRequirement({
                        ...editingRequirement,
                        purchasePreferences: {
                          ...editingRequirement.purchasePreferences!,
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
                      checked={editingRequirement.purchasePreferences?.garage}
                      onChange={(e) => setEditingRequirement({
                        ...editingRequirement,
                        purchasePreferences: {
                          ...editingRequirement.purchasePreferences!,
                          garage: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Garage</span>
                  </label>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Additional Requirements</label>
              <textarea
                value={editingRequirement.additionalRequirements || ''}
                onChange={(e) => setEditingRequirement({
                  ...editingRequirement,
                  additionalRequirements: e.target.value
                })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

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
          onClose={() => {
            setShowAddInteractionModal(false);
            setSelectedRequirement(null);
          }}
          clientId={params.id as string}
          requirementId={selectedRequirement?.id}
          onSubmit={handleInteractionAdded}
        />
      )}

      {/* Delete Requirement Confirmation Modal */}
      {requirementToDelete && (
        <Modal
          isOpen={!!requirementToDelete}
          onClose={() => setRequirementToDelete(null)}
          title="Delete Requirement"
        >
          <div className="space-y-4">
            <p className="text-gray-500">
              Are you sure you want to delete the requirement "{requirementToDelete.name}"? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setRequirementToDelete(null)}
                variant="secondary"
                disabled={isLoading('deleteRequirement')}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteRequirement}
                variant="danger"
                isLoading={isLoading('deleteRequirement')}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
