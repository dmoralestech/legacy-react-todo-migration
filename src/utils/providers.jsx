'use client';

import React, { useState } from 'react';
import { Provider as JotaiProviderBase } from 'jotai';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Main Provider Component - Jotai + TanStack Query (Redux removed)
export const JotaiProvider = ({ children }) => {
  // Create QueryClient instance inside component for Next.js compatibility
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 3,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProviderBase>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </JotaiProviderBase>
    </QueryClientProvider>
  );
};