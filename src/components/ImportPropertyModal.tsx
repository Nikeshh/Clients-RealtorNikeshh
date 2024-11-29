'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import Modal from '@/components/ui/Modal';
import Button from '@/components/Button';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import { Upload, Link2, FileSpreadsheet, FileText } from 'lucide-react';

interface ImportPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: () => void;
}

type ImportType = 'url' | 'excel' | 'pdf';

export default function ImportPropertyModal({
  isOpen,
  onClose,
  onImport,
}: ImportPropertyModalProps) {
  const [importType, setImportType] = useState<ImportType>('url');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const { setLoading, isLoading } = useLoadingStates();
  const { addToast } = useToast();

  const handleImport = async () => {
    if (importType === 'url' && !url) {
      addToast('Please enter a valid URL', 'error');
      return;
    }

    if ((importType === 'excel' || importType === 'pdf') && !file) {
      addToast('Please select a file', 'error');
      return;
    }

    setLoading('importProperty', true);
    try {
      let response;
      if (importType === 'url') {
        response = await fetch('/api/properties/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url, importType }),
        });
      } else {
        const formData = new FormData();
        formData.append('file', file!);
        formData.append('importType', importType);

        response = await fetch('/api/properties/import', {
          method: 'POST',
          body: formData,
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to import property');
      }

      const data = await response.json();
      addToast(`Successfully imported ${data.imported || 1} properties`, 'success');
      onImport();
      onClose();
      setUrl('');
      setFile(null);
    } catch (error) {
      console.error('Error:', error);
      addToast(error instanceof Error ? error.message : 'Failed to import property', 'error');
    } finally {
      setLoading('importProperty', false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setFile(files[0]);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Properties">
      <div className="space-y-6">
        {/* Import Type Selection */}
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setImportType('url');
              setFile(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border ${
              importType === 'url'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Link2 className="w-5 h-5" />
            <span>URL</span>
          </button>
          <button
            onClick={() => {
              setImportType('excel');
              setUrl('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border ${
              importType === 'excel'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span>Excel</span>
          </button>
          <button
            onClick={() => {
              setImportType('pdf');
              setUrl('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border ${
              importType === 'pdf'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>PDF</span>
          </button>
        </div>

        {/* URL Input */}
        {importType === 'url' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Property Listing URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.realtor.com/property/..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Supported websites: Realtor.ca, Realtor.com, Zillow, Trulia
            </p>
          </div>
        )}

        {/* File Upload */}
        {(importType === 'excel' || importType === 'pdf') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload {importType === 'excel' ? 'Excel File' : 'PDF'}
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept={importType === 'excel' ? '.xlsx,.xls,.csv' : '.pdf'}
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  {importType === 'excel' ? 'Excel or CSV files' : 'PDF files'} up to 10MB
                </p>
                {file && (
                  <p className="text-sm text-blue-600">Selected: {file.name}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            onClick={() => {
              onClose();
              setUrl('');
              setFile(null);
            }}
            variant="secondary"
            disabled={isLoading('importProperty')}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            variant="primary"
            isLoading={isLoading('importProperty')}
            disabled={
              (importType === 'url' && !url.trim()) ||
              ((importType === 'excel' || importType === 'pdf') && !file)
            }
          >
            Import
          </Button>
        </div>
      </div>
    </Modal>
  );
} 