'use client';

import { useState } from 'react';
import Link from 'next/link';

// Mock data
const MOCK_CLIENTS = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234 567 8900',
    requirements: 'Looking for 3BHK in downtown area',
    status: 'Active',
    lastContact: '2024-03-20',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1 234 567 8901',
    requirements: '2BHK with parking',
    status: 'Inactive',
    lastContact: '2024-03-19',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    phone: '+1 234 567 8902',
    requirements: 'Commercial space in business district',
    status: 'Active',
    lastContact: '2024-03-18',
  },
];

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-blue-900 sm:truncate sm:text-3xl">
            Clients
          </h2>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link
            href="/clients/new"
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Add New Client
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div>
          <input
            type="text"
            placeholder="Search clients..."
            className="block w-full rounded-lg border border-blue-200 px-4 py-2.5 text-gray-700 shadow-sm focus:border-blue-400 focus:ring-blue-400 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            className="block w-full rounded-lg border border-blue-200 px-4 py-2.5 text-gray-700 shadow-sm focus:border-blue-400 focus:ring-blue-400 transition-colors"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Clients List */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden shadow-md rounded-lg bg-white">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-blue-900">Name</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900">Contact</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900">Requirements</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900">Status</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-blue-900">Last Contact</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {MOCK_CLIENTS.map((client) => (
                    <tr key={client.id} className="hover:bg-blue-50 transition-colors">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-blue-900">
                        {client.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                        <div>{client.email}</div>
                        <div>{client.phone}</div>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-600">{client.requirements}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          client.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">{client.lastContact}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link 
                          href={`/clients/${client.id}`} 
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          View<span className="sr-only">, {client.name}</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 