'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast-context';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/Button';
import Modal from '@/components/ui/Modal';
import { Plus, Filter, TrendingUp, TrendingDown } from 'lucide-react';

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
    id: string;
    name: string;
    email: string;
  };
  propertyId?: string;
  property?: {
    id: string;
    title: string;
    address: string;
  };
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
    propertyId: '',
  });

  useEffect(() => {
    loadTransactions();
  }, []);

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
        propertyId: '',
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
            {/* ... Filter inputs ... */}
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'INCOME' ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{transaction.category}</p>
                    {transaction.client && (
                      <p className="text-sm text-gray-500">Client: {transaction.client.name}</p>
                    )}
                    {transaction.property && (
                      <p className="text-sm text-gray-500">Property: {transaction.property.title}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {transaction.notes && (
                <p className="mt-2 text-sm text-gray-500">{transaction.notes}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
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
                  <option value="Commission">Commission</option>
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
              value={newTransaction.clientId}
              onChange={(e) => setNewTransaction({ ...newTransaction, clientId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">None</option>
              {/* We'll need to fetch and map clients here */}
            </select>
          </div>

          {/* Related Property */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Related Property</label>
            <select
              value={newTransaction.propertyId}
              onChange={(e) => setNewTransaction({ ...newTransaction, propertyId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">None</option>
              {/* We'll need to fetch and map properties here */}
            </select>
          </div>

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
                  propertyId: '',
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
    </div>
  );
} 