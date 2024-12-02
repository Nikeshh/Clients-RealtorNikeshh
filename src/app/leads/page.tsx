'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast-context';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from '@/components/Button';
import Modal from '@/components/ui/Modal';
import { Plus, Filter, PencilIcon } from 'lucide-react';
import Link from 'next/link';

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

const LEAD_STAGES = {
  NEW: {
    label: 'New',
    color: 'bg-blue-100 text-blue-800'
  },
  CONTACTED: {
    label: 'Contacted',
    color: 'bg-yellow-100 text-yellow-800'
  },
  QUALIFIED: {
    label: 'Qualified',
    color: 'bg-green-100 text-green-800'
  },
  CONVERTED: {
    label: 'Converted',
    color: 'bg-purple-100 text-purple-800'
  },
  LOST: {
    label: 'Lost',
    color: 'bg-red-100 text-red-800'
  }
} as const;

type LeadStage = keyof typeof LEAD_STAGES;

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

  const handleConvertToClient = async (leadId: string) => {
    setLoading(`convert-${leadId}`, true);
    try {
      const response = await fetch(`/api/leads/${leadId}/convert`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to convert lead');

      addToast('Lead converted to client successfully', 'success');
      loadLeads();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to convert lead', 'error');
    } finally {
      setLoading(`convert-${leadId}`, false);
    }
  };

  const handleStageChange = async (leadId: string, newStatus: LeadStage) => {
    setLoading(`updateStage-${leadId}`, true);
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) throw new Error('Failed to update lead status');

      addToast('Lead status updated successfully', 'success');
      loadLeads(); // Refresh the leads list
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update lead status', 'error');
    } finally {
      setLoading(`updateStage-${leadId}`, false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (filters.status !== 'all' && lead.status !== filters.status) return false;
    if (filters.source !== 'all' && lead.source !== filters.source) return false;
    if (filters.dateFrom && new Date(lead.createdAt) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(lead.createdAt) > new Date(filters.dateTo)) return false;
    return true;
  });

  if (isLoading('loadLeads')) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <div className="mt-4 flex md:mt-0 gap-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="secondary"
          >
            <Filter className="h-5 w-5 mr-1" />
            Filters
          </Button>
          <Button
            onClick={() => setShowAddModal(true)}
            variant="primary"
          >
            <Plus className="h-5 w-5 mr-1" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="CONVERTED">Converted</option>
                <option value="LOST">Lost</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Source</label>
              <select
                value={filters.source}
                onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Sources</option>
                <option value="WEBSITE">Website</option>
                <option value="REFERRAL">Referral</option>
                <option value="SOCIAL">Social Media</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Leads Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLeads.map((lead) => (
              <tr key={lead.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {lead.firstName} {lead.lastName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{lead.email}</div>
                  <div className="text-sm text-gray-500">{lead.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {lead.source}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={lead.status}
                    onChange={(e) => handleStageChange(lead.id, e.target.value as LeadStage)}
                    disabled={isLoading(`updateStage-${lead.id}`)}
                    className={`px-2 py-1 text-sm font-semibold rounded-full border-0 
                      ${LEAD_STAGES[lead.status as LeadStage].color}
                      disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {Object.entries(LEAD_STAGES).map(([value, { label }]) => (
                      <option 
                        key={value} 
                        value={value}
                        disabled={lead.status === 'CONVERTED' && value !== 'CONVERTED'}
                      >
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="max-w-xs truncate text-sm text-gray-500">
                      {lead.notes || 'No notes'}
                    </div>
                    <button
                      onClick={() => {
                        setEditingLead(lead);
                        setShowEditModal(true);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <PencilIcon className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    onClick={() => handleConvertToClient(lead.id)}
                    variant="primary"
                    size="small"
                    disabled={lead.status === 'CONVERTED' || lead.status === 'LOST'}
                    isLoading={isLoading(`convert-${lead.id}`)}
                  >
                    Convert to Client
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={() => setShowAddModal(false)}
              variant="secondary"
              disabled={isLoading('addLead')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddLead}
              variant="primary"
              isLoading={isLoading('addLead')}
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
        title={`Edit Lead: ${editingLead?.firstName} ${editingLead?.lastName}`}
      >
        <div className="space-y-4">
          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                value={editingLead?.firstName || ''}
                onChange={(e) => setEditingLead(lead => lead ? {
                  ...lead,
                  firstName: e.target.value
                } : null)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                value={editingLead?.lastName || ''}
                onChange={(e) => setEditingLead(lead => lead ? {
                  ...lead,
                  lastName: e.target.value
                } : null)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={editingLead?.email || ''}
              onChange={(e) => setEditingLead(lead => lead ? {
                ...lead,
                email: e.target.value
              } : null)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={editingLead?.phone || ''}
              onChange={(e) => setEditingLead(lead => lead ? {
                ...lead,
                phone: e.target.value
              } : null)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Source</label>
              <select
                value={editingLead?.source || 'WEBSITE'}
                onChange={(e) => setEditingLead(lead => lead ? {
                  ...lead,
                  source: e.target.value
                } : null)}
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
                value={editingLead?.status}
                onChange={(e) => setEditingLead(lead => lead ? {
                  ...lead,
                  status: e.target.value as LeadStage
                } : null)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {Object.entries(LEAD_STAGES).map(([value, { label }]) => (
                  <option 
                    key={value} 
                    value={value}
                    disabled={editingLead?.status === 'CONVERTED' && value !== 'CONVERTED'}
                  >
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={editingLead?.notes || ''}
              onChange={(e) => setEditingLead(lead => lead ? {
                ...lead,
                notes: e.target.value
              } : null)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Add any relevant notes about this lead..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contact History</label>
            <div className="mt-1 space-y-2">
              <div className="text-sm text-gray-500">
                Created: {new Date(editingLead?.createdAt || '').toLocaleDateString()}
              </div>
              {editingLead?.convertedAt && (
                <div className="text-sm text-green-600">
                  Converted: {new Date(editingLead.convertedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between gap-3 mt-6">
            <Button
              onClick={async () => {
                if (!editingLead?.id) return;
                
                if (!confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
                  return;
                }

                setLoading('deleteLead', true);
                try {
                  const response = await fetch(`/api/leads/${editingLead.id}`, {
                    method: 'DELETE',
                  });

                  if (!response.ok) throw new Error('Failed to delete lead');

                  addToast('Lead deleted successfully', 'success');
                  loadLeads();
                  setShowEditModal(false);
                  setEditingLead(null);
                } catch (error) {
                  console.error('Error:', error);
                  addToast('Failed to delete lead', 'error');
                } finally {
                  setLoading('deleteLead', false);
                }
              }}
              variant="danger"
              isLoading={isLoading('deleteLead')}
            >
              Delete Lead
            </Button>

            <div className="flex gap-2">
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
                  if (!editingLead) return;
                  
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
                variant="primary"
                isLoading={isLoading('updateLead')}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
} 