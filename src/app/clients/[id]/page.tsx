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
import DocumentUpload from '@/components/DocumentUpload';
import { DocumentIcon, ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline';
import OnboardingTasksList from '@/components/OnboardingTasksList';
import StartOnboardingModal from '@/components/StartOnboardingModal';

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
  documents: Array<{
    id: string;
    name: string;
    url: string;
    uploadedAt: string;
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
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [showStartOnboardingModal, setShowStartOnboardingModal] = useState(false);

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

  const handleDocumentUpload = async (files: Array<{ name: string; url: string; type: string }>) => {
    try {
      const response = await fetch(`/api/clients/${params.id}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documents: files }),
      });

      if (!response.ok) throw new Error('Failed to save documents');

      // Reload client data to get updated documents
      loadClient();
      addToast('Documents uploaded successfully', 'success');
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to upload documents', 'error');
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`/api/clients/${params.id}/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete document');

      // Reload client data to get updated documents
      loadClient();
      addToast('Document deleted successfully', 'success');
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to delete document', 'error');
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

            <div className="relative">
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className="flex gap-4 pb-4">
                  {client?.requirements.map((requirement) => (
                    <div
                      key={requirement.id}
                      className="flex-none w-80 border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white"
                    >
                      <Link 
                        href={`/clients/requirements/${requirement.id}`}
                        className="block"
                      >
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600">
                            {requirement.name}
                          </h3>
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {requirement.type} - {requirement.propertyType}
                          </div>
                          <div className="text-sm text-gray-700">
                            <p className="font-medium">Budget:</p>
                            <p>{formatCurrency(requirement.budgetMin)} - {formatCurrency(requirement.budgetMax)}</p>
                          </div>
                          {requirement.preferredLocations.length > 0 && (
                            <div className="text-sm text-gray-700">
                              <p className="font-medium">Locations:</p>
                              <p className="truncate">{requirement.preferredLocations.join(', ')}</p>
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>
                  ))}
                  
                  {client?.requirements.length === 0 && (
                    <div className="w-full text-center text-gray-500 py-4">
                      No requirements added yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Shared Properties Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Shared Properties
            </h2>
            <div className="relative">
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className="flex gap-4 pb-4">
                  {client?.sharedProperties.map((shared) => (
                    <div
                      key={shared.id}
                      className="flex-none w-80 border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
                    >
                      <Link 
                        href={`/properties/${shared.property.id}`}
                        className="block"
                      >
                        <div className="p-4">
                          <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600 truncate">
                            {shared.property.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 truncate">
                            {shared.property.address}
                          </p>
                          <p className="text-sm font-medium text-blue-600 mt-2">
                            {formatCurrency(shared.property.price)}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Shared on: {formatDate(shared.sharedDate)}
                          </p>
                        </div>
                      </Link>
                    </div>
                  ))}
                  
                  {(!client?.sharedProperties || client.sharedProperties.length === 0) && (
                    <div className="w-full text-center text-gray-500 py-4">
                      No properties shared yet
                    </div>
                  )}
                </div>
              </div>
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

            <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                      <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
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

          {/* Documents Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
            </div>

            <DocumentUpload 
              onUpload={(files) => {
                // Handle the uploaded files
                handleDocumentUpload(files);
              }}
              maxFiles={5}
              acceptedTypes={['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']}
            />

            {/* Documents List */}
            <div className="mt-6 space-y-4">
              {client?.documents?.map((document) => (
                <div 
                  key={document.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <DocumentIcon className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{document.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(document.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={document.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5" />
                    </a>
                    <button
                      onClick={() => handleDeleteDocument(document.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
              {(!client?.documents || client.documents.length === 0) && (
                <p className="text-center text-gray-500 py-4">
                  No documents uploaded yet
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

      {/* Add Requirement Modal */}
      <Modal
        isOpen={showNewRequirementModal}
        onClose={() => {
          setShowNewRequirementModal(false);
          setNewRequirement({
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
        }}
        title="Add New Requirement"
      >
        <div className="space-y-4">
          {/* Basic Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={newRequirement.name}
              onChange={(e) => setNewRequirement({ ...newRequirement, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Primary Residence Search"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={newRequirement.type}
                onChange={(e) => setNewRequirement({ 
                  ...newRequirement, 
                  type: e.target.value as 'PURCHASE' | 'RENTAL'
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="PURCHASE">Purchase</option>
                <option value="RENTAL">Rental</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Property Type</label>
              <input
                type="text"
                value={newRequirement.propertyType}
                onChange={(e) => setNewRequirement({ ...newRequirement, propertyType: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Single Family Home"
              />
            </div>
          </div>

          {/* Budget Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Min Budget</label>
              <input
                type="number"
                value={newRequirement.budgetMin}
                onChange={(e) => setNewRequirement({ ...newRequirement, budgetMin: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Budget</label>
              <input
                type="number"
                value={newRequirement.budgetMax}
                onChange={(e) => setNewRequirement({ ...newRequirement, budgetMax: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Bedrooms and Bathrooms */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
              <input
                type="number"
                value={newRequirement.bedrooms}
                onChange={(e) => setNewRequirement({ ...newRequirement, bedrooms: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
              <input
                type="number"
                value={newRequirement.bathrooms}
                onChange={(e) => setNewRequirement({ ...newRequirement, bathrooms: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Preferred Locations */}
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
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter location"
                />
                <Button
                  onClick={() => {
                    const newLocations = newRequirement.preferredLocations.filter((_, i) => i !== index);
                    setNewRequirement({ ...newRequirement, preferredLocations: newLocations });
                  }}
                  variant="danger"
                  size="small"
                  disabled={newRequirement.preferredLocations.length === 1}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              onClick={() => {
                setNewRequirement({
                  ...newRequirement,
                  preferredLocations: [...newRequirement.preferredLocations, '']
                });
              }}
              variant="secondary"
              size="small"
              className="mt-2"
            >
              Add Location
            </Button>
          </div>

          {/* Additional Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Additional Requirements</label>
            <textarea
              value={newRequirement.additionalRequirements}
              onChange={(e) => setNewRequirement({ ...newRequirement, additionalRequirements: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Type-specific preferences */}
          {newRequirement.type === 'RENTAL' ? (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Rental Preferences</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">Lease Term</label>
                <select
                  value={newRequirement.rentalPreferences.leaseTerm}
                  onChange={(e) => setNewRequirement({
                    ...newRequirement,
                    rentalPreferences: { ...newRequirement.rentalPreferences, leaseTerm: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="Long-term">Long-term</option>
                  <option value="Short-term">Short-term</option>
                </select>
              </div>
              
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newRequirement.rentalPreferences.furnished}
                    onChange={(e) => setNewRequirement({
                      ...newRequirement,
                      rentalPreferences: { ...newRequirement.rentalPreferences, furnished: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Furnished</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newRequirement.rentalPreferences.petsAllowed}
                    onChange={(e) => setNewRequirement({
                      ...newRequirement,
                      rentalPreferences: { ...newRequirement.rentalPreferences, petsAllowed: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Pets Allowed</span>
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Purchase Preferences</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Property Age</label>
                  <input
                    type="text"
                    value={newRequirement.purchasePreferences.propertyAge}
                    onChange={(e) => setNewRequirement({
                      ...newRequirement,
                      purchasePreferences: { ...newRequirement.purchasePreferences, propertyAge: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Preferred Style</label>
                  <input
                    type="text"
                    value={newRequirement.purchasePreferences.preferredStyle}
                    onChange={(e) => setNewRequirement({
                      ...newRequirement,
                      purchasePreferences: { ...newRequirement.purchasePreferences, preferredStyle: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newRequirement.purchasePreferences.basement}
                    onChange={(e) => setNewRequirement({
                      ...newRequirement,
                      purchasePreferences: { ...newRequirement.purchasePreferences, basement: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Basement</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newRequirement.purchasePreferences.garage}
                    onChange={(e) => setNewRequirement({
                      ...newRequirement,
                      purchasePreferences: { ...newRequirement.purchasePreferences, garage: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Garage</span>
                </label>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={() => {
                setShowNewRequirementModal(false);
                setNewRequirement({
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
              }}
              variant="secondary"
              disabled={isLoading('addRequirement')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddRequirement}
              variant="primary"
              isLoading={isLoading('addRequirement')}
              disabled={!newRequirement.name.trim()}
            >
              Add Requirement
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Client Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => {
          setIsEditing(false);
          setEditedClientData({
            name: client?.name || "",
            email: client?.email || "",
            phone: client?.phone || "",
            status: client?.status || "",
            notes: client?.notes || "",
          });
        }}
        title="Edit Client"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={editedClientData.name}
              onChange={(e) => setEditedClientData({ ...editedClientData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={editedClientData.email}
              onChange={(e) => setEditedClientData({ ...editedClientData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={editedClientData.phone}
              onChange={(e) => setEditedClientData({ ...editedClientData, phone: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={editedClientData.status}
              onChange={(e) => setEditedClientData({ ...editedClientData, status: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Lead">Lead</option>
              <option value="Past Client">Past Client</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={editedClientData.notes}
              onChange={(e) => setEditedClientData({ ...editedClientData, notes: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={() => {
                setIsEditing(false);
                setEditedClientData({
                  name: client?.name || "",
                  email: client?.email || "",
                  phone: client?.phone || "",
                  status: client?.status || "",
                  notes: client?.notes || "",
                });
              }}
              variant="secondary"
              disabled={isLoading('saveChanges')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveClientChanges}
              variant="primary"
              isLoading={isLoading('saveChanges')}
              disabled={!editedClientData.name.trim()}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Onboarding Section at the bottom */}
      <div className="mt-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Onboarding Process</h2>
            <Button
              onClick={() => setShowStartOnboardingModal(true)}
              variant="primary"
            >
              Start Onboarding
            </Button>
          </div>
          
          <OnboardingTasksList 
            clientId={params.id as string}
            onUpdate={loadClient}
          />
        </div>
      </div>

      {/* Add Start Onboarding Modal */}
      <StartOnboardingModal
        isOpen={showStartOnboardingModal}
        onClose={() => setShowStartOnboardingModal(false)}
        clientId={params.id as string}
        onStart={() => {
          loadClient();
          setShowStartOnboardingModal(false);
        }}
      />
    </div>
  );
}
