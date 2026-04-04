'use client';

import { useList } from '@refinedev/core';
import { ActionButton } from '../../../components/ui/action-button';
import { DataTable } from '../../../components/ui/data-table';
import { MetricCard } from '../../../components/ui/metric-card';
import { PageHeader } from '../../../components/ui/page-header';
import { SectionCard } from '../../../components/ui/section-card';
import { StatusBadge } from '../../../components/ui/status-badge';
import { User } from '../types';

export function UsersListPage(): React.JSX.Element {
  const { data, isLoading, isFetching } = useList<User>({
    resource: 'users',
    pagination: {
      current: 1,
      pageSize: 50,
    },
  });

  const users = data?.data ?? [];

  return (
    <section className="content-stack">
      <PageHeader
        title="Usuários"
        description="Gerencie acessos administrativos, tenants vinculados e disponibilidade operacional."
        actionLabel="Novo usuário"
        actionHref="/users/create"
        eyebrow="Acesso e governança"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard helper="Base administrativa cadastrada" label="Total de usuários" value={data?.total ?? 0} />
        <MetricCard helper="Acessos disponíveis no ambiente" label="Ativos" value={users.filter((user) => user.ativo).length} />
        <MetricCard helper="Usuários já vinculados a empresas" label="Com tenant" value={users.filter((user) => Boolean(user.tenantId)).length} />
        <MetricCard helper="Cobertura de contas no admin" label="Tenants com usuários" tone="highlight" value={new Set(users.map((user) => user.tenantId)).size} />
      </div>

      <SectionCard
        action={
          <div className="flex items-center gap-3 text-sm text-[var(--wf-muted)]">
            <span>{isFetching ? 'Atualizando...' : `${users.length} registro(s)`}</span>
            <ActionButton href="/users/create" variant="primary">
              Novo usuário
            </ActionButton>
          </div>
        }
        description="Lista consolidada de acessos administrativos com tenant associado e status atual."
        eyebrow="Listagem"
        title="Base de usuários"
      >
        <DataTable
          columns={[
            {
              key: 'nome',
              header: 'Usuário',
              render: (user) => (
                <div>
                  <strong className="block text-sm font-semibold text-[var(--wf-ink)]">{user.nome}</strong>
                  <span className="text-sm text-[var(--wf-muted)]">{user.email}</span>
                </div>
              ),
            },
            {
              key: 'tenant',
              header: 'Tenant',
              render: (user) => user.tenant?.nome ?? user.tenantId,
            },
            {
              key: 'status',
              header: 'Status',
              render: (user) => <StatusBadge active={user.ativo} />,
            },
            {
              key: 'criadoEm',
              header: 'Criado em',
              render: (user) => new Date(user.criadoEm).toLocaleString('pt-BR'),
            },
          ]}
          data={users}
          emptyDescription="Cadastre o primeiro usuário administrativo do ambiente."
          emptyTitle="Nenhum usuário cadastrado."
          loading={isLoading}
          loadingLabel="Carregando usuários..."
        />
      </SectionCard>
    </section>
  );
}
