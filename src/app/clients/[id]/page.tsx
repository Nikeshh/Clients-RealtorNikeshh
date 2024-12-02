"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/components/ui/toast-context";
import { useLoadingStates } from "@/hooks/useLoadingStates";
import Button from "@/components/Button";
import Modal from "@/components/ui/Modal";
import EditClientModal from "@/components/EditClientModal";
import ProcessList from "@/components/ProcessList";
import RequirementList from "@/components/RequirementList";
import ChecklistList from "@/components/ChecklistList";
import {
  MessageSquare,
  CheckSquare,
  Clock,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import DocumentList from "@/components/DocumentList";

interface Process {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  dueDate: Date | null;
  completedAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  requestId: string | null;
  tasks: Array<{
    id: string;
    type: string;
    status: string;
  }>;
}

interface Requirement {
  id: string;
  name: string;
  type: string;
  propertyType: string;
  budgetMin: number;
  budgetMax: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  preferredLocations: string[];
  additionalRequirements?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  requestId: string | null;
  gatheredProperties: Array<{
    id: string;
    title: string;
    address?: string;
    price?: number;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    link: string;
  }>;
  rentalPreferences?: {
    leaseTerm: string;
    furnished: boolean;
    petsAllowed: boolean;
    maxRentalBudget: number;
    preferredMoveInDate?: string;
  };
  purchasePreferences?: {
    propertyAge?: string;
    preferredStyle?: string;
    parking?: number;
    lotSize?: number;
    basement?: boolean;
    garage?: boolean;
  };
  checklist?: Array<{
    id: string;
    text: string;
    completed: boolean;
  }>;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  notes?: string;
  createdAt: string;
  requests: Array<{
    id: string;
    type: string;
    status: string;
    createdAt: string;
    processes: Process[];
    requirements: Requirement[];
  }>;
  checklist: Array<{
    id: string;
    text: string;
    completed: boolean;
  }>;
  interactions: Array<{
    id: string;
    type: string;
    description: string;
    date: string;
  }>;
}

export default function ClientPage() {
  const params = useParams();
  const clientId = params.id as string;
  const [client, setClient] = useState<Client | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddInteractionModal, setShowAddInteractionModal] = useState(false);
  const [showAddRequestModal, setShowAddRequestModal] = useState(false);
  const [interactionNote, setInteractionNote] = useState("");
  const [newRequestType, setNewRequestType] = useState("RENTAL");
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();
  const [collapsedRequests, setCollapsedRequests] = useState<Set<string>>(
    () => {
      const collapsed = new Set<string>();
      return collapsed;
    }
  );

  useEffect(() => {
    loadClient();
  }, [clientId]);

  useEffect(() => {
    if (client) {
      const collapsed = new Set<string>();
      client.requests.forEach((request) => {
        if (request.status !== "ACTIVE") {
          collapsed.add(request.id);
        }
      });
      setCollapsedRequests(collapsed);
    }
  }, [client]);

  const loadClient = async () => {
    setLoading("loadClient", true);
    try {
      const response = await fetch(`/api/clients/${clientId}`);
      if (!response.ok) throw new Error("Failed to fetch client");
      const data = await response.json();
      setClient(data);
    } catch (error) {
      console.error("Error:", error);
      addToast("Failed to load client", "error");
    } finally {
      setLoading("loadClient", false);
    }
  };

  const handleAddInteraction = async () => {
    setLoading("addInteraction", true);
    try {
      const response = await fetch(`/api/clients/${clientId}/interactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "NOTE",
          description: interactionNote,
        }),
      });

      if (!response.ok) throw new Error("Failed to add interaction");

      addToast("Interaction added successfully", "success");
      setInteractionNote("");
      setShowAddInteractionModal(false);
      loadClient();
    } catch (error) {
      console.error("Error:", error);
      addToast("Failed to add interaction", "error");
    } finally {
      setLoading("addInteraction", false);
    }
  };

  const handleAddRequest = async () => {
    setLoading("addRequest", true);
    try {
      const response = await fetch(`/api/clients/${clientId}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newRequestType,
        }),
      });

      if (!response.ok) throw new Error("Failed to add request");

      addToast("Request added successfully", "success");
      setShowAddRequestModal(false);
      loadClient();
    } catch (error) {
      console.error("Error:", error);
      addToast("Failed to add request", "error");
    } finally {
      setLoading("addRequest", false);
    }
  };

  const handleRequestStatusChange = async (
    requestId: string,
    status: string
  ) => {
    setLoading(`requestStatus-${requestId}`, true);
    try {
      const response = await fetch(
        `/api/clients/${clientId}/requests/${requestId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) throw new Error("Failed to update request status");

      addToast("Request status updated successfully", "success");
      loadClient();
    } catch (error) {
      console.error("Error:", error);
      addToast("Failed to update request status", "error");
    } finally {
      setLoading(`requestStatus-${requestId}`, false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100";
      case "COMPLETED":
        return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";
      case "ON_HOLD":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";
    }
  };

  const toggleRequest = (requestId: string) => {
    const newCollapsed = new Set(collapsedRequests);
    if (newCollapsed.has(requestId)) {
      newCollapsed.delete(requestId);
    } else {
      newCollapsed.add(requestId);
    }
    setCollapsedRequests(newCollapsed);
  };

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Client Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            <div className="mt-1 text-sm text-gray-500">
              <p>{client.email}</p>
              <p>{client.phone}</p>
              <p className="mt-2">
                Status: <span className="font-medium">{client.status}</span>
              </p>
              <p className="mt-2">Notes: {client.notes}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddRequestModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Request
            </Button>
            <Button onClick={() => setShowAddInteractionModal(true)}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Add Interaction
            </Button>
            <Button variant="secondary" onClick={() => setShowEditModal(true)}>
              Edit Client
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requests Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Requests</h2>
          </div>
          {client.requests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-sm">
              <div
                className="p-6 cursor-pointer"
                onClick={() => toggleRequest(request.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {request.type} Request
                    </h3>
                    <div className="mt-2">
                      <select
                        value={request.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleRequestStatusChange(request.id, e.target.value);
                        }}
                        className={`
                          ${getStatusColor(request.status)}
                          inline-flex items-center px-3 py-1 
                          rounded-full text-sm font-medium border
                          transition-colors duration-150 ease-in-out
                          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                        disabled={isLoading(`requestStatus-${request.id}`)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option
                          value="ACTIVE"
                          className="bg-white text-gray-700"
                        >
                          🟢 Active
                        </option>
                        <option
                          value="COMPLETED"
                          className="bg-white text-blue-700"
                        >
                          ✅ Completed
                        </option>
                        <option
                          value="CANCELLED"
                          className="bg-white text-red-700"
                        >
                          ❌ Cancelled
                        </option>
                        <option
                          value="ON_HOLD"
                          className="bg-white text-yellow-700"
                        >
                          ⏸️ On Hold
                        </option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">
                      Created:{" "}
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                    {collapsedRequests.has(request.id) ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {!collapsedRequests.has(request.id) && (
                <div className="px-6 pb-6 space-y-6 border-t pt-6">
                  <ProcessList
                    processes={request.processes}
                    clientId={clientId}
                    requestId={request.id}
                    onUpdate={loadClient}
                  />

                  <RequirementList
                    requirements={request.requirements}
                    clientId={clientId}
                    requestId={request.id}
                    onUpdate={loadClient}
                  />
                </div>
              )}
            </div>
          ))}
          {client.requests.length === 0 && (
            <div className="text-center py-8 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500">
                No requests yet. Create your first request to get started.
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Client Checklist - Moved above Recent Activity */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Client Checklist
            </h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <ChecklistList
                checklist={client.checklist}
                clientId={clientId}
                onUpdate={loadClient}
              />
            </div>
          </div>

          {/* Documents */}
          <div className="mb-6">
            <DocumentList clientId={client.id} onUpdate={loadClient} />
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {client.interactions.map((interaction) => (
                  <div
                    key={interaction.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <Clock className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">
                        {new Date(interaction.date).toLocaleString()}
                      </p>
                      <p className="mt-1">{interaction.description}</p>
                    </div>
                  </div>
                ))}
                {client.interactions.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    No recent activity
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditClientModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        client={client}
        onUpdate={loadClient}
      />

      <Modal
        isOpen={showAddInteractionModal}
        onClose={() => setShowAddInteractionModal(false)}
        title="Add Interaction"
      >
        <div className="space-y-4">
          <textarea
            className="w-full h-32 p-2 border rounded-md"
            placeholder="Enter interaction details..."
            value={interactionNote}
            onChange={(e) => setInteractionNote(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowAddInteractionModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddInteraction}
              isLoading={isLoading("addInteraction")}
            >
              Add
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showAddRequestModal}
        onClose={() => setShowAddRequestModal(false)}
        title="Add Request"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Request Type
            </label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={newRequestType}
              onChange={(e) => setNewRequestType(e.target.value)}
            >
              <option value="RENTAL">Rental</option>
              <option value="BUYING">Buying</option>
              <option value="SELLER">Seller</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowAddRequestModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddRequest}
              isLoading={isLoading("addRequest")}
            >
              Add Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
