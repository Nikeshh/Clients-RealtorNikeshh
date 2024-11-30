'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from '@/components/Button';
import { Building2, ExternalLink, X } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

interface SharedProperty {
  id: string;
  property: {
    id: string;
    title: string;
    address: string;
    price: number;
    images?: string[];
    status: string;
  };
  sharedDate: Date;
}

interface Props {
  properties: SharedProperty[];
  stageId: string;
  onUpdate: () => void;
}

export default function SharedPropertiesList({ properties, stageId, onUpdate }: Props) {
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  if (!properties?.length) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Shared Properties</h3>
      
      <div className="overflow-x-auto">
        <div className="flex gap-4 min-w-full pb-2">
          {properties.map((shared) => (
            <div 
              key={shared.id} 
              className="flex-none w-80 border rounded-lg hover:bg-gray-50"
            >
              {shared.property.images?.[0] ? (
                <img
                  src={shared.property.images[0]}
                  alt={shared.property.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
                  <Building2 className="h-12 w-12 text-gray-400" />
                </div>
              )}
              
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 truncate">
                      {shared.property.title}
                    </h4>
                    <p className="text-sm text-gray-500 truncate">
                      {shared.property.address}
                    </p>
                    <p className="mt-1 text-sm font-medium text-blue-600">
                      {formatCurrency(shared.property.price)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Shared on {new Date(shared.sharedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/properties/${shared.property.id}`}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 