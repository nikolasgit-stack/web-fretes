'use client';

import { useList } from '@refinedev/core';
import { ActionButton } from '../../../components/ui/action-button';
import { DataTable } from '../../../components/ui/data-table';
import { MetricCard } from '../../../components/ui/metric-card';
import { PageHeader } from '../../../components/ui/page-header';
import { SectionCard } from '../../../components/ui/section-card';
import { StatusBadge } from '../../../components/ui/status-badge';
import { Tenant } from '../types';

export function TenantsListPage(): React.JSX.Element {
  const { data, isLoading, isFetching } = useList<Tenant>({
    resource: 'tenants',
    pagination: {
      current: 1,
      pageSize: 50,
    },
  });

  const tenants = data?.data ?? [];

  return (
    <section className="content-stack">
      <PageHeader
        title="Tenants"
        description="Gerencie empresas clientes, ativação da conta e a base multi-tenant do admin."
        actionLabel="Novo tenant"
        actionHref="/tenants/create"
        eyebrow="Base multi-tenant"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard helper="Empresas cadastradas na plataforma" label="Total de tenants" value={data?.total ?? 0} />
        <MetricCard helper="Contas disponíveis para operação" label="Ativos" value={tenants.filter((tenant) => tenant.ativo).length} />
        <MetricCard helper="Contas temporariamente indisponíveis" label="Inativos" value={tenants.filter((tenant) => !tenant.ativo).length} />
        <MetricCard helper="Base para escopo e isolamento" label="Ambiente SaaS" tone="highlight" value="Multi-tenant" />
      </div>

      <SectionCard
        action={
          <div className="flex items-center gap-3 text-sm text-[var(--wf-muted)]">
            <span>{isFetching ? 'Atualizando...' : `${tenants.length} registro(s)`}</span>
            <ActionButton href="/tenants/create" variant="primary">
              Novo tenant
            </ActionButton>
          </div>
        }
        description="Listagem da base de clientes com slug, status e data de criação."
        eyebrow="Listagem"
        title="Base de tenants"
      >
        <DataTable
          columns={[
            {
              key: 'nome',
              header: 'Empresa',
              render: (tenant) => (
                <div>
                  <strong className="block text-sm font-semibold text-[var(--wf-ink)]">{tenant.nome}</strong>
                  <span className="text-sm text-[var(--wf-muted)]">{tenant.slug}</span>
                </div>
              ),
            },
            {
              key: 'slug',
              header: 'Slug',
              render: (tenant) => tenant.slug,
            },
            {
              key: 'status',
              header: 'Status',
              render: (tenant) => <StatusBadge active={tenant.ativo} />,
            },
            {
              key: 'criadoEm',
              header: 'Criado em',
              render: (tenant) => new Date(tenant.criadoEm).toLocaleString('pt-BR'),
            },
          ]}
          data={tenants}
          emptyDescription="Comece criando o primeiro tenant administrativo."
          emptyTitle="Nenhum tenant cadastrado."
          loading={isLoading}
          loadingLabel="Carregando tenants..."
        />
      </SectionCard>
    </section>
  );
}
