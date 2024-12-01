"use client";

import { useState } from "react";
import { useLoadingStates } from "@/hooks/useLoadingStates";
import { useToast } from "@/components/ui/toast-context";
import Button from "./Button";
import { Plus, Mail, X, Building2, Check } from "lucide-react";
import EmailTemplateModal from "./EmailTemplateModal";

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

interface Props {
  clientId: string;
  requirementId: string;
  onUpdate: () => void;
}

export default function PropertySearch({
  clientId,
  requirementId,
  onUpdate,
}: Props) {
  const [properties, setProperties] = useState<GatheredProperty[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<GatheredProperty[]>([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<GatheredProperty>({
    id: "",
    title: "",
    address: "",
    price: 0,
    bedrooms: undefined,
    bathrooms: undefined,
    area: undefined,
    link: "",
  });

  const { setLoading, isLoading } = useLoadingStates();
  const { addToast } = useToast();

  const handleAddProperty = async () => {
    if (!formData.title || !formData.link) return;

    setLoading("addProperty", true);
    try {
      const response = await fetch(
        `/api/clients/${clientId}/requirements/${requirementId}/properties`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error("Failed to save property");

      const savedProperty = await response.json();

      setProperties([...properties, savedProperty]);
      setFormData({
        id: "",
        title: "",
        address: "",
        price: 0,
        bedrooms: undefined,
        bathrooms: undefined,
        area: undefined,
        link: "",
      });
      setShowAddForm(false);
      addToast("Property added successfully", "success");
      onUpdate();
    } catch (error) {
      console.error("Error:", error);
      addToast("Failed to add property", "error");
    } finally {
      setLoading("addProperty", false);
    }
  };

  const handleRemoveProperty = (index: number) => {
    const newProperties = [...properties];
    newProperties.splice(index, 1);
    setProperties(newProperties);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSelectProperty = (property: GatheredProperty) => {
    if (selectedProperties.some(p => p.id === property.id)) {
      setSelectedProperties(selectedProperties.filter(p => p.id !== property.id));
    } else {
      setSelectedProperties([...selectedProperties, property]);
    }
  };

  const handleSelectAll = () => {
    if (selectedProperties.length === properties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties([...properties]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Selection Controls */}
      {properties.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="small"
              onClick={handleSelectAll}
            >
              {selectedProperties.length === properties.length ? 'Deselect All' : 'Select All'}
            </Button>
            {selectedProperties.length > 0 && (
              <Button
                variant="secondary"
                size="small"
                onClick={() => setShowEmailModal(true)}
              >
                <Mail className="h-4 w-4 mr-1" />
                Email Selected ({selectedProperties.length})
              </Button>
            )}
          </div>
          {selectedProperties.length > 0 && (
            <span className="text-sm text-gray-500">
              {selectedProperties.length} properties selected
            </span>
          )}
        </div>
      )}

      {/* Properties List */}
      <div className="space-y-4">
        {properties.map((property) => (
          <div
            key={property.id}
            className={`flex justify-between items-start p-4 border rounded-lg ${
              selectedProperties.some(p => p.id === property.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200'
            }`}
          >
            <div className="flex-grow">
              <h4 className="font-medium">{property.title}</h4>
              {property.address && (
                <p className="text-sm text-gray-500">{property.address}</p>
              )}
              <div className="flex gap-4 mt-1 text-sm">
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
            {/* Add Checkbox */}
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

      {/* Add Property Button/Form */}
      {showAddForm ? (
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-medium mb-4">Add Property</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Property Title *
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.price || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Area (sqft)
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.area || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      area: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bedrooms
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.bedrooms || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bedrooms: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bathrooms
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.bathrooms || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bathrooms: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Property Link *
              </label>
              <input
                type="url"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddProperty}
                disabled={!formData.title || !formData.link}
              >
                Add Property
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button onClick={() => setShowAddForm(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      )}

      {/* Email Modal */}
      {showEmailModal && (
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
          requirementId={requirementId}
        />
      )}
    </div>
  );
}
