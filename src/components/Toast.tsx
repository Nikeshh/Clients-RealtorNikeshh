'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast modal-animation ${type === 'success' ? 'toast-success' : 'toast-error'}`}>
      <div className="flex items-center">
        <span className="mr-2">
          {type === 'success' ? '✓' : '✕'}
        </span>
        {message}
      </div>
    </div>
  );
} 