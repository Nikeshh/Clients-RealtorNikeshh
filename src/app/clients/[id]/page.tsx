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
    requirement?: {
      id: string;
      name: string;
      type: string;
    };
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
  checklist: Array<{
    id: string;
    text: string;
    completed: boolean;
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
  const [newChecklistItem, setNewChecklistItem] = useState('');

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
      const requirementData = {
        name: newRequirement.name,
        type: newRequirement.type,
        propertyType: newRequirement.propertyType,
        budgetMin: parseFloat(newRequirement.budgetMin) || 0,
        budgetMax: parseFloat(newRequirement.budgetMax) || 0,
        bedrooms: newRequirement.bedrooms ? parseInt(newRequirement.bedrooms) : null,
        bathrooms: newRequirement.bathrooms ? parseInt(newRequirement.bathrooms) : null,
        preferredLocations: newRequirement.preferredLocations.filter(loc => loc.trim() !== ''),
        additionalRequirements: newRequirement.additionalRequirements || '',
        status: 'Active',
        ...(newRequirement.type === 'RENTAL' ? {
          rentalPreferences: {
            leaseTerm: newRequirement.rentalPreferences.leaseTerm,
            furnished: newRequirement.rentalPreferences.furnished,
            petsAllowed: newRequirement.rentalPreferences.petsAllowed,
            maxRentalBudget: parseFloat(newRequirement.rentalPreferences.maxRentalBudget) || 0,
            preferredMoveInDate: newRequirement.rentalPreferences.preferredMoveInDate || null,
          }
        } : {
          purchasePreferences: {
            propertyAge: newRequirement.purchasePreferences.propertyAge || null,
            preferredStyle: newRequirement.purchasePreferences.preferredStyle || null,
            parking: newRequirement.purchasePreferences.parking ? parseInt(newRequirement.purchasePreferences.parking) : null,
            lotSize: newRequirement.purchasePreferences.lotSize ? parseFloat(newRequirement.purchasePreferences.lotSize) : null,
            basement: newRequirement.purchasePreferences.basement,
            garage: newRequirement.purchasePreferences.garage,
          }
        })
      };

      const response = await fetch(`/api/clients/${params.id}/requirements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requirementData),
      });

      if (!response.ok) throw new Error('Failed to add requirement');

      const requirement = await response.json();
      addToast('Requirement added successfully', 'success');
      
      // Redirect to the individual requirement page
      router.push(`/clients/requirements/${requirement.id}`);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to add requirement', 'error');
    } finally {
      setLoading('addRequirement', false);
      setShowNewRequirementModal(false);
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

  const handleEditRequirement = async (requirement: ClientRequirement) => {
    setLoading('editRequirement', true);
    try {
      const response = await fetch(`/api/clients/requirements/${requirement.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requirement),
      });

      if (!response.ok) throw new Error('Failed to update requirement');

      const updatedRequirement = await response.json();
      addToast('Requirement updated successfully', 'success');
      
      // Redirect to the individual requirement page
      router.push(`/clients/requirements/${requirement.id}`);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update requirement', 'error');
    } finally {
      setLoading('editRequirement', false);
      setShowEditRequirementModal(false);
      setEditingRequirement(null);
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

  const handleAddChecklistItem = async () => {
    if (!newChecklistItem.trim()) return;

    setLoading('addChecklistItem', true);
    try {
      const response = await fetch(`/api/clients/${params.id}/checklist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newChecklistItem }),
      });

      if (!response.ok) throw new Error('Failed to add checklist item');
      const newItem = await response.json();

      setClient(prev => ({
        ...prev!,
        checklist: [...(prev?.checklist || []), newItem],
      }));
      setNewChecklistItem('');
      addToast('Checklist item added successfully', 'success');
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to add checklist item', 'error');
    } finally {
      setLoading('addChecklistItem', false);
    }
  };

  const handleToggleChecklistItem = async (itemId: string, completed: boolean) => {
    setLoading(`toggleChecklist-${itemId}`, true);
    try {
      const response = await fetch(`/api/clients/${params.id}/checklist/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed }),
      });

      if (!response.ok) throw new Error('Failed to update checklist item');

      setClient(prev => ({
        ...prev!,
        checklist: prev?.checklist.map(item => 
          item.id === itemId ? { ...item, completed } : item
        ) ?? [],
      }));
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update checklist item', 'error');
    } finally {
      setLoading(`toggleChecklist-${itemId}`, false);
    }
  };

  const handleDeleteChecklistItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this checklist item?')) return;

    setLoading(`deleteChecklist-${itemId}`, true);
    try {
      const response = await fetch(`/api/clients/${params.id}/checklist/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete checklist item');

      setClient(prev => ({
        ...prev!,
        checklist: prev?.checklist?.filter(item => item.id !== itemId) ?? [],
      }));
      addToast('Checklist item deleted successfully', 'success');
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to delete checklist item', 'error');
    } finally {
      setLoading(`deleteChecklist-${itemId}`, false);
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Info Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{client?.name}</h1>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="secondary"
                  size="small"
                >
                  Edit
                </Button>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="text-sm font-medium">{client?.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Phone</dt>
                <dd className="text-sm font-medium">{client?.phone}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Status</dt>
                <dd className="text-sm font-medium">{client?.status}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Client Since</dt>
                <dd className="text-sm font-medium">
                  {client?.createdAt && formatDate(client.createdAt)}
                </dd>
              </div>
            </dl>

            {client?.notes && (
              <div className="mt-4">
                <dt className="text-sm text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                  {client.notes}
                </dd>
              </div>
            )}
          </div>

          {/* Requirements Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Requirements</h2>
              <Button
                onClick={() => setShowNewRequirementModal(true)}
                variant="primary"
                size="small"
              >
                Add Requirement
              </Button>
            </div>

            {/* Requirements List */}
            <div className="space-y-4">
              {client?.requirements.map((requirement) => (
                <div
                  key={requirement.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <Link 
                    href={`/clients/requirements/${requirement.id}`}
                    className="block"
                  >
                    <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600">
                      {requirement.name}
                    </h3>
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
                  </Link>
                </div>
              ))}
              
              {client?.requirements.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No requirements added yet
                </p>
              )}
            </div>
          </div>

          {/* Shared Properties Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Shared Properties
            </h2>
            <div className="space-y-4">
              {client?.sharedProperties.map((shared) => (
                <div
                  key={shared.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  {/* ... shared property content remains the same ... */}
                </div>
              ))}
              
              {client?.sharedProperties.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No properties shared yet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Checklist & Interactions */}
        <div className="space-y-6">
          {/* Checklist Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Checklist</h2>
            
            {/* Add New Item */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                placeholder="Add new checklist item..."
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddChecklistItem()}
              />
              <Button
                onClick={handleAddChecklistItem}
                variant="primary"
                isLoading={isLoading('addChecklistItem')}
                disabled={!newChecklistItem.trim()}
                size="small"
              >
                Add
              </Button>
            </div>

            {/* Checklist Items */}
            <div className="space-y-2">
              {client?.checklist?.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md group transition-opacity ${
                    isLoading(`toggleChecklist-${item.id}`) || isLoading(`deleteChecklist-${item.id}`)
                      ? 'opacity-50'
                      : ''
                  }`}
                >
                  <div className="relative flex items-center w-5 h-5">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={(e) => handleToggleChecklistItem(item.id, e.target.checked)}
                      className={`rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ${
                        isLoading(`toggleChecklist-${item.id}`) ? 'opacity-0' : ''
                      }`}
                      disabled={isLoading(`toggleChecklist-${item.id}`)}
                    />
                    {isLoading(`toggleChecklist-${item.id}`) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent" />
                      </div>
                    )}
                  </div>
                  <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : ''}`}>
                    {item.text}
                  </span>
                  <button
                    onClick={() => handleDeleteChecklistItem(item.id)}
                    className={`text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100 transition-opacity ${
                      isLoading(`deleteChecklist-${item.id}`) ? 'cursor-not-allowed' : ''
                    }`}
                    disabled={isLoading(`deleteChecklist-${item.id}`)}
                  >
                    {isLoading(`deleteChecklist-${item.id}`) ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent" />
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              ))}
              {(!client?.checklist || client.checklist.length === 0) && (
                <p className="text-center text-gray-500 py-4">
                  No checklist items yet
                </p>
              )}
            </div>
          </div>

          {/* Interactions Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Interactions</h2>
              <Button
                onClick={() => setShowAddInteractionModal(true)}
                variant="primary"
                size="small"
              >
                Add Interaction
              </Button>
            </div>

            <div className="space-y-4">
              {client?.interactions.map((interaction) => (
                <div
                  key={interaction.id}
                  className="border-b pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-1">
                        {interaction.type}
                      </span>
                      <p className="text-sm text-gray-900">{interaction.description}</p>
                      {interaction.notes && (
                        <p className="mt-1 text-sm text-gray-500">{interaction.notes}</p>
                      )}
                      {interaction.requirement && (
                        <Link 
                          href={`/clients/requirements/${interaction.requirement.id}`}
                          className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          Related to: {interaction.requirement.name}
                        </Link>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(interaction.date)}
                    </span>
                  </div>
                </div>
              ))}
              
              {client?.interactions.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No interactions recorded yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Interaction Modal */}
      {showAddInteractionModal && (
        <AddInteractionModal
          isOpen={showAddInteractionModal}
          onClose={() => setShowAddInteractionModal(false)}
          clientId={client?.id ?? ""}
          onSubmit={() => {
            loadClient();
            setShowAddInteractionModal(false);
          }}
        />
      )}
    </div>
  );
}
