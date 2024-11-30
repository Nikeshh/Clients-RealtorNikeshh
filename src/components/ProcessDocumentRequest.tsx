'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from '@/components/Button';
import { FileText, Upload, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface DocumentRequest {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  dueDate?: string;
  completedAt?: string;
  documents?: Array<{
    id: string;
    name: string;
    url: string;
    uploadedAt: string;
  }>;
}

interface Props {
  clientId: string;
  request: DocumentRequest;
  onUpdate: () => void;
}

export default function ProcessDocumentRequest({ clientId, request, onUpdate }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      addToast('Please select files to upload', 'error');
      return;
    }

    setLoading('uploadDocuments', true);
    try {
      // Upload files
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) throw new Error('Failed to upload files');
      const uploadedFiles = await uploadResponse.json();

      // Save document references
      const saveResponse = await fetch(`/api/clients/${clientId}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: request.id,
          documents: uploadedFiles.files
        }),
      });

      if (!saveResponse.ok) throw new Error('Failed to save documents');

      // Update request status
      await fetch(`/api/clients/${clientId}/process/documents/${request.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'COMPLETED',
          completedAt: new Date().toISOString()
        }),
      });

      addToast('Documents uploaded successfully', 'success');
      setFiles([]);
      onUpdate();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to upload documents', 'error');
    } finally {
      setLoading('uploadDocuments', false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-gray-900">{request.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{request.description}</p>
          {request.dueDate && (
            <p className="text-sm text-gray-500 mt-2">
              Due: {formatDate(request.dueDate)}
            </p>
          )}
        </div>
        <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
          request.status === 'COMPLETED' 
            ? 'bg-green-100 text-green-800'
            : request.status === 'FAILED'
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {request.status}
        </div>
      </div>

      {request.status !== 'COMPLETED' && (
        <div className="mt-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => document.getElementById('file-upload')?.click()}
              variant="secondary"
              size="small"
            >
              <Upload className="h-4 w-4 mr-2" />
              Select Files
            </Button>
            <input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            {files.length > 0 && (
              <Button
                onClick={handleUpload}
                variant="primary"
                size="small"
                isLoading={isLoading('uploadDocuments')}
              >
                Upload {files.length} file{files.length !== 1 ? 's' : ''}
              </Button>
            )}
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{file.name}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {request.documents && request.documents.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Uploaded Documents</h4>
          <div className="space-y-2">
            {request.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-600">{doc.name}</span>
                    <p className="text-xs text-gray-400">
                      Uploaded {formatDate(doc.uploadedAt)}
                    </p>
                  </div>
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 