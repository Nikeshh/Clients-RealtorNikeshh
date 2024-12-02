'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from './Button';
import Modal from './ui/Modal';
import { Building2, Mail, Plus, Settings, CheckSquare, Edit, Trash2, Check } from 'lucide-react';
import EmailTemplateModal from './EmailTemplateModal';
import PropertySearch from './PropertySearch';
import RentalPreferencesForm from './RentalPreferencesForm';
import PurchasePreferencesForm from './PurchasePreferencesForm';
import RequirementForm from './RequirementForm';
import ChecklistList from './ChecklistList';
import ChecklistForm from './ChecklistForm';

interface GatheredProperty {
  id: string;
  title: string;
  address?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  link: string;
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
  bedrooms?: number | null;
  bathrooms?: number | null;
  preferredLocations: string[];
  additionalRequirements?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  requestId: string | null;
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [selectedProperties, setSelectedProperties] = useState<GatheredProperty[]>([]);
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

  const formatPreferences = (requirement: Requirement) => {
    const preferences = [];

    if (requirement.type === 'RENTAL' && requirement.rentalPreferences) {
      const { leaseTerm, furnished, petsAllowed, maxRentalBudget, preferredMoveInDate } = requirement.rentalPreferences;
      preferences.push(
        `Lease: ${leaseTerm.replace('_', ' ').toLowerCase()}`,
        furnished ? 'Furnished' : 'Unfurnished',
        petsAllowed ? 'Pets allowed' : 'No pets',
        `Max rent: $${maxRentalBudget.toLocaleString()}`,
        preferredMoveInDate ? `Move in: ${new Date(preferredMoveInDate).toLocaleDateString()}` : null
      );
    } else if (requirement.type === 'PURCHASE' && requirement.purchasePreferences) {
      const { propertyAge, preferredStyle, parking, lotSize, basement, garage } = requirement.purchasePreferences;
      preferences.push(
        propertyAge ? `Age: ${propertyAge}` : null,
        preferredStyle ? `Style: ${preferredStyle}` : null,
        parking ? `Parking: ${parking} spaces` : null,
        lotSize ? `Lot: ${lotSize.toLocaleString()} sq ft` : null,
        basement ? 'Basement' : null,
        garage ? 'Garage' : null
      );
    }

    return preferences.filter(Boolean);
  };

  const handleSelectProperty = (property: GatheredProperty) => {
    if (selectedProperties.some(p => p.id === property.id)) {
      setSelectedProperties(selectedProperties.filter(p => p.id !== property.id));
    } else {
      setSelectedProperties([...selectedProperties, property]);
    }
  };

  const handleSelectAllProperties = (properties: GatheredProperty[]) => {
    if (selectedProperties.length === properties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties([...properties]);
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
          <div className="flex justify-between items-start gap-4">
            {/* Left side: Requirement details */}
            <div className="flex-grow space-y-2">
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
              
              {/* Preferences */}
              <div className="flex flex-wrap gap-2 mt-2">
                {formatPreferences(requirement).map((pref, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {pref}
                  </span>
                ))}
              </div>

              {/* Locations */}
              <div className="flex flex-wrap gap-2 mt-2">
                {requirement.preferredLocations.map((location) => (
                  <span
                    key={location}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {location}
                  </span>
                ))}
              </div>

              {/* Additional Requirements */}
              {requirement.additionalRequirements && (
                <p className="text-sm text-gray-500 mt-2">
                  Additional: {requirement.additionalRequirements}
                </p>
              )}
            </div>

            {/* Right side: Action buttons */}
            <div className="flex flex-col gap-2">
              <Button
                variant="secondary"
                size="small"
                onClick={() => {
                  setSelectedRequirement(requirement);
                  setShowEditModal(true);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
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
                  setShowChecklistModal(true);
                }}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Checklist
              </Button>
              <Button
                variant="secondary"
                size="small"
                onClick={async () => {
                  if (confirm('Are you sure you want to delete this requirement?')) {
                    setLoading(`delete-${requirement.id}`, true);
                    try {
                      const response = await fetch(
                        `/api/clients/${clientId}/requests/${requestId}/requirements/${requirement.id}`,
                        { method: 'DELETE' }
                      );
                      if (!response.ok) throw new Error('Failed to delete requirement');
                      addToast('Requirement deleted successfully', 'success');
                      onUpdate();
                    } catch (error) {
                      console.error('Error:', error);
                      addToast('Failed to delete requirement', 'error');
                    } finally {
                      setLoading(`delete-${requirement.id}`, false);
                    }
                  }
                }}
                isLoading={isLoading(`delete-${requirement.id}`)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Gathered Properties */}
          {requirement.gatheredProperties.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h5 className="text-sm font-medium">Gathered Properties</h5>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => handleSelectAllProperties(requirement.gatheredProperties)}
                  >
                    {selectedProperties.length === requirement.gatheredProperties.length 
                      ? 'Deselect All' 
                      : 'Select All'}
                  </Button>
                  {selectedProperties.length > 0 && (
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => setShowEmailModal(true)}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Email ({selectedProperties.length})
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {requirement.gatheredProperties.map((property) => (
                  <div
                    key={property.id}
                    className={`flex justify-between items-start p-3 border rounded-lg ${
                      selectedProperties.some(p => p.id === property.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex-grow">
                      <h6 className="font-medium">{property.title}</h6>
                      {property.address && (
                        <p className="text-sm text-gray-500">{property.address}</p>
                      )}
                      <div className="mt-1 space-x-4 text-sm">
                        {property.price && <span>${property.price.toLocaleString()}</span>}
                        {property.bedrooms && <span>{property.bedrooms} beds</span>}
                        {property.bathrooms && <span>{property.bathrooms} baths</span>}
                        {property.area && <span>{property.area} sqft</span>}
                      </div>
                      <a
                        href={property.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                      >
                        View Property
                      </a>
                    </div>
                    <div 
                      className="ml-4 cursor-pointer"
                      onClick={() => handleSelectProperty(property)}
                    >
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        selectedProperties.some(p => p.id === property.id)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedProperties.some(p => p.id === property.id) && (
                          <Check className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </div>
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

      {/* Edit Requirement Modal */}
      {showEditModal && selectedRequirement && (
        <RequirementForm
          clientId={clientId}
          requestId={requestId}
          initialData={selectedRequirement}
          onSubmit={async (data) => {
            setShowEditModal(false);
            onUpdate();
          }}
          onCancel={() => setShowEditModal(false)}
          isEditing={true}
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
            clientId={clientId}
            requirementId={selectedRequirement.id}
            onUpdate={() => {
              setShowGatherModal(false);
              onUpdate();
            }}
          />
        </Modal>
      )}

      {/* Email Modal */}
      {showEmailModal && selectedProperties.length > 0 && (
        <EmailTemplateModal
          isOpen={showEmailModal}
          onClose={() => {
            setShowEmailModal(false);
            setSelectedProperties([]);
          }}
          properties={selectedProperties}
          onSubmit={() => {
            setShowEmailModal(false);
            setSelectedProperties([]);
            onUpdate();
          }}
          clientId={clientId}
          requirementId={selectedRequirement?.id || ''}
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