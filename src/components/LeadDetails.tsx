'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, MessageSquare } from 'lucide-react';
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

  const formatEmailContent = (content: string) => {
    try {
      const emailData = JSON.parse(content);
      return (
        <div className="space-y-2">
          <div className="font-medium">Subject: {emailData.subject}</div>
          <div className="text-gray-600">
            From: {emailData.sender}<br />
            To: {emailData.recipient}<br />
            Sent: {new Date(emailData.timestamp).toLocaleString()}
          </div>
          <div className="mt-2 text-gray-700 whitespace-pre-wrap">
            {emailData.body}
          </div>
        </div>
      );
    } catch {
      return <span>{content}</span>;
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Interaction History
        </h3>
      </div>

      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
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
                        <div className="w-full">
                          <div className="text-sm text-gray-500">
                            {interaction.type === 'EMAIL' 
                              ? formatEmailContent(interaction.content)
                              : interaction.content
                            }
                          </div>
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
          <div className="text-sm text-gray-500 text-center py-4">
            No interactions recorded yet
          </div>
        )}
      </div>
    </div>
  );
} 