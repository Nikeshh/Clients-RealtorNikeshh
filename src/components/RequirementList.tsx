'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from './Button';
import Modal from './ui/Modal';
import { Building2, Mail, Plus, Settings, CheckSquare } from 'lucide-react';
import EmailTemplateModal from './EmailTemplateModal';
import PropertySearch from './PropertySearch';
import RentalPreferencesForm from './RentalPreferencesForm';
import PurchasePreferencesForm from './PurchasePreferencesForm';
import RequirementForm from './RequirementForm';
import ChecklistList from './ChecklistList';
import ChecklistForm from './ChecklistForm';

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  images?: string[];
  link?: string;
}

interface GatheredProperty {
  id: string;
  property: Property;
}

interface RentalPreferences {
  leaseTerm: string;
  furnished: boolean;
  petsAllowed: boolean;
  maxRentalBudget: number;
  preferredMoveInDate?: string;
}

interface PurchasePreferences {
  propertyAge?: string;
  preferredStyle?: string;
  parking?: number;
  lotSize?: number;
  basement?: boolean;
  garage?: boolean;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

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
  gatheredProperties: GatheredProperty[];
  rentalPreferences?: RentalPreferences;
  purchasePreferences?: PurchasePreferences;
  checklist?: ChecklistItem[];
}

interface Props {
  requirements: Requirement[];
  clientId: string;
  requestId: string;
  onUpdate: () => void;
}

