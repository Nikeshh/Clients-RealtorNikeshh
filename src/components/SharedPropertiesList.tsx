'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from '@/components/Button';
import { formatCurrency } from '@/lib/utils';
import { Building2, ExternalLink, X } from 'lucide-react';
import Link from 'next/link';

interface SharedProperty {
  id: string;
  property: {
    id: string;
    title: string;
    address: string;
    price: number;
    images?: string[];
  };
}

interface Props {
  properties: SharedProperty[];
  stageId: string;
  onUpdate: () => void;
}

export default function SharedPropertiesList({ properties, stageId, onUpdate }: Props) {
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  const removeSharedProperty = async (propertyId: string) => {
    setLoading(`removeProperty-${propertyId}`, true);
    try {
      const response = await fetch(`/api/clients/${stageId}/shared-properties/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to remove shared property');

      addToast('Property removed successfully', 'success');
      onUpdate();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to remove property', 'error');
    } finally {
      setLoading(`removeProperty-${propertyId}`, false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Shared Properties</h3>
      
      <div className="space-y-4">
        {properties.map((shared) => (
          <div 
            key={shared.id}
            className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50"
          >
            {shared.property.images?.[0] ? (
              <img
                src={shared.property.images[0]}
                alt={shared.property.title}
                className="h-20 w-20 object-cover rounded-lg"
              />
            ) : (
              <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-8 w-8 text-gray-400" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-medium text-gray-900 truncate">
                    {shared.property.title}
                  </h4>
                  <p className="text-sm text-gray-500 truncate">
                    {shared.property.address}
                  </p>
                  <p className="mt-1 text-sm font-medium text-blue-600">
                    {formatCurrency(shared.property.price)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/properties/${shared.property.id}`}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => removeSharedProperty(shared.id)}
                    className="text-gray-400 hover:text-gray-500"
                    disabled={isLoading(`removeProperty-${shared.id}`)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {properties.length === 0 && (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No properties shared yet</p>
          </div>
        )}
      </div>
    </div>
  );
} 