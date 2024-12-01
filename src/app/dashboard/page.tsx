'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import { 
  Users, DollarSign, ClipboardList, Clock, 
  CheckCircle, AlertCircle, Building2, Calendar 
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  overview: {
    activeClients: number;
    totalRequests: number;
    monthlyRevenue: number;
    pendingCommissions: number;
    transactionCount: number;
    pendingCommissionCount: number;
  };
  recentActivity: {
    interactions: Array<{
      id: string;
      type: string;
      description: string;
      date: string;
      client: { name: string; };
    }>;
    upcomingMeetings: Array<{
      id: string;
      title: string;
      scheduledDate: string;
      client: { name: string; };
    }>;
    activeProcesses: Array<{
      id: string;
      title: string;
      dueDate: string | null;
      request: {
        client: { name: string; };
      };
    }>;
  };
  analytics: {
    requestsByType: Record<string, number>;
    clientsByStatus: Record<string, number>;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading('loadStats', true);
    try {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to load dashboard statistics', 'error');
    } finally {
      setLoading('loadStats', false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Clients</p>
              <p className="text-2xl font-semibold">{stats.overview.activeClients}</p>
            </div>
            <Users className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Monthly Revenue</p>
              <p className="text-2xl font-semibold">{formatCurrency(stats.overview.monthlyRevenue)}</p>
            </div>
            <DollarSign className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Requests</p>
              <p className="text-2xl font-semibold">{stats.overview.totalRequests}</p>
            </div>
            <ClipboardList className="h-10 w-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Commissions</p>
              <p className="text-2xl font-semibold">{formatCurrency(stats.overview.pendingCommissions)}</p>
            </div>
            <Clock className="h-10 w-10 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {stats.recentActivity.interactions.map((interaction) => (
                <div key={interaction.id} className="flex items-start gap-4">
                  <div className="bg-blue-100 rounded-full p-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      {new Date(interaction.date).toLocaleDateString()}
                    </p>
                    <p className="font-medium">{interaction.client.name}</p>
                    <p className="text-sm">{interaction.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Upcoming Meetings</h2>
            <div className="space-y-4">
              {stats.recentActivity.upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="flex items-start gap-4">
                  <div className="bg-purple-100 rounded-full p-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      {new Date(meeting.scheduledDate).toLocaleDateString()}
                    </p>
                    <p className="font-medium">{meeting.title}</p>
                    <p className="text-sm">with {meeting.client.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Requests by Type</h2>
            <div className="space-y-2">
              {Object.entries(stats.analytics.requestsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm">{type}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Clients by Status</h2>
            <div className="space-y-2">
              {Object.entries(stats.analytics.clientsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm">{status}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Active Processes</h2>
            <div className="space-y-4">
              {stats.recentActivity.activeProcesses.map((process) => (
                <div key={process.id} className="flex items-start gap-4">
                  <div className="bg-green-100 rounded-full p-2">
                    <Building2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    {process.dueDate && (
                      <p className="text-sm text-gray-500">
                        Due: {new Date(process.dueDate).toLocaleDateString()}
                      </p>
                    )}
                    <p className="font-medium">{process.title}</p>
                    <p className="text-sm">for {process.request.client.name}</p>
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