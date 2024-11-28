'use client';

import { useState } from 'react';

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  type: string;
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  status: string;
  description: string;
  features: string[];
}

interface EditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  onSave: (property: Property) => void;
}

export default function EditPropertyModal({
  isOpen,
  onClose,
  property,
  onSave
}: EditPropertyModalProps) {
  const [formData, setFormData] = useState(property);
  const [newFeature, setNewFeature] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value ? Number(value) : ''
    }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSave(formData);
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-auto overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-blue-900">
            Edit Property
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4 md:col-span-2">
              <h4 className="text-sm font-medium text-blue-900">Basic Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-blue-200 px-3 py-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-blue-200 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleNumberChange}
                    className="mt-1 block w-full rounded-lg border border-blue-200 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-blue-200 px-3 py-2"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-blue-200 px-3 py-2"
                  >
                    <option value="Available">Available</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Area (sqft)</label>
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleNumberChange}
                    className="mt-1 block w-full rounded-lg border border-blue-200 px-3 py-2"
                    required
                  />
                </div>

                {formData.type === 'Residential' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                      <input
                        type="number"
                        name="bedrooms"
                        value={formData.bedrooms || ''}
                        onChange={handleNumberChange}
                        className="mt-1 block w-full rounded-lg border border-blue-200 px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                      <input
                        type="number"
                        name="bathrooms"
                        value={formData.bathrooms || ''}
                        onChange={handleNumberChange}
                        className="mt-1 block w-full rounded-lg border border-blue-200 px-3 py-2"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-lg border border-blue-200 px-3 py-2"
              />
            </div>

            {/* Features */}
            <div className="md:col-span-2 space-y-4">
              <h4 className="text-sm font-medium text-blue-900">Features</h4>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  className="flex-1 rounded-lg border border-blue-200 px-3 py-2"
                  placeholder="Add a feature..."
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                >
                  Add
                </button>
              </div>

              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                    <span className="text-sm text-gray-700">{feature}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 ${
                isSaving ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 