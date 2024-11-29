import { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import Modal from '@/components/ui/Modal';
import Button from '@/components/Button';

interface ImportPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: () => void;
}

export default function ImportPropertyModal({
  isOpen,
  onClose,
  onImport,
}: ImportPropertyModalProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleImport = async () => {
    if (!url) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/properties/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) throw new Error('Failed to import property');

      const data = await response.json();
      addToast('Property imported successfully', 'success');
      onImport();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to import property', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Property">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Property URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/property"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter the URL of the property listing you want to import
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="secondary"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            variant="primary"
            isLoading={isLoading}
            disabled={!url.trim()}
          >
            Import Property
          </Button>
        </div>
      </div>
    </Modal>
  );
} 