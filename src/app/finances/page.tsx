'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast-context';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { TrendingUp, TrendingDown, DollarSign, Building2, Users } from 'lucide-react';

interface FinancialStats {
  totalRevenue: number;
  totalCommissions: number;
  pendingCommissions: number;
  monthlyRevenue: number;
  monthlyGrowth: number;
  activeDeals: number;
  recentTransactions: Array<{
    id: string;
    date: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    description: string;
    category: string;
  }>;
  topProperties: Array<{
    id: string;
    title: string;
    commission: number;
    status: string;
  }>;
}

export default function FinancesPage() {
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFinancialStats();
  }, []);

  const loadFinancialStats = async () => {
    setLoading('loadStats', true);
    setError(null);
    try {
      const response = await fetch('/api/finances/stats');
      if (!response.ok) throw new Error('Failed to fetch financial stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load financial statistics');
      addToast('Failed to load financial statistics', 'error');
    } finally {
      setLoading('loadStats', false);
    }
  };

  if (isLoading('loadStats')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Error</h2>
          <p className="mt-2 text-gray-600">{error || 'Failed to load financial dashboard'}</p>
          <button
            onClick={loadFinancialStats}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Financial Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Commissions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Commissions</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalCommissions)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
              <div className="flex items-center mt-2">
                {stats.monthlyGrowth >= 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">{stats.monthlyGrowth}% up from last month</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-500">{Math.abs(stats.monthlyGrowth)}% down from last month</span>
                  </>
                )}
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Active Deals */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Deals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeDeals}</p>
              <p className="text-sm text-gray-500 mt-2">
                {formatCurrency(stats.pendingCommissions)} in pending commissions
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions and Top Properties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
            <div className="space-y-4">
              {stats.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'INCOME' ? (
                        <TrendingUp className={`h-4 w-4 text-green-600`} />
                      ) : (
                        <TrendingDown className={`h-4 w-4 text-red-600`} />
                      )}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.category}</p>
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
              ))}
            </div>
          </div>
        </div>

        {/* Top Properties */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Properties</h2>
            <div className="space-y-4">
              {stats.topProperties.map((property) => (
                <div key={property.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{property.title}</p>
                    <p className="text-sm text-gray-500">{property.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">{formatCurrency(property.commission)}</p>
                    <p className="text-xs text-gray-500">Commission</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 