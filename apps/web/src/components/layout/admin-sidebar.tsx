'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../ui/cn';

interface NavigationItem {
  href: string;
  label: string;
  short: string;
  description: string;
}

const navigationItems: NavigationItem[] = [
  {
    href: '/transportadoras',
    label: 'Transportadoras',
    short: 'TR',
    description: 'Parceiros, integrações e operação',
  },
  {
    href: '/centros-distribuicao',
    label: 'Centros de distribuição',
    short: 'CD',
    description: 'Origem, cobertura e capacidade',
  },
  {
    href: '/regras-frete',
    label: 'Regras de frete',
    short: 'RF',
    description: 'Prioridade, elegibilidade e decisão',
  },
  {
    href: '/users',
    label: 'Usuários',
    short: 'US',
    description: 'Acessos e gestão operacional',
  },
  {
    href: '/tenants',
    label: 'Tenants',
    short: 'TN',
    description: 'Contas e escopo multi-tenant',
  },
];

export function AdminSidebar(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <aside className="rounded-[32px] border border-[var(--wf-border)] bg-[linear-gradient(180deg,#0f1720_0%,#16232f_100%)] p-5 text-white shadow-[0_24px_64px_rgba(15,23,42,0.22)]">
      <div className="flex h-full flex-col gap-8">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--wf-accent)]">
            Web Fretes
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.06em]">Admin</h2>
          <p className="mt-2 text-sm text-slate-300">
            Gestão logística com uma navegação limpa, rápida e orientada por operação.
          </p>
        </div>

        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                className={cn(
                  'flex items-center gap-4 rounded-[24px] px-4 py-3 transition',
                  isActive ? 'bg-[var(--wf-primary)] text-white' : 'text-slate-200 hover:bg-white/6',
                )}
                href={item.href}
              >
                <span
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xs font-semibold uppercase tracking-[0.16em]',
                    isActive ? 'bg-white/18 text-white' : 'bg-white/8 text-slate-200',
                  )}
                >
                  {item.short}
                </span>
                <span className="min-w-0">
                  <strong className="block truncate text-sm font-semibold">{item.label}</strong>
                  <span className="block truncate text-xs text-slate-300">{item.description}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-300">API</p>
          <strong className="mt-2 block break-all text-sm font-medium text-white/90">
            {process.env.NEXT_PUBLIC_API_URL ?? 'Não configurada'}
          </strong>
        </div>
      </div>
    </aside>
  );
}
