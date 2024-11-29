'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast-context';
import Button from '@/components/Button';
import { useLoadingStates } from '@/hooks/useLoadingStates';

export default function NewClientPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'Active',
  });
  const [existingClients, setExistingClients] = useState<any[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const validateClient = async (data: any) => {
    setLoading('validateClient', true);
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'validate',
          ...data
        }),
      });

      const result = await response.json();

      if (response.status === 409) {
        setExistingClients(result.matches);
        setShowConfirmation(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error validating client:', error);
      addToast('Failed to validate client', 'error');
      return false;
    } finally {
      setLoading('validateClient', false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // First, validate the client
    const hasExisting = await validateClient(formData);
    if (hasExisting) {
      return; // Stop here and wait for user confirmation
    }

    await createClient(false);
  };

  const createClient = async (force: boolean) => {
    setLoading('createClient', true);
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          forceCreate: force
        }),
      });

      if (!response.ok) throw new Error('Failed to create client');

      const newClient = await response.json();
      addToast('Client created successfully', 'success');
      router.push(`/clients/${newClient.id}`);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to create client', 'error');
    } finally {
      setLoading('createClient', false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Add New Client</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Lead">Lead</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            onClick={() => router.back()}
            variant="secondary"
            disabled={isLoading('createClient') || isLoading('validateClient')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading('createClient') || isLoading('validateClient')}
          >
            Create Client
          </Button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Clients Found</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                We found similar clients in the system. Would you like to proceed with creating a new client?
              </p>
              <div className="mt-4 space-y-3">
                {existingClients.map((client) => (
                  <div key={client.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-gray-500">{client.email}</p>
                    <p className="text-sm text-gray-500">{client.phone}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setShowConfirmation(false)}
                variant="secondary"
                disabled={isLoading('createClient')}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowConfirmation(false);
                  createClient(true);
                }}
                variant="primary"
                isLoading={isLoading('createClient')}
              >
                Create Anyway
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 