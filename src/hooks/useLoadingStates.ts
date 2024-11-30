'use client';

import { useState } from 'react';

export function useLoadingStates() {
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  const setLoading = (key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  };

  const isLoading = (key: string) => {
    return loadingStates[key] || false;
  };

  return { setLoading, isLoading };
} 