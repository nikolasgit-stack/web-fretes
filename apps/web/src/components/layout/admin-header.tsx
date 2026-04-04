'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useGetIdentity, useLogout } from '@refinedev/core';
import { ActionButton } from '../ui/action-button';

function getSectionLabel(pathname: string): string {
  if (pathname.startsWith('/transportadoras')) return 'Transportadoras';
  if (pathname.startsWith('/centros-distribuicao')) return 'Centros de distribuição';
  if (pathname.startsWith('/regras-frete')) return 'Regras de frete';
  if (pathname.startsWith('/users')) return 'Usuários';
  if (pathname.startsWith('/tenants')) return 'Tenants';
  return 'Painel';
}

export function AdminHeader(): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const { mutate: logout } = useLogout();
  const { data: identity } = useGetIdentity<{
    id: string;
    name: string;
    email: string;
    tenantId: string;
  }>();

  function handleLogout(): void {
    logout(undefined, {
      onSuccess: (result) => {
        router.push(result?.redirectTo ?? '/login');
      },
    });
  }

  return (
    <header className="sticky top-4 z-20 rounded-[32px] border border-[var(--wf-border)] bg-[rgba(255,255,255,0.92)] px-6 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--wf-primary)]">
            Web Fretes Admin
          </p>
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[var(--wf-ink)]">
              {getSectionLabel(pathname)}
            </h1>
            <p className="text-sm text-[var(--wf-muted)]">
              Operação logística com visão consolidada, filtros rápidos e ações diretas.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="rounded-2xl border border-[var(--wf-border)] bg-[var(--wf-surface-alt)] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--wf-muted)]">Sessão atual</p>
            <strong className="mt-1 block text-sm text-[var(--wf-ink)]">
              {identity?.name ?? 'Usuário autenticado'}
            </strong>
            <span className="text-sm text-[var(--wf-muted)]">{identity?.tenantId ?? 'Sem tenant'}</span>
          </div>

          <ActionButton onClick={handleLogout} variant="secondary">
            Sair
          </ActionButton>
        </div>
      </div>
    </header>
  );
}
