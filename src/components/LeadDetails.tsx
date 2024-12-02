'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, MessageSquare, Calendar, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Lead } from './LeadActions';

interface LeadInteraction {
  id: string;
  type: string;
  content: string;
  date: string;
  leadId: string;
}

interface LeadDetailsProps {
  lead: Lead;
}

export default function LeadDetails({ lead }: LeadDetailsProps) {
  const [interactions, setInteractions] = useState<LeadInteraction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInteractions() {
      try {
        const response = await fetch(`/api/leads/${lead.id}/interactions`);
        if (!response.ok) throw new Error('Failed to load interactions');
        const data = await response.json();
        setInteractions(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadInteractions();
  }, [lead.id]);

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'EMAIL':
        return <Mail className="h-5 w-5 text-blue-500" />;
      case 'CALL':
        return <Phone className="h-5 w-5 text-green-500" />;
      case 'NOTE':
        return <MessageSquare className="h-5 w-5 text-yellow-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Lead Details
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Contact information and interaction history
        </p>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Full name</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {lead.firstName} {lead.lastName}
            </dd>
          </div>
          
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                lead.status === 'CONVERTED' ? 'bg-green-100 text-green-800' :
                lead.status === 'LOST' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {lead.status}
              </span>
            </dd>
          </div>

          {lead.email && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{lead.email}</dd>
            </div>
          )}

          {lead.phone && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900">{lead.phone}</dd>
            </div>
          )}

          <div>
            <dt className="text-sm font-medium text-gray-500">Source</dt>
            <dd className="mt-1 text-sm text-gray-900">{lead.source}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(lead.createdAt).toLocaleDateString()}
            </dd>
          </div>

          {lead.notes && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                {lead.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <h4 className="text-base font-medium text-gray-900 mb-4">
          Interaction History
        </h4>
        
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : interactions.length > 0 ? (
          <div className="flow-root">
            <ul className="-mb-8">
              {interactions.map((interaction, idx) => (
                <li key={interaction.id}>
                  <div className="relative pb-8">
                    {idx !== interactions.length - 1 && (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center ring-8 ring-white">
                          {getInteractionIcon(interaction.type)}
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div>
                          <p className="text-sm text-gray-500">
                            {interaction.content}
                          </p>
                        </div>
                        <div className="whitespace-nowrap text-right text-sm text-gray-500">
                          <time dateTime={interaction.date}>
                            {formatDistanceToNow(new Date(interaction.date), { addSuffix: true })}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            No interactions recorded yet
          </p>
        )}
      </div>
    </div>
  );
} 