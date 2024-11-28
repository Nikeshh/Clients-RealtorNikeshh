'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewClientPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    requirements: '',
    budget: '',
    preferredLocation: '',
    propertyType: 'residential',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submission for now
    console.log('Form submitted:', formData);
    router.push('/clients');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-900">Add New Client</h1>
        <Link
          href="/clients"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Clients
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-blue-900 border-b pb-2">Basic Information</h2>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="mt-1 block w-full rounded-md border border-blue-200 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-400 focus:ring-blue-400"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                className="mt-1 block w-full rounded-md border border-blue-200 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-400 focus:ring-blue-400"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                required
                className="mt-1 block w-full rounded-md border border-blue-200 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-400 focus:ring-blue-400"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Property Requirements */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-blue-900 border-b pb-2">Property Requirements</h2>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">
                Property Type
              </label>
              <select
                name="propertyType"
                id="propertyType"
                className="mt-1 block w-full rounded-md border border-blue-200 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-400 focus:ring-blue-400"
                value={formData.propertyType}
                onChange={handleChange}
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
                <option value="land">Land</option>
              </select>
            </div>

            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                Budget Range
              </label>
              <input
                type="text"
                name="budget"
                id="budget"
                className="mt-1 block w-full rounded-md border border-blue-200 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-400 focus:ring-blue-400"
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g., $500,000 - $750,000"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="preferredLocation" className="block text-sm font-medium text-gray-700">
                Preferred Location
              </label>
              <input
                type="text"
                name="preferredLocation"
                id="preferredLocation"
                className="mt-1 block w-full rounded-md border border-blue-200 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-400 focus:ring-blue-400"
                value={formData.preferredLocation}
                onChange={handleChange}
                placeholder="e.g., Downtown, North Side"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
                Specific Requirements
              </label>
              <textarea
                name="requirements"
                id="requirements"
                rows={3}
                className="mt-1 block w-full rounded-md border border-blue-200 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-400 focus:ring-blue-400"
                value={formData.requirements}
                onChange={handleChange}
                placeholder="e.g., 3 bedrooms, 2 bathrooms, garage"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Additional Notes
              </label>
              <textarea
                name="notes"
                id="notes"
                rows={3}
                className="mt-1 block w-full rounded-md border border-blue-200 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-400 focus:ring-blue-400"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <Link
            href="/clients"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Client
          </button>
        </div>
      </form>
    </div>
  );
} 