export default function RequirementList({ requirements, clientId, requestId, onUpdate }: Props) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showGatherModal, setShowGatherModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  const handleAddRequirement = async (data: any) => {
    setLoading('addRequirement', true);
    try {
      setShowAddModal(false);
      onUpdate();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to add requirement', 'error');
    } finally {
      setLoading('addRequirement', false);
    }
  };

  const handleGatherProperty = async (requirementId: string, propertyId: string) => {
    setLoading(`gather-${propertyId}`, true);
    try {
      const response = await fetch(`/api/clients/${clientId}/requests/${requestId}/requirements/${requirementId}/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      });

      if (!response.ok) throw new Error('Failed to gather property');
      
      addToast('Property gathered successfully', 'success');
      onUpdate();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to gather property', 'error');
    } finally {
      setLoading(`gather-${propertyId}`, false);
    }
  };

  const handleSendEmail = async (requirementId: string, emailData: any) => {
    setLoading('sendEmail', true);
    try {
      const response = await fetch(`/api/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...emailData,
          template: 'PropertyEmail',
        }),
      });

      if (!response.ok) throw new Error('Failed to send email');
      
      // Create interaction for email sent
      await fetch(`/api/clients/${clientId}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'EMAIL_SENT',
          description: `Sent property recommendations email`,
          requestId,
          requirementId,
        }),
      });
      
      addToast('Email sent successfully', 'success');
      setShowEmailModal(false);
      onUpdate();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to send email', 'error');
    } finally {
      setLoading('sendEmail', false);
    }
  };

  const handleAddChecklist = async (requirementId: string, text: string) => {
    setLoading('addChecklist', true);
    try {
      const response = await fetch(`/api/clients/${clientId}/requests/${requestId}/requirements/${requirementId}/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Failed to add checklist item');
      
      const newChecklistItem = await response.json();
      
      // Update the local state immediately
      setSelectedRequirement(prev => {
        if (prev && prev.id === requirementId) {
          return {
            ...prev,
            checklist: [...(prev.checklist || []), newChecklistItem]
          };
        }
        return prev;
      });
      
      addToast('Checklist item added', 'success');
      onUpdate(); // Still call onUpdate to sync with server
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to add checklist item', 'error');
    } finally {
      setLoading('addChecklist', false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Requirements</h3>
        <Button
          variant="secondary"
          size="small"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Requirement
        </Button>
      </div>
      
      {/* Requirements List */}
      {requirements.map((requirement) => (
        <div key={requirement.id} className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-medium">{requirement.name}</h4>
              <p className="text-sm text-gray-500">
                {requirement.propertyType} - {requirement.type}
              </p>
              <p className="text-sm text-gray-500">
                Budget: ${requirement.budgetMin.toLocaleString()} - ${requirement.budgetMax.toLocaleString()}
              </p>
              {requirement.bedrooms && (
                <p className="text-sm text-gray-500">
                  {requirement.bedrooms} beds, {requirement.bathrooms} baths
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {requirement.preferredLocations.map((location) => (
                  <span
                    key={location}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {location}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="small"
                onClick={() => {
                  setSelectedRequirement(requirement);
                  setShowPreferencesModal(true);
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </Button>
              <Button
                variant="secondary"
                size="small"
                onClick={() => {
                  setSelectedRequirement(requirement);
                  setShowGatherModal(true);
                }}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Properties
              </Button>
              <Button
                variant="secondary"
                size="small"
                onClick={() => {
                  setSelectedRequirement(requirement);
                  setShowEmailModal(true);
                }}
                disabled={requirement.gatheredProperties.length === 0}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button
                variant="secondary"
                size="small"
                onClick={() => {
                  setSelectedRequirement(requirement);
                  setShowChecklistModal(true);
                }}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Checklist
              </Button>
            </div>
          </div>

          {/* Gathered Properties */}
          {requirement.gatheredProperties.length > 0 && (
            <div className="mt-4">
              <h5 className="text-sm font-medium mb-2">Gathered Properties</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {requirement.gatheredProperties.map(({ property }) => (
                  <div key={property.id} className="border rounded-lg p-3">
                    {property.images?.[0] && (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                    )}
                    <h6 className="font-medium">{property.title}</h6>
                    <p className="text-sm text-gray-500">{property.address}</p>
                    <p className="text-sm font-medium">${property.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add Requirement Modal */}
      {showAddModal && (
        <RequirementForm
          clientId={clientId}
          requestId={requestId}
          onSubmit={handleAddRequirement}
          onCancel={() => setShowAddModal(false)}
        />
      )}

      {/* Property Search Modal */}
      {showGatherModal && selectedRequirement && (
        <Modal
          isOpen={showGatherModal}
          onClose={() => setShowGatherModal(false)}
          title="Gather Properties"
        >
          <PropertySearch
            onSelect={(propertyId) => handleGatherProperty(selectedRequirement.id, propertyId)}
            filters={{
              type: selectedRequirement.propertyType,
              minPrice: selectedRequirement.budgetMin,
              maxPrice: selectedRequirement.budgetMax,
              bedrooms: selectedRequirement.bedrooms,
              bathrooms: selectedRequirement.bathrooms,
            }}
          />
        </Modal>
      )}

      {/* Email Modal */}
      {showEmailModal && selectedRequirement && (
        <EmailTemplateModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          onSubmit={(emailData) => handleSendEmail(selectedRequirement.id, emailData)}
          properties={selectedRequirement.gatheredProperties.map(gp => gp.property)}
          isLoading={isLoading('sendEmail')}
        />
      )}

      {/* Preferences Modal */}
      {showPreferencesModal && selectedRequirement && (
        <Modal
          isOpen={showPreferencesModal}
          onClose={() => setShowPreferencesModal(false)}
          title={`${selectedRequirement.type} Preferences`}
        >
          {selectedRequirement.type === 'RENTAL' ? (
            <RentalPreferencesForm
              clientId={clientId}
              requestId={requestId}
              requirementId={selectedRequirement.id}
              initialData={selectedRequirement.rentalPreferences}
              onSubmit={() => {
                setShowPreferencesModal(false);
                onUpdate();
              }}
              onCancel={() => setShowPreferencesModal(false)}
            />
          ) : (
            <PurchasePreferencesForm
              clientId={clientId}
              requestId={requestId}
              requirementId={selectedRequirement.id}
              initialData={selectedRequirement.purchasePreferences}
              onSubmit={() => {
                setShowPreferencesModal(false);
                onUpdate();
              }}
              onCancel={() => setShowPreferencesModal(false)}
            />
          )}
        </Modal>
      )}

      {/* Checklist Modal */}
      {showChecklistModal && selectedRequirement && (
        <Modal
          isOpen={showChecklistModal}
          onClose={() => setShowChecklistModal(false)}
          title={`Checklist for ${selectedRequirement.name}`}
        >
          <div className="space-y-4">
            <ChecklistForm
              onSubmit={(text) => handleAddChecklist(selectedRequirement.id, text)}
              onCancel={() => setShowChecklistModal(false)}
              isLoading={isLoading('addChecklist')}
            />
            <div className="mt-4">
              <ChecklistList
                checklist={selectedRequirement.checklist || []}
                clientId={clientId}
                requestId={requestId}
                requirementId={selectedRequirement.id}
                onUpdate={onUpdate}
                hideAddButton={true}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
} 