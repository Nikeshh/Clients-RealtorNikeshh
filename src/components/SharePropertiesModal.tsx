'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from './Button';
import Modal from './ui/Modal';
import { Search, X, UserCircle } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface Client {
  id: string;
  name: string;
  email: string;
  lastContact?: string;
}

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  images?: string[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
}

export default function SharePropertiesModal({ isOpen, onClose, property }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<Client[]>([]);
  const [message, setMessage] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  // Load recent clients on mount
  useEffect(() => {
    loadRecentClients();
  }, []);

  // Handle search
  useEffect(() => {
    if (debouncedSearch) {
      searchClients();
    } else {
      setClients(recentClients);
    }
  }, [debouncedSearch]);

  const loadRecentClients = async () => {
    try {
      const response = await fetch('/api/clients?limit=5&sort=lastContact');
      if (!response.ok) throw new Error('Failed to fetch recent clients');
      const data = await response.json();
      setRecentClients(data);
      setClients(data);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to load recent clients', 'error');
    }
  };

  const searchClients = async () => {
    try {
      const response = await fetch(`/api/clients/search?q=${debouncedSearch}`);
      if (!response.ok) throw new Error('Failed to search clients');
      const data = await response.json();
      // Filter out already selected clients
      setClients(data.filter((client: Client) => 
        !selectedClients.some(selected => selected.id === client.id)
      ));
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to search clients', 'error');
    }
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClients([...selectedClients, client]);
    setClients(clients.filter(c => c.id !== client.id));
    setSearchTerm('');
  };

  const handleRemoveClient = (clientId: string) => {
    const removedClient = selectedClients.find(c => c.id === clientId);
    setSelectedClients(selectedClients.filter(c => c.id !== clientId));
    if (removedClient) {
      setClients([removedClient, ...clients]);
    }
  };

  const handleShare = async () => {
    if (selectedClients.length === 0) {
      addToast('Please select at least one client', 'error');
      return;
    }

    setLoading('shareProperty', true);
    try {
      // Send emails to all selected clients
      const promises = selectedClients.map(client => 
        fetch(`/api/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: client.email,
            subject: `Property Recommendation: ${property.title}`,
            template: 'PropertyEmail',
            data: {
              clientName: client.name,
              message: message || 'I thought you might be interested in this property.',
              properties: [{
                title: property.title,
                address: property.address,
                price: property.price,
                imageUrl: property.images?.[0],
              }],
            },
          }),
        })
      );

      const responses = await Promise.all(promises);
      
      // Check if any requests failed
      const failedRequests = responses.filter(response => !response.ok);
      if (failedRequests.length > 0) {
        throw new Error(`Failed to share with ${failedRequests.length} clients`);
      }

      // Create interactions for successful shares
      await Promise.all(selectedClients.map(client =>
        fetch(`/api/clients/${client.id}/interactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'PROPERTY_SHARED',
            description: `Shared property: ${property.title}`,
          }),
        })
      ));

      addToast(`Property shared with ${selectedClients.length} client${selectedClients.length > 1 ? 's' : ''}`, 'success');
      onClose();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to share property', 'error');
    } finally {
      setLoading('shareProperty', false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Property">
      <div className="space-y-4">
        {/* Selected Clients */}
        {selectedClients.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedClients.map((client) => (
              <div
                key={client.id}
                className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full"
              >
                <UserCircle className="h-4 w-4" />
                <span className="text-sm">{client.name}</span>
                <button
                  onClick={() => handleRemoveClient(client.id)}
                  className="hover:text-blue-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Client Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Search or Select Clients
          </label>
          <div className="mt-1 relative">
            <input
              type="text"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-10"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Client List */}
        <div className="mt-2 max-h-48 overflow-y-auto border rounded-md divide-y">
          {clients.length > 0 ? (
            clients.map((client) => (
              <button
                key={client.id}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 flex items-center gap-3"
                onClick={() => handleSelectClient(client)}
              >
                <UserCircle className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="font-medium">{client.name}</div>
                  <div className="text-sm text-gray-500">{client.email}</div>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              No clients found
            </div>
          )}
        </div>

        {/* Message Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Message (Optional)
          </label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
            placeholder="Add a personal message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading('shareProperty')}
          >
            Cancel
          </Button>
          <Button
            onClick={handleShare}
            isLoading={isLoading('shareProperty')}
          >
            Share Property {selectedClients.length > 0 && `(${selectedClients.length})`}
          </Button>
        </div>
      </div>
    </Modal>
  );
} 