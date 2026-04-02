'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Refine } from '@refinedev/core';
import routerProvider from '@refinedev/nextjs-router/app';
import { authProvider } from './auth-provider';
import { dataProvider } from './data-provider';

const resources = [
  {
    name: 'tenants',
    list: '/tenants',
    create: '/tenants/create',
    meta: {
      label: 'Tenants',
    },
  },
  {
    name: 'users',
    list: '/users',
    create: '/users/create',
    meta: {
      label: 'Users',
    },
  },
];

export function RefineProvider({
  children,
}: Readonly<{
  children: ReactNode;
}>): React.JSX.Element {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Refine
        routerProvider={routerProvider}
        authProvider={authProvider}
        dataProvider={dataProvider(process.env.NEXT_PUBLIC_API_URL ?? '')}
        resources={resources}
        options={{
          syncWithLocation: true,
          warnWhenUnsavedChanges: true,
          projectId: 'web-fretes-web',
        }}
      >
        {children}
      </Refine>
    </QueryClientProvider>
  );
}
