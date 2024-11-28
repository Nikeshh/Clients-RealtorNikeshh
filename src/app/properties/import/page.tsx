'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ImportPropertiesPage() {
  const router = useRouter();
  const [importMethod, setImportMethod] = useState<'url' | 'file'>('url');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock import process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Import submitted:', {
      method: importMethod,
      data: importMethod === 'url' ? url : file?.name
    });

    setIsLoading(false);
    router.push('/properties');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-900">Import Properties</h1>
        <Link
          href="/properties"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Properties
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Import Method Selection */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setImportMethod('url')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                importMethod === 'url'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Import from URL
            </button>
            <button
              type="button"
              onClick={() => setImportMethod('file')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                importMethod === 'file'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Upload Broker Sheet
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {importMethod === 'url' ? (
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                Property Listing URL
              </label>
              <input
                type="url"
                id="url"
                name="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/property-listing"
                className="mt-1 block w-full rounded-md border border-blue-200 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-400 focus:ring-blue-400"
                required={importMethod === 'url'}
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter the URL of the property listing you want to import
              </p>
            </div>
          ) : (
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                Broker Sheet
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileChange}
                        required={importMethod === 'file'}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">Excel or CSV files up to 10MB</p>
                  {file && (
                    <p className="text-sm text-blue-600">Selected: {file.name}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Import Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-blue-900">Import Options</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  defaultChecked
                />
                <span className="ml-2 text-sm text-gray-700">
                  Skip duplicate properties
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  defaultChecked
                />
                <span className="ml-2 text-sm text-gray-700">
                  Auto-categorize properties
                </span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Link
              href="/properties"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Importing...' : 'Import Properties'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 