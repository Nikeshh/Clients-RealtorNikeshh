'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast-context';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/Button';
import Modal from '@/components/ui/Modal';
import { Plus, Filter, DollarSign, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Client {
  id: string;
  name: string;
  email: string;
}

interface Commission {
  id: string;
  amount: number;
  percentage: number;
  status: 'PENDING' | 'RECEIVED' | 'OVERDUE' | 'CANCELLED';
  propertyTitle: string;
  dueDate: string;
  receivedDate?: string;
  notes?: string;
  client: {
    id: string;
    name: string;
    email: string;
  };
  transactions: Array<{
    id: string;
    date: string;
    amount: number;
  }>;
}

interface GatheredProperty {
  id: string;
  title: string;
  requirementId: string;
}

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();
  const [clients, setClients] = useState<Client[]>([]);
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
  });
  const [newCommission, setNewCommission] = useState({
    clientId: '',
    propertyTitle: '',
    amount: '',
    percentage: '',
    dueDate: '',
    notes: '',
  });
  const [clientProperties, setClientProperties] = useState<GatheredProperty[]>([]);
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadCommissions();
  }, []);

  useEffect(() => {
    if (showAddModal) {
      loadClients();
    }
  }, [showAddModal]);

  const loadCommissions = async () => {
    setLoading('loadCommissions', true);
    try {
      const response = await fetch('/api/finances/commissions');
      if (!response.ok) throw new Error('Failed to fetch commissions');
      const data = await response.json();
      setCommissions(data.commissions);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to load commissions', 'error');
    } finally {
      setLoading('loadCommissions', false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) throw new Error('Failed to fetch clients');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to load clients', 'error');
    }
  };

  const loadClientProperties = async (clientId: string) => {
    try {
      const response = await fetch(`/api/finances/commissions?clientId=${clientId}`);
      if (!response.ok) throw new Error('Failed to fetch client data');
      const data = await response.json();
      setClientProperties(data.clientProperties);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to load client properties', 'error');
    }
  };

  const handleAddCommission = async () => {
    setLoading('addCommission', true);
    try {
      const response = await fetch('/api/finances/commissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCommission),
      });

      if (!response.ok) throw new Error('Failed to add commission');

      addToast('Commission added successfully', 'success');
      loadCommissions();
      setShowAddModal(false);
      setNewCommission({
        clientId: '',
        propertyTitle: '',
        amount: '',
        percentage: '',
        dueDate: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to add commission', 'error');
    } finally {
      setLoading('addCommission', false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCommissions = commissions.filter(commission => {
    if (filters.status !== 'all' && commission.status !== filters.status) return false;
    if (filters.dateFrom && new Date(commission.dueDate) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(commission.dueDate) > new Date(filters.dateTo)) return false;
    if (filters.minAmount && commission.amount < parseFloat(filters.minAmount)) return false;
    if (filters.maxAmount && commission.amount > parseFloat(filters.maxAmount)) return false;
    return true;
  });

  const totalCommissions = filteredCommissions.filter(c => c.status !== 'CANCELLED').reduce((sum, c) => sum + c.amount, 0);
  const pendingCommissions = filteredCommissions
    .filter(c => c.status === 'PENDING')
    .reduce((sum, c) => sum + c.amount, 0);
  const overdueCommissions = filteredCommissions
    .filter(c => c.status === 'OVERDUE')
    .reduce((sum, c) => sum + c.amount, 0);
  const cancelledCommissions = filteredCommissions
    .filter(c => c.status === 'CANCELLED')
    .reduce((sum, c) => sum + c.amount, 0);

  const handleAmountChange = (amount: string) => {
    setNewCommission({
      ...newCommission,
      amount,
    });
  };

  const handlePercentageChange = (percentage: string) => {
    setNewCommission({
      ...newCommission,
      percentage,
    });
  };

  const handleClientChange = (clientId: string) => {
    setNewCommission({ ...newCommission, clientId, propertyTitle: '' });
    if (clientId) {
      loadClientProperties(clientId);
    } else {
      setClientProperties([]);
    }
  };

  const handleEdit = async () => {
    if (!editingCommission) return;
    
    setLoading('editCommission', true);
    try {
      const response = await fetch(`/api/finances/commissions/${editingCommission.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(editingCommission.amount.toString()),
          percentage: parseFloat(editingCommission.percentage.toString()),
          status: editingCommission.status,
          dueDate: editingCommission.dueDate,
          notes: editingCommission.notes,
        }),
      });

      if (!response.ok) throw new Error('Failed to update commission');

      addToast('Commission updated successfully', 'success');
      loadCommissions();
      setShowEditModal(false);
      setEditingCommission(null);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update commission', 'error');
    } finally {
      setLoading('editCommission', false);
    }
  };

  const handleDeleteCommission = async (id: string) => {
    setLoading(`deleteCommission-${id}`, true);
    try {
      const response = await fetch(`/api/finances/commissions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete commission');

      addToast('Commission deleted successfully', 'success');
      loadCommissions();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to delete commission', 'error');
    } finally {
      setLoading(`deleteCommission-${id}`, false);
    }
  };

  if (isLoading('loadCommissions')) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Commissions</h1>
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
            Add Commission
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total Commissions</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatCurrency(totalCommissions)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-full p-3">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatCurrency(pendingCommissions)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Overdue</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatCurrency(overdueCommissions)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gray-100 rounded-full p-3">
              <DollarSign className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Cancelled</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatCurrency(cancelledCommissions)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="PENDING">Pending</option>
                <option value="RECEIVED">Received</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Amount Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={filters.minAmount}
                  onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                  placeholder="Min"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                  placeholder="Max"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Commissions List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCommissions.map((commission) => (
              <tr key={commission.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {commission.propertyTitle}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/clients/${commission.client.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {commission.client.name}
                  </Link>
                  <p className="text-sm text-gray-500">{commission.client.email}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(commission.amount)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {commission.percentage}%
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(commission.status)}`}>
                    {commission.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {commission.notes}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(commission.dueDate).toLocaleDateString()}
                  {commission.receivedDate && (
                    <p className="text-green-600">
                      Received: {new Date(commission.receivedDate).toLocaleDateString()}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => {
                        setEditingCommission(commission);
                        setShowEditModal(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this commission?')) {
                          handleDeleteCommission(commission.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Commission Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Commission"
      >
        <div className="space-y-4">
          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Client</label>
            <select
              value={newCommission.clientId}
              onChange={(e) => handleClientChange(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.email})
                </option>
              ))}
            </select>
          </div>

          {/* Property Title Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Property Title</label>
            <select
              value={newCommission.propertyTitle}
              onChange={(e) => setNewCommission({ ...newCommission, propertyTitle: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select property</option>
              {clientProperties.map(property => (
                <option key={property.id} value={property.title}>
                  {property.title}
                </option>
              ))}
            </select>
          </div>

          {/* Commission Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Commission Amount</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                value={newCommission.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Commission Percentage */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Commission Percentage</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                value={newCommission.percentage}
                onChange={(e) => handlePercentageChange(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Due Date</label>
            <input
              type="date"
              value={newCommission.dueDate}
              onChange={(e) => setNewCommission({ ...newCommission, dueDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={newCommission.notes}
              onChange={(e) => setNewCommission({ ...newCommission, notes: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={() => {
                setShowAddModal(false);
                setNewCommission({
                  clientId: '',
                  propertyTitle: '',
                  amount: '',
                  percentage: '',
                  dueDate: '',
                  notes: '',
                });
              }}
              variant="secondary"
              disabled={isLoading('addCommission')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCommission}
              variant="primary"
              isLoading={isLoading('addCommission')}
              disabled={!newCommission.clientId || !newCommission.propertyTitle || !newCommission.amount || !newCommission.percentage || !newCommission.dueDate}
            >
              Add Commission
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      {showEditModal && editingCommission && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingCommission(null);
          }}
          title="Edit Commission"
        >
          <div className="space-y-4">
            {/* Commission Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Commission Amount</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  value={editingCommission.amount}
                  onChange={(e) => setEditingCommission({
                    ...editingCommission,
                    amount: parseFloat(e.target.value)
                  })}
                  className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Commission Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Commission Percentage</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  value={editingCommission.percentage}
                  onChange={(e) => setEditingCommission({
                    ...editingCommission,
                    percentage: parseFloat(e.target.value)
                  })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="0.00"
                  step="0.01"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">%</span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={editingCommission.status}
                onChange={(e) => setEditingCommission({
                  ...editingCommission,
                  status: e.target.value as 'PENDING' | 'RECEIVED' | 'OVERDUE' | 'CANCELLED'
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="PENDING">Pending</option>
                <option value="RECEIVED">Received</option>
                <option value="OVERDUE">Overdue</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="date"
                value={editingCommission.dueDate.split('T')[0]}
                onChange={(e) => setEditingCommission({
                  ...editingCommission,
                  dueDate: e.target.value
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={editingCommission.notes || ''}
                onChange={(e) => setEditingCommission({
                  ...editingCommission,
                  notes: e.target.value
                })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <Button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCommission(null);
                }}
                variant="secondary"
                disabled={isLoading('editCommission')}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEdit}
                variant="primary"
                isLoading={isLoading('editCommission')}
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