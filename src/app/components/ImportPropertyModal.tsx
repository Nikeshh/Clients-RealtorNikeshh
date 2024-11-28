'use client';

import { useState } from 'react';

interface ImportPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (url: string) => void;
}

export default function ImportPropertyModal({ isOpen, onClose, onImport }: ImportPropertyModalProps) {
  const [url, setUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onImport(url);
    setUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-6">Import Property</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property URL from Treeb
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="https://treeb.com/property/..."
              required
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Import Property
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 