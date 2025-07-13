import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as JotaiProvider } from 'jotai';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // Temporarily disabled
import store from '../store';

// Create QueryClient instance for TanStack Query
const queryClient = new QueryClient({
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
});

// Dual Provider Component - both Redux and Jotai coexist
export const DualStateProvider = ({ children }) => {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <JotaiProvider>
          {children}
          {/* React Query DevTools - temporarily disabled for debugging */}
        </JotaiProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
};

// Legacy Provider - just Redux (for rollback capability)
export const LegacyProvider = ({ children }) => {
  return (
    <ReduxProvider store={store}>
      {children}
    </ReduxProvider>
  );
};

// Modern Provider - just Jotai + TanStack Query (for future)
export const ModernProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        {children}
        {/* React Query DevTools - temporarily disabled for debugging */}
      </JotaiProvider>
    </QueryClientProvider>
  );
};

// Export the QueryClient for direct access if needed
export { queryClient };