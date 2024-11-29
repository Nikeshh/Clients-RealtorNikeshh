'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import { formatCurrency, formatDate } from '@/lib/utils';

interface DashboardStats {
  clientCount: number;
  propertyCount: number;
  interactionCount: number;
  recentClients: Array<{
    id: string;
    name: string;
    status: string;
    lastContact: string;
  }>;
  recentProperties: Array<{
    id: string;
    title: string;
    status: string;
    price: number;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    setLoading('loadStats', true);
    try {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to load dashboard statistics', 'error');
    } finally {
      setLoading('loadStats', false);
    }
  };

  if (isLoading('loadStats')) {
    return <LoadingSpinner size="large" />;
  }

  if (!stats) {
    return <div>Error loading dashboard</div>;
  }

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Summary Cards */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Clients
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.clientCount}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Properties
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.propertyCount}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Recent Interactions (30 days)
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.interactionCount}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Clients */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Recent Clients</h3>
              <div className="mt-4 flow-root">
                <ul className="divide-y divide-gray-200">
                  {stats.recentClients.map((client) => (
                    <li key={client.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {client.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Last contact: {formatDate(client.lastContact)}
                          </p>
                        </div>
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {client.status}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Recent Properties */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Recent Properties</h3>
              <div className="mt-4 flow-root">
                <ul className="divide-y divide-gray-200">
                  {stats.recentProperties.map((property) => (
                    <li key={property.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {property.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatCurrency(property.price)}
                          </p>
                        </div>
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {property.status}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 