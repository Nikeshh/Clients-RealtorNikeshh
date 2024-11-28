'use client';

import { PropsWithChildren } from 'react';
import { ToastProvider } from '@/contexts/ToastContext';

export default function Providers({ children }: PropsWithChildren) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
} 