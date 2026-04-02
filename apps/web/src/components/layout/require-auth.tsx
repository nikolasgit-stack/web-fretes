'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsAuthenticated } from '@refinedev/core';

export function RequireAuth({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  const router = useRouter();
  const { data, isLoading } = useIsAuthenticated();

  useEffect(() => {
    if (!isLoading && !data?.authenticated) {
      router.replace('/login');
    }
  }, [data?.authenticated, isLoading, router]);

  if (isLoading || !data?.authenticated) {
    return (
      <div className="state-card">
        <strong>Validando sessao...</strong>
        <span>Aguarde enquanto carregamos o painel administrativo.</span>
      </div>
    );
  }

  return <>{children}</>;
}
