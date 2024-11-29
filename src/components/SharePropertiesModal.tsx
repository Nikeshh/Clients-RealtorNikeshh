'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast-context';
import Modal from '@/components/ui/Modal';
import Button from '@/components/Button';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import { formatCurrency } from '@/lib/utils';

interface Client {
  id: string;
  name: string;
  email: string;
}

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  images?: string[];
}

interface SharePropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  onShare: () => void;
}

export default function SharePropertiesModal({
  isOpen,
  onClose,
  properties,
  onShare,
}: SharePropertiesModalProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { setLoading, isLoading } = useLoadingStates();
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadClients();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedClients([]);
      setSearchTerm('');
    }
  }, [isOpen]);

  const loadClients = async () => {
    setLoading('loadClients', true);
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) throw new Error('Failed to fetch clients');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to load clients', 'error');
    } finally {
      setLoading('loadClients', false);
    }
  };

  const handleShare = async () => {
    if (selectedClients.length === 0) {
      addToast('Please select at least one client', 'error');
      return;
    }

    setLoading('shareProperties', true);
    try {
      await Promise.all(
        properties.map(async (property) => {
          const response = await fetch('/api/properties/share', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              propertyId: property.id,
              clientIds: selectedClients,
            }),
          });

          if (!response.ok) throw new Error('Failed to share properties');
        })
      );

      addToast('Properties shared successfully', 'success');
      setSelectedClients([]);
      onShare();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to share properties', 'error');
    } finally {
      setLoading('shareProperties', false);
    }
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Properties">
      <div className="space-y-6">
        {/* Properties Preview */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Selected Properties ({properties.length})
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {properties.map((property) => (
              <div
                key={`property-${property.id}`}
                className="flex items-center gap-3 p-2 bg-white rounded-md"
              >
                {property.images?.[0] && (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="h-12 w-12 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {property.title}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{property.address}</p>
                </div>
                <p className="text-sm font-medium text-blue-600">
                  {formatCurrency(property.price)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Client Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Clients
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Client List */}
        <div className="border rounded-md max-h-60 overflow-y-auto">
          {filteredClients.map((client) => (
            <label
              key={`client-${client.id}`}
              className="flex items-center gap-2 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
            >
              <input
                type="checkbox"
                checked={selectedClients.includes(client.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedClients([...selectedClients, client.id]);
                  } else {
                    setSelectedClients(selectedClients.filter(id => id !== client.id));
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{client.name}</p>
                <p className="text-sm text-gray-500">{client.email}</p>
              </div>
            </label>
          ))}
          {filteredClients.length === 0 && (
            <p className="text-center py-4 text-gray-500">
              No clients found matching your search
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="secondary"
            disabled={isLoading('shareProperties')}
          >
            Cancel
          </Button>
          <Button
            onClick={handleShare}
            variant="primary"
            isLoading={isLoading('shareProperties')}
            disabled={selectedClients.length === 0}
          >
            Share with {selectedClients.length} client{selectedClients.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    </Modal>
  );
} 