"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

interface QueryContextProps {
  children: React.ReactNode;
}

export default function QueryContext({ children }: QueryContextProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0,          // Always treat data as stale → refetch on every mount
            retry: 1,
            refetchOnWindowFocus: true,  // Re-sync when user tabs back into admin
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
