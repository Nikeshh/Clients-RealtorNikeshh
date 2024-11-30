'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from '@/components/Button';
import { formatCurrency } from '@/lib/utils';
import { Home, Building2, MapPin, DollarSign } from 'lucide-react';

interface Requirement {
  id: string;
  name: string;
  type: string;
  propertyType: string;
  budgetMin: number;
  budgetMax: number;
  bedrooms?: number;
  bathrooms?: number;
  preferredLocations: string[];
  status: string;
}

interface Props {
  requirements: Requirement[];
  stageId: string;
  onUpdate: () => void;
}

export default function RequirementList({ requirements, stageId, onUpdate }: Props) {
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  const updateRequirementStatus = async (requirementId: string, status: string) => {
    setLoading(`updateRequirement-${requirementId}`, true);
    try {
      const response = await fetch(`/api/clients/${stageId}/requirements/${requirementId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update requirement');

      addToast('Requirement updated successfully', 'success');
      onUpdate();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update requirement', 'error');
    } finally {
      setLoading(`updateRequirement-${requirementId}`, false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
      
      <div className="space-y-4">
        {requirements.map((requirement) => (
          <div 
            key={requirement.id}
            className="border rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  {requirement.type === 'PURCHASE' ? (
                    <Home className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Building2 className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{requirement.name}</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>
                        {formatCurrency(requirement.budgetMin)} - {formatCurrency(requirement.budgetMax)}
                      </span>
                    </div>
                    {requirement.bedrooms && requirement.bathrooms && (
                      <div className="text-sm text-gray-600">
                        {requirement.bedrooms} beds • {requirement.bathrooms} baths
                      </div>
                    )}
                    {requirement.preferredLocations.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{requirement.preferredLocations.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {requirement.status !== 'Completed' && (
                  <Button
                    onClick={() => updateRequirementStatus(requirement.id, 'Completed')}
                    variant="primary"
                    size="small"
                    isLoading={isLoading(`updateRequirement-${requirement.id}`)}
                  >
                    Complete
                  </Button>
                )}
                {requirement.status === 'Pending' && (
                  <Button
                    onClick={() => updateRequirementStatus(requirement.id, 'Active')}
                    variant="secondary"
                    size="small"
                    isLoading={isLoading(`updateRequirement-${requirement.id}`)}
                  >
                    Start
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        {requirements.length === 0 && (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No requirements found</p>
          </div>
        )}
      </div>
    </div>
  );
} 