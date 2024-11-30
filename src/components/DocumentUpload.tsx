'use client';

import { useState } from 'react';
import { Upload, X, FileText, File, Image } from 'lucide-react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';

interface DocumentUploadProps {
  onUpload: (files: { name: string; url: string; type: string }[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

export default function DocumentUpload({ 
  onUpload, 
  maxFiles = 5,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']
}: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    if (uploadedFiles.length + files.length > maxFiles) {
      addToast(`Maximum ${maxFiles} files allowed`, 'error');
      return;
    }

    const validFiles = files.filter(file => {
      const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      if (!acceptedTypes.includes(extension)) {
        addToast(`File type ${extension} is not supported`, 'error');
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        addToast(`File ${file.name} exceeds 10MB limit`, 'error');
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploadedFiles(prev => [...prev, ...validFiles]);
    setLoading('uploadDocuments', true);

    try {
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload files');

      const data = await response.json();
      onUpload(data.files);
      addToast('Files uploaded successfully', 'success');
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to upload files', 'error');
      setUploadedFiles(prev => prev.filter(f => !validFiles.includes(f)));
    } finally {
      setLoading('uploadDocuments', false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(files => files.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <File className="h-5 w-5 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <Image className="h-5 w-5 text-green-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer"
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            <span className="font-medium text-blue-600 hover:text-blue-500">
              Click to upload
            </span>
            {' '}or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {acceptedTypes.join(', ')} up to {maxFiles} files
          </p>
        </label>
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                {getFileIcon(file.name)}
                <span className="text-sm text-gray-700">{file.name}</span>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-gray-500"
                disabled={isLoading('uploadDocuments')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 