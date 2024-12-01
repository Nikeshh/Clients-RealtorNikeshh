'use client';

import { useState } from 'react';
import Button from './Button';

interface Props {
  onSubmit: (text: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ChecklistForm({ onSubmit, onCancel, isLoading }: Props) {
  const [text, setText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    await onSubmit(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        placeholder="Enter checklist item..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
      />
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
        >
          Add
        </Button>
      </div>
    </form>
  );
} 