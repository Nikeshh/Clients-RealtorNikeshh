'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast-context';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from '@/components/Button';
import Modal from '@/components/ui/Modal';
import { Plus, Filter } from 'lucide-react';
import Link from 'next/link';
import LeadActions from '@/components/LeadActions';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
  notes?: string;
  createdAt: string;
  convertedAt?: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();
  const [filters, setFilters] = useState({
    status: 'all',
    source: 'all',
    dateFrom: '',
    dateTo: '',
  });

  const [newLead, setNewLead] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    source: 'WEBSITE',
    notes: '',
  });

  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading('loadLeads', true);
    try {
      const response = await fetch('/api/leads');
      if (!response.ok) throw new Error('Failed to fetch leads');
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to load leads', 'error');
    } finally {
      setLoading('loadLeads', false);
    }
  };

  const handleAddLead = async () => {
    setLoading('addLead', true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLead),
      });

      if (!response.ok) throw new Error('Failed to add lead');

      addToast('Lead added successfully', 'success');
      loadLeads();
      setShowAddModal(false);
      setNewLead({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        source: 'WEBSITE',
        notes: '',
      });
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to add lead', 'error');
    } finally {
      setLoading('addLead', false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="secondary"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="mt-4 bg-white p-4 rounded-lg shadow-sm border">
          {/* Add your filter controls here */}
        </div>
      )}

      {/* Leads Table */}
      <div className="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <div className="min-w-full">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Name</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Contact</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Source</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Notes</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Created</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {leads.map((lead) => (
                <tr key={lead.id} className="relative">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                    {lead.firstName} {lead.lastName}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div>{lead.email}</div>
                    <div>{lead.phone}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {lead.source}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      lead.status === 'CONVERTED' ? 'bg-green-100 text-green-800' :
                      lead.status === 'LOST' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500 max-w-xs">
                    <div className="truncate">
                      {lead.notes || '-'}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                    <div className="static">
                      <LeadActions
                        lead={lead}
                        onAction={loadLeads}
                        onEdit={(lead) => {
                          setEditingLead(lead);
                          setShowEditModal(true);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Lead Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Lead"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                value={newLead.firstName}
                onChange={(e) => setNewLead({ ...newLead, firstName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                value={newLead.lastName}
                onChange={(e) => setNewLead({ ...newLead, lastName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={newLead.email}
              onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={newLead.phone}
              onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Source</label>
            <select
              value={newLead.source}
              onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="WEBSITE">Website</option>
              <option value="REFERRAL">Referral</option>
              <option value="SOCIAL">Social Media</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={newLead.notes}
              onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => setShowAddModal(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddLead}
              isLoading={isLoading('addLead')}
              disabled={!newLead.firstName || !newLead.lastName}
            >
              Add Lead
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Lead Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingLead(null);
        }}
        title="Edit Lead"
      >
        {editingLead && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  value={editingLead.firstName}
                  onChange={(e) => setEditingLead({ ...editingLead, firstName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  value={editingLead.lastName}
                  onChange={(e) => setEditingLead({ ...editingLead, lastName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={editingLead.email}
                onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={editingLead.phone}
                onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Source</label>
              <select
                value={editingLead.source}
                onChange={(e) => setEditingLead({ ...editingLead, source: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="WEBSITE">Website</option>
                <option value="REFERRAL">Referral</option>
                <option value="SOCIAL">Social Media</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={editingLead.status}
                onChange={(e) => setEditingLead({ ...editingLead, status: e.target.value as "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST" })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={editingLead.status === 'CONVERTED'}
              >
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="CONVERTED">Converted</option>
                <option value="LOST">Lost</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={editingLead.notes || ''}
                onChange={(e) => setEditingLead({ ...editingLead, notes: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingLead(null);
                }}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  setLoading('updateLead', true);
                  try {
                    const response = await fetch(`/api/leads/${editingLead.id}`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        firstName: editingLead.firstName,
                        lastName: editingLead.lastName,
                        email: editingLead.email,
                        phone: editingLead.phone,
                        source: editingLead.source,
                        status: editingLead.status,
                        notes: editingLead.notes,
                      }),
                    });

                    if (!response.ok) throw new Error('Failed to update lead');

                    addToast('Lead updated successfully', 'success');
                    loadLeads();
                    setShowEditModal(false);
                    setEditingLead(null);
                  } catch (error) {
                    console.error('Error:', error);
                    addToast('Failed to update lead', 'error');
                  } finally {
                    setLoading('updateLead', false);
                  }
                }}
                isLoading={isLoading('updateLead')}
                disabled={!editingLead.firstName || !editingLead.lastName}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
} 