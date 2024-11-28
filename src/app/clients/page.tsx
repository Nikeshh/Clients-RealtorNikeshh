'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { clientApi } from '@/lib/api';
import { useToast } from '@/components/ui/toast-context';
import LoadingSpinner from '@/components/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import Button from '@/components/Button';

interface ClientRequirements {
  propertyType: string;
  budgetMin: number;
  budgetMax: number;
  bedrooms: number | null;
  bathrooms: number | null;
  preferredLocations: string[];
  additionalRequirements?: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  lastContact: string;
  requirements: ClientRequirements;
  pinned: boolean;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { addToast } = useToast();
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState<string | null>(null);
  const [isPinning, setIsPinning] = useState<string | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) throw new Error('Failed to fetch clients');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      addToast('Failed to load clients', 'error');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || 
      client.status.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (client: Client) => {
    setClientToDelete(client);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/clients/${clientToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete client');

      addToast('Client deleted successfully', 'success');
      setClients(clients.filter(c => c.id !== clientToDelete.id));
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to delete client', 'error');
    } finally {
      setIsDeleting(false);
      setClientToDelete(null);
    }
  };

  const handleStatusChange = async (clientId: string, newStatus: string) => {
    setIsStatusUpdating(clientId);
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      const updatedClient = await response.json();
      setClients(clients.map(client => 
        client.id === clientId ? { ...client, status: newStatus } : client
      ));
      addToast('Status updated successfully', 'success');
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update status', 'error');
    } finally {
      setIsStatusUpdating(null);
    }
  };

  const handlePinToggle = async (clientId: string, currentPinned: boolean) => {
    setIsPinning(clientId);
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pinned: !currentPinned,
        }),
      });

      if (!response.ok) throw new Error('Failed to update pin status');

      setClients(clients.map(client => 
        client.id === clientId ? { ...client, pinned: !currentPinned } : client
      ));
      addToast(`Client ${currentPinned ? 'unpinned' : 'pinned'} successfully`, 'success');
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update pin status', 'error');
    } finally {
      setIsPinning(null);
    }
  };

  const sortedClients = [...filteredClients].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return a.name.localeCompare(b.name);
  });

  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-blue-900 sm:truncate sm:text-3xl">
            Clients
          </h2>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link href="/clients/new">
            <Button variant="primary">Add New Client</Button>
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div>
          <input
            type="text"
            placeholder="Search clients..."
            className="block w-full rounded-lg border border-blue-200 px-4 py-2.5 text-gray-700 shadow-sm focus:border-blue-400 focus:ring-blue-400 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            className="block w-full rounded-lg border border-blue-200 px-4 py-2.5 text-gray-700 shadow-sm focus:border-blue-400 focus:ring-blue-400 transition-colors"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!clientToDelete}
        onClose={() => setClientToDelete(null)}
        title="Delete Client"
      >
        <div className="space-y-4">
          <p className="text-gray-500">
            Are you sure you want to delete {clientToDelete?.name}? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => setClientToDelete(null)}
              variant="secondary"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              variant="danger"
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Clients Table */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden shadow-md rounded-lg bg-white">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="w-10 px-3 py-3.5"></th>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-blue-900">Name</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900">Contact</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900">Status</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900">Last Contact</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {sortedClients.map((client) => (
                    <tr 
                      key={client.id} 
                      className={`hover:bg-blue-50 transition-colors ${
                        client.pinned ? 'bg-yellow-50' : ''
                      }`}
                    >
                      <td className="w-10 px-3 py-4">
                        <button
                          onClick={() => handlePinToggle(client.id, client.pinned)}
                          disabled={isPinning === client.id}
                          className={`text-gray-400 hover:text-yellow-500 transition-colors ${
                            client.pinned ? 'text-yellow-500' : ''
                          }`}
                        >
                          {isPinning === client.id ? (
                            <div className="animate-spin h-5 w-5 border-2 border-yellow-500 rounded-full border-t-transparent" />
                          ) : (
                            <svg 
                              className="h-5 w-5" 
                              fill={client.pinned ? 'currentColor' : 'none'} 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
                              />
                            </svg>
                          )}
                        </button>
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-blue-900">
                        {client.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                        <div>{client.email}</div>
                        <div>{client.phone}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <select
                          value={client.status}
                          onChange={(e) => handleStatusChange(client.id, e.target.value)}
                          disabled={isStatusUpdating === client.id}
                          className={`rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                            isStatusUpdating === client.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Lead">Lead</option>
                        </select>
                        {isStatusUpdating === client.id && (
                          <div className="mt-1">
                            <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                        {new Date(client.lastContact).toLocaleDateString()}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end gap-2">
                          <Link 
                            href={`/clients/${client.id}`} 
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            View<span className="sr-only">, {client.name}</span>
                          </Link>
                          <button
                            onClick={() => handleDelete(client)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            Delete<span className="sr-only">, {client.name}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No clients found. Add your first client to get started.</p>
        </div>
      )}
    </div>
  );
} 