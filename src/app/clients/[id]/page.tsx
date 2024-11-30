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
import { Activity, CheckSquare, ChevronDown } from 'lucide-react';
import ClientStages from '@/components/ClientStages';
import StartProcessModal from "@/components/StartProcessModal";
import AddChecklistItemForm from '@/components/AddChecklistItemForm';
import React from 'react';

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
  stages: Array<{
    id: string;
    title: string;
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    // ... other stage fields ...
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
  const [client, setClient] = useState<Client | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddStageModal, setShowAddStageModal] = useState(false);
  const [editedData, setEditedData] = useState<Partial<Client> | null>(null);
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();
  const [showAddChecklistModal, setShowAddChecklistModal] = useState(false);
  const [showAddInteractionModal, setShowAddInteractionModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showInteractionsModal, setShowInteractionsModal] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);

  useEffect(() => {
    loadClient();
  }, []);

  const loadClient = async () => {
    setLoading('loadClient', true);
    try {
      const response = await fetch(`/api/clients/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch client');
      const data = await response.json();
      setClient(data);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to load client details', 'error');
    } finally {
      setLoading('loadClient', false);
      setInitialLoadComplete(true);
    }
  };

  const handleChecklistToggle = async (itemId: string, completed: boolean) => {
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

      loadClient();
      addToast('Checklist item updated', 'success');
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update checklist item', 'error');
    } finally {
      setLoading(`toggleChecklist-${itemId}`, false);
    }
  };

  const handleDeleteChecklist = async (itemId: string) => {
    setLoading(`deleteChecklist-${itemId}`, true);
    try {
      const response = await fetch(`/api/clients/${params.id}/checklist/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete checklist item');

      loadClient();
      addToast('Checklist item deleted', 'success');
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to delete checklist item', 'error');
    } finally {
      setLoading(`deleteChecklist-${itemId}`, false);
    }
  };

  const handleEditClient = async () => {
    setLoading('editClient', true);
    try {
      const response = await fetch(`/api/clients/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingClient),
      });

      if (!response.ok) throw new Error('Failed to update client');
      
      addToast('Client updated successfully', 'success');
      loadClient();
      setShowEditModal(false);
      setEditingClient(null);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update client', 'error');
    } finally {
      setLoading('editClient', false);
    }
  };

  const handleStageStatusChange = async (stageId: string, status: string) => {
    setLoading(`updateStageStatus-${stageId}`, true);
    try {
      const response = await fetch(`/api/clients/${params.id}/stages/${stageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update stage status');
      
      addToast('Stage status updated successfully', 'success');
      loadClient();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update stage status', 'error');
    } finally {
      setLoading(`updateStageStatus-${stageId}`, false);
      setShowStatusMenu(null);
    }
  };

  if (!initialLoadComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Error</h2>
          <p className="mt-2 text-gray-600">Failed to load client details</p>
          <button
            onClick={loadClient}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Client Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{client?.name}</h1>
          <p className="text-gray-500">{client?.email}</p>
          <p className="text-gray-500">{client?.phone}</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowChecklistModal(true)}
            variant="secondary"
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            Checklist
          </Button>
          <Button
            onClick={() => setShowInteractionsModal(true)}
            variant="secondary"
          >
            <Activity className="h-4 w-4 mr-2" />
            Interactions
          </Button>
          <Button
            onClick={() => setShowAddStageModal(true)}
            variant="secondary"
          >
            Add Client Stage
          </Button>
          <Button
            onClick={() => {
              setEditingClient(client);
              setShowEditModal(true);
            }}
            variant="secondary"
          >
            Edit Client
          </Button>
        </div>
      </div>

      {/* Client Notes */}
      {client?.notes && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{client.notes}</p>
          </div>
        </div>
      )}

      {/* Client Content */}
      <div className="space-y-6">
        <ClientStages 
          clientId={params.id as string} 
          showAddStageModal={showAddStageModal}
          setShowAddStageModal={setShowAddStageModal}
        />
      </div>

      {/* Edit Client Modal */}
      {showEditModal && editingClient && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingClient(null);
          }}
          title="Edit Client"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={editingClient.name}
                onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={editingClient.email}
                onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={editingClient.phone}
                onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={editingClient.status}
                onChange={(e) => setEditingClient({ ...editingClient, status: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={editingClient.notes || ''}
                onChange={(e) => setEditingClient({ ...editingClient, notes: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingClient(null);
                }}
                variant="secondary"
                disabled={isLoading('editClient')}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditClient}
                variant="primary"
                isLoading={isLoading('editClient')}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Checklist Item Modal */}
      {showAddChecklistModal && (
        <Modal
          isOpen={showAddChecklistModal}
          onClose={() => setShowAddChecklistModal(false)}
          title="Add Checklist Item"
        >
          <AddChecklistItemForm
            clientId={params.id as string}
            onSubmit={() => {
              setShowAddChecklistModal(false);
              loadClient();
            }}
            onCancel={() => setShowAddChecklistModal(false)}
          />
        </Modal>
      )}

      {/* Add Interaction Modal */}
      {showAddInteractionModal && (
        <Modal
          isOpen={showAddInteractionModal}
          onClose={() => setShowAddInteractionModal(false)}
          title="Add Interaction"
        >
          <AddInteractionModal
            clientId={params.id as string}
            onSubmit={() => {
              setShowAddInteractionModal(false);
              loadClient();
            }}
            onCancel={() => setShowAddInteractionModal(false)}
          />
        </Modal>
      )}

      {/* Checklist Modal */}
      <Modal
        isOpen={showChecklistModal}
        onClose={() => setShowChecklistModal(false)}
        title="Client Checklist"
      >
        <div className="space-y-6">
          {/* Add Item Button */}
          <Button
            onClick={() => setShowAddChecklistModal(true)}
            variant="secondary"
            className="w-full"
          >
            Add Checklist Item
          </Button>

          {/* Checklist Items */}
          <div className="space-y-4">
            {client?.checklist?.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={async () => {
                      await handleChecklistToggle(item.id, !item.completed);
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={item.completed ? 'line-through text-gray-500' : 'text-gray-900'}>
                    {item.text}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteChecklist(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            {client?.checklist?.length === 0 && (
              <p className="text-gray-500 text-center py-4">No checklist items</p>
            )}
          </div>
        </div>
      </Modal>

      {/* Interactions Modal */}
      <Modal
        isOpen={showInteractionsModal}
        onClose={() => setShowInteractionsModal(false)}
        title="Recent Interactions"
      >
        <div className="space-y-6">
          {/* Add Item Button */}
          <Button
            onClick={() => setShowAddInteractionModal(true)}
            variant="secondary"
            className="w-full"
          >
            Add Interaction
          </Button>

          {/* Interactions List */}
          <div className="space-y-4">
            {client?.interactions?.map((interaction) => (
              <div key={interaction.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{interaction.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(interaction.date).toLocaleDateString()}
                    </p>
                    {interaction.notes && (
                      <p className="text-sm text-gray-600 mt-2">{interaction.notes}</p>
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-500">
                    {interaction.type}
                  </span>
                </div>
              </div>
            ))}
            {client?.interactions?.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent interactions</p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
