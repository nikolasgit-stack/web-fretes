'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useGetIdentity, useLogout } from '@refinedev/core';

const navigationItems = [
  { href: '/tenants', label: 'Tenants' },
  { href: '/users', label: 'Users' },
  { href: '/transportadoras', label: 'Transportadoras' },
  { href: '/centros-distribuicao', label: 'Centros de Distribuicao' },
  { href: '/regras-frete', label: 'Regras de Frete' },
];

export function AdminShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
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
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-kicker">WF</span>
          <strong>Web Fretes</strong>
          <p>Painel administrativo SaaS</p>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                className={isActive ? 'nav-link nav-link-active' : 'nav-link'}
                href={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <span>API</span>
          <strong>{process.env.NEXT_PUBLIC_API_URL ?? 'Nao configurada'}</strong>
        </div>
      </aside>

      <div className="admin-main">
        <header className="topbar">
          <div>
            <span className="topbar-kicker">Ambiente administrativo</span>
            <h1>Web Fretes Admin</h1>
          </div>

          <div className="topbar-actions">
            <div className="identity-card">
              <span>{identity?.name ?? 'Usuario autenticado'}</span>
              <strong>{identity?.tenantId ?? 'Sem tenant'}</strong>
            </div>
            <button className="ghost-button" onClick={handleLogout} type="button">
              Sair
            </button>
          </div>
        </header>

        <div className="content-area">{children}</div>
      </div>
    </div>
  );
}
