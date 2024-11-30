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
import { Activity } from 'lucide-react';
import ClientStages from '@/components/ClientStages';
import StartProcessModal from "@/components/StartProcessModal";

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
  const [client, setClient] = useState<Client | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddStageModal, setShowAddStageModal] = useState(false);
  const [editedData, setEditedData] = useState<Partial<Client> | null>(null);
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

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
      setEditedData(data);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to load client details', 'error');
    } finally {
      setLoading('loadClient', false);
    }
  };

  const handleChecklistToggle = async (itemId: string) => {
    setLoading(`toggleChecklist-${itemId}`, true);
    try {
      const response = await fetch(`/api/clients/${params.id}/checklist/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !client?.checklist.find(item => item.id === itemId)?.completed
        }),
      });

      if (!response.ok) throw new Error('Failed to update checklist item');

      loadClient();
      addToast('Checklist updated successfully', 'success');
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
      addToast('Checklist item deleted successfully', 'success');
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to delete checklist item', 'error');
    } finally {
      setLoading(`deleteChecklist-${itemId}`, false);
    }
  };

  const handleEditClient = async () => {
    if (!editedData) return;
    
    setLoading('editClient', true);
    try {
      const response = await fetch(`/api/clients/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedData),
      });

      if (!response.ok) throw new Error('Failed to update client');

      addToast('Client updated successfully', 'success');
      loadClient();
      setIsEditing(false);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update client', 'error');
    } finally {
      setLoading('editClient', false);
    }
  };

  if (isLoading('loadClient')) {
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
            onClick={() => setShowAddStageModal(true)}
            variant="secondary"
          >
            Add Stage
          </Button>
          <Button
            onClick={() => setIsEditing(true)}
            variant="primary"
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

        {/* Client Checklist */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Checklist</h2>
            <div className="space-y-4">
              {client?.checklist?.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleChecklistToggle(item.id)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <span className="ml-3 text-gray-700">{item.text}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteChecklist(item.id)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
              {client?.checklist?.length === 0 && (
                <p className="text-gray-500 text-center">No checklist items</p>
              )}
            </div>
          </div>
        </div>

        {/* Client Interactions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Interactions</h2>
            <div className="space-y-4">
              {client?.interactions?.map((interaction) => (
                <div key={interaction.id} className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{interaction.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(interaction.date).toLocaleDateString()}
                    </p>
                    {interaction.notes && (
                      <p className="mt-1 text-sm text-gray-600">{interaction.notes}</p>
                    )}
                  </div>
                </div>
              ))}
              {client?.interactions?.length === 0 && (
                <p className="text-gray-500 text-center">No recent interactions</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Client Modal */}
      {isEditing && editedData && (
        <Modal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          title="Edit Client"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={editedData?.name || ''}
                onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={editedData?.email || ''}
                onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={editedData?.phone || ''}
                onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={editedData?.notes || ''}
                onChange={(e) => setEditedData({ ...editedData, notes: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setIsEditing(false)}
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
    </div>
  );
}
