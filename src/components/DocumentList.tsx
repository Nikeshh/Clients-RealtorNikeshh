'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from './Button';
import Modal from './ui/Modal';
import { Plus, FileText, Download, Trash2, Upload } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: string;
  size?: number;
  mimeType?: string;
}

interface Props {
  clientId: string;
  onUpdate: () => void;
}

export default function DocumentList({ clientId, onUpdate }: Props) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadType, setUploadType] = useState('CONTRACT');
  const [description, setDescription] = useState('');
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  const loadDocuments = async () => {
    setLoading('loadDocuments', true);
    try {
      const response = await fetch(`/api/clients/${clientId}/documents`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to load documents', 'error');
    } finally {
      setLoading('loadDocuments', false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) {
      addToast('Please select files to upload', 'error');
      return;
    }

    setLoading('uploadDocuments', true);
    try {
      const formData = new FormData();
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('files', selectedFiles[i]);
      }
      formData.append('type', uploadType);
      formData.append('description', description);

      const response = await fetch(`/api/clients/${clientId}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload documents');
      
      addToast('Documents uploaded successfully', 'success');
      setShowUploadModal(false);
      setSelectedFiles(null);
      setDescription('');
      onUpdate();
      loadDocuments();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to upload documents', 'error');
    } finally {
      setLoading('uploadDocuments', false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    setLoading(`delete-${documentId}`, true);
    try {
      const response = await fetch(`/api/clients/${clientId}/documents`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      });

      if (!response.ok) throw new Error('Failed to delete document');
      
      addToast('Document deleted successfully', 'success');
      loadDocuments();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to delete document', 'error');
    } finally {
      setLoading(`delete-${documentId}`, false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Documents</h3>
        <Button
          onClick={() => setShowUploadModal(true)}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Documents
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-lg shadow-sm p-4 flex flex-col"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <h4 className="font-medium">{doc.name}</h4>
                  <p className="text-sm text-gray-500">{doc.type}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                  {doc.size && (
                    <p className="text-sm text-gray-500">
                      {formatFileSize(doc.size)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => window.open(doc.url, '_blank')}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => handleDelete(doc.id)}
                  isLoading={isLoading(`delete-${doc.id}`)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {documents.length === 0 && !isLoading('loadDocuments') && (
        <div className="text-center py-8 bg-white rounded-lg shadow-sm">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
          <p className="mt-1 text-sm text-gray-500">
            Upload documents to get started
          </p>
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Documents"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Document Type
            </label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value)}
              required
            >
              <option value="CONTRACT">Contract</option>
              <option value="ID">Identification</option>
              <option value="FINANCIAL">Financial</option>
              <option value="PROPERTY">Property</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Files
            </label>
            <input
              type="file"
              className="mt-1 block w-full"
              multiple
              onChange={(e) => setSelectedFiles(e.target.files)}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowUploadModal(false)}
              disabled={isLoading('uploadDocuments')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading('uploadDocuments')}
            >
              Upload
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 