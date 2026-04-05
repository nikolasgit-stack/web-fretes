'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Refine } from '@refinedev/core';
import routerProvider from '@refinedev/nextjs-router/app';
import { resolveApiBaseUrl } from '../lib/api-base-url';
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
  {
    name: 'transportadoras',
    list: '/transportadoras',
    create: '/transportadoras/create',
    edit: '/transportadoras/:id/edit',
    meta: {
      label: 'Transportadoras',
    },
  },
  {
    name: 'transportadoras-arquivos-tabelas-frete',
    list: '/transportadoras/arquivos/tabelas-frete',
    meta: {
      label: 'Tabelas de Frete',
    },
  },
  {
    name: 'centros-distribuicao',
    list: '/centros-distribuicao',
    create: '/centros-distribuicao/create',
    edit: '/centros-distribuicao/:id/edit',
    meta: {
      label: 'Centros de Distribuicao',
    },
  },
  {
    name: 'regras-frete',
    list: '/regras-frete',
    create: '/regras-frete/create',
    edit: '/regras-frete/:id/edit',
    meta: {
      label: 'Regras de Frete',
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
        dataProvider={dataProvider(resolveApiBaseUrl(process.env.NEXT_PUBLIC_API_URL))}
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
