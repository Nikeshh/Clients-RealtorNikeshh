'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast-context';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/Button';
import Modal from '@/components/ui/Modal';
import { Plus, Filter, TrendingUp, TrendingDown } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
}

interface GatheredProperty {
  id: string;
  title: string;
  requirementId: string;
}

interface Transaction {
  id: string;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  category: string;
  notes?: string;
  clientId?: string;
  client?: {
    name: string;
    email: string;
  };
  propertyTitle?: string;
  gatheredPropertyId?: string;
}

interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
}

export default function TransactionsPage() {
  const [transactionsData, setTransactionsData] = useState<TransactionsResponse | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
  });
  const [newTransaction, setNewTransaction] = useState({
    type: 'INCOME',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    clientId: '',
    propertyTitle: '',
    gatheredPropertyId: ''
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [clientProperties, setClientProperties] = useState<GatheredProperty[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    if (showAddModal) {
      loadClients();
    }
  }, [showAddModal]);

  const loadTransactions = async () => {
    setLoading('loadTransactions', true);
    try {
      const response = await fetch('/api/finances/transactions');
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactionsData(data);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to load transactions', 'error');
    } finally {
      setLoading('loadTransactions', false);
    }
  };

  const handleAddTransaction = async () => {
    setLoading('addTransaction', true);
    try {
      const response = await fetch('/api/finances/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTransaction),
      });

      if (!response.ok) throw new Error('Failed to add transaction');

      addToast('Transaction added successfully', 'success');
      loadTransactions();
      setShowAddModal(false);
      setNewTransaction({
        type: 'INCOME',
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        clientId: '',
        propertyTitle: '',
        gatheredPropertyId: ''
      });
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to add transaction', 'error');
    } finally {
      setLoading('addTransaction', false);
    }
  };

  const filteredTransactions = transactionsData?.transactions.filter(transaction => {
    if (filters.type !== 'all' && transaction.type !== filters.type) return false;
    if (filters.category !== 'all' && transaction.category !== filters.category) return false;
    if (filters.dateFrom && new Date(transaction.date) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(transaction.date) > new Date(filters.dateTo)) return false;
    if (filters.minAmount && transaction.amount < parseFloat(filters.minAmount)) return false;
    if (filters.maxAmount && transaction.amount > parseFloat(filters.maxAmount)) return false;
    return true;
  }) ?? [];

  const loadClientProperties = async (clientId: string) => {
    try {
      const response = await fetch(`/api/finances/transactions?clientId=${clientId}`);
      if (!response.ok) throw new Error('Failed to fetch client data');
      const data = await response.json();
      setClientProperties(data.clientProperties);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to load client properties', 'error');
    }
  };

  const handleClientChange = (clientId: string) => {
    setNewTransaction({ ...newTransaction, clientId });
    if (clientId) {
      loadClientProperties(clientId);
    } else {
      setClientProperties([]);
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

  const handleEdit = async () => {
    if (!editingTransaction) return;
    
    setLoading('editTransaction', true);
    try {
      const response = await fetch(`/api/finances/transactions/${editingTransaction.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: editingTransaction.type,
          amount: editingTransaction.amount,
          description: editingTransaction.description,
          category: editingTransaction.category,
          date: editingTransaction.date,
          notes: editingTransaction.notes,
          clientId: editingTransaction.clientId,
          propertyTitle: editingTransaction.propertyTitle,
          gatheredPropertyId: editingTransaction.gatheredPropertyId,
        }),
      });

      if (!response.ok) throw new Error('Failed to update transaction');

      addToast('Transaction updated successfully', 'success');
      loadTransactions();
      setShowEditModal(false);
      setEditingTransaction(null);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update transaction', 'error');
    } finally {
      setLoading('editTransaction', false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    setLoading(`deleteTransaction-${id}`, true);
    try {
      const response = await fetch(`/api/finances/transactions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete transaction');

      addToast('Transaction deleted successfully', 'success');
      loadTransactions();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to delete transaction', 'error');
    } finally {
      setLoading(`deleteTransaction-${id}`, false);
    }
  };

  if (isLoading('loadTransactions')) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
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
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="Referral Fee">Referral Fee</option>
                <option value="Consulting">Consulting</option>
                <option value="Marketing">Marketing</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Travel">Travel</option>
                <option value="Professional Services">Professional Services</option>
                <option value="Software">Software</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date Range</label>
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

      {/* Transactions Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    transaction.type === 'INCOME' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.type === 'INCOME' ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    {transaction.type}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {transaction.description}
                  </div>
                  {transaction.notes && (
                    <div className="text-sm text-gray-500">{transaction.notes}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {transaction.category}
                </td>
                <td className="px-6 py-4">
                  {transaction.client && (
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.client.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.client.email}
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {transaction.propertyTitle}
                </td>
                <td className="px-6 py-4">
                  <div className={`text-sm font-medium ${
                    transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => {
                        setEditingTransaction(transaction);
                        setShowEditModal(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this transaction?')) {
                          handleDeleteTransaction(transaction.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewTransaction({
            type: 'INCOME',
            amount: '',
            description: '',
            category: '',
            date: new Date().toISOString().split('T')[0],
            notes: '',
            clientId: '',
            propertyTitle: '',
            gatheredPropertyId: ''
          });
          setClientProperties([]);
        }}
        title="Add Transaction"
      >
        <div className="space-y-4">
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <div className="mt-1 flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={newTransaction.type === 'INCOME'}
                  onChange={() => setNewTransaction({ ...newTransaction, type: 'INCOME' })}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span>Income</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={newTransaction.type === 'EXPENSE'}
                  onChange={() => setNewTransaction({ ...newTransaction, type: 'EXPENSE' })}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span>Expense</span>
              </label>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              value={newTransaction.description}
              onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={newTransaction.category}
              onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select category</option>
              {newTransaction.type === 'INCOME' ? (
                <>
                  <option value="Referral Fee">Referral Fee</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Other Income">Other Income</option>
                </>
              ) : (
                <>
                  <option value="Marketing">Marketing</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Travel">Travel</option>
                  <option value="Professional Services">Professional Services</option>
                  <option value="Software">Software</option>
                  <option value="Other Expense">Other Expense</option>
                </>
              )}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={newTransaction.date}
              onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={newTransaction.notes}
              onChange={(e) => setNewTransaction({ ...newTransaction, notes: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Related Client */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Related Client</label>
            <select
              value={newTransaction.clientId || ''}
              onChange={(e) => handleClientChange(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">None</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.email})
                </option>
              ))}
            </select>
          </div>

          {/* Property Selection */}
          {newTransaction.clientId && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Property</label>
              <select
                value={newTransaction.gatheredPropertyId}
                onChange={(e) => {
                  const property = clientProperties.find(p => p.id === e.target.value);
                  setNewTransaction({
                    ...newTransaction,
                    gatheredPropertyId: e.target.value,
                    propertyTitle: property ? property.title : ''
                  });
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select property</option>
                {clientProperties.map(property => (
                  <option key={property.id} value={property.id}>
                    {property.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={() => {
                setShowAddModal(false);
                setNewTransaction({
                  type: 'INCOME',
                  amount: '',
                  description: '',
                  category: '',
                  date: new Date().toISOString().split('T')[0],
                  notes: '',
                  clientId: '',
                  propertyTitle: '',
                  gatheredPropertyId: ''
                });
              }}
              variant="secondary"
              disabled={isLoading('addTransaction')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTransaction}
              variant="primary"
              isLoading={isLoading('addTransaction')}
              disabled={!newTransaction.amount || !newTransaction.description || !newTransaction.category}
            >
              Add Transaction
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Transaction Modal */}
      {showEditModal && editingTransaction && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingTransaction(null);
          }}
          title="Edit Transaction"
        >
          <div className="space-y-4">
            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <div className="mt-1 flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={editingTransaction.type === 'INCOME'}
                    onChange={() => setEditingTransaction({ ...editingTransaction, type: 'INCOME' })}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Income</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={editingTransaction.type === 'EXPENSE'}
                    onChange={() => setEditingTransaction({ ...editingTransaction, type: 'EXPENSE' })}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Expense</span>
                </label>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  value={editingTransaction.amount}
                  onChange={(e) => setEditingTransaction({ ...editingTransaction, amount: Number(e.target.value) })}
                  className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                value={editingTransaction.description}
                onChange={(e) => setEditingTransaction({ ...editingTransaction, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={editingTransaction.category}
                onChange={(e) => setEditingTransaction({ ...editingTransaction, category: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                {editingTransaction.type === 'INCOME' ? (
                  <>
                    <option value="Referral Fee">Referral Fee</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Other Income">Other Income</option>
                  </>
                ) : (
                  <>
                    <option value="Marketing">Marketing</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Travel">Travel</option>
                    <option value="Professional Services">Professional Services</option>
                    <option value="Software">Software</option>
                    <option value="Other Expense">Other Expense</option>
                  </>
                )}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={editingTransaction.date}
                onChange={(e) => setEditingTransaction({ ...editingTransaction, date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={editingTransaction.notes || ''}
                onChange={(e) => setEditingTransaction({
                  ...editingTransaction,
                  notes: e.target.value
                })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Related Client */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Related Client</label>
              <select
                value={editingTransaction.clientId || ''}
                onChange={(e) => {
                  setEditingTransaction({ ...editingTransaction, clientId: e.target.value, propertyTitle: undefined, gatheredPropertyId: undefined });
                  if (e.target.value) {
                    loadClientProperties(e.target.value);
                  }
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">None</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Property Selection */}
            {editingTransaction.clientId && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Property</label>
                <select
                  value={editingTransaction.gatheredPropertyId}
                  onChange={(e) => {
                    const property = clientProperties.find(p => p.id === e.target.value);
                    setEditingTransaction({
                      ...editingTransaction,
                      gatheredPropertyId: e.target.value,
                      propertyTitle: property ? property.title : ''
                    });
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select property</option>
                  {clientProperties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <Button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTransaction(null);
                }}
                variant="secondary"
                disabled={isLoading('editTransaction')}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEdit}
                variant="primary"
                isLoading={isLoading('editTransaction')}
                disabled={!editingTransaction.amount || !editingTransaction.description || !editingTransaction.category}
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