'use client';

import { useState } from 'react';
import { HttpError, useDelete, useList, useUpdate } from '@refinedev/core';
import { ActionButton } from '../../../components/ui/action-button';
import { DataTable } from '../../../components/ui/data-table';
import { MetricCard } from '../../../components/ui/metric-card';
import { PageHeader } from '../../../components/ui/page-header';
import { SectionCard } from '../../../components/ui/section-card';
import { StatusBadge } from '../../../components/ui/status-badge';
import { Tenant } from '../../tenants/types';
import { Transportadora } from '../types';

export function TransportadorasListPage(): React.JSX.Element {
  const [tenantId, setTenantId] = useState('');
  const [nome, setNome] = useState('');
  const [ativo, setAtivo] = useState('');
  const [feedback, setFeedback] = useState('');
  const { mutateAsync: updateTransportadora } = useUpdate<Transportadora, HttpError>();
  const { mutateAsync: deleteTransportadora } = useDelete<Transportadora, HttpError>();

  const { data: tenantsData } = useList<Tenant>({
    resource: 'tenants',
    pagination: { current: 1, pageSize: 100 },
  });
  const { data, isLoading, isFetching, refetch } = useList<Transportadora>({
    resource: 'transportadoras',
    pagination: {
      current: 1,
      pageSize: 100,
    },
    filters: [
      { field: 'tenantId', operator: 'eq', value: tenantId || undefined },
      { field: 'nome', operator: 'contains', value: nome || undefined },
      { field: 'ativo', operator: 'eq', value: ativo || undefined },
    ],
  });

  const transportadoras = data?.data ?? [];
  const tenants = tenantsData?.data ?? [];
  const tenantNameById = Object.fromEntries(tenants.map((tenant) => [tenant.id, tenant.nome]));
  const manualCount = transportadoras.filter((item) => item.tipoIntegracao === 'manual').length;

  async function toggleStatus(record: Transportadora): Promise<void> {
    setFeedback('');

    try {
      await updateTransportadora({
        resource: 'transportadoras',
        id: record.id,
        values: {
          ativo: !record.ativo,
        },
      });
      setFeedback(
        record.ativo
          ? 'Transportadora inativada com sucesso.'
          : 'Transportadora ativada com sucesso.',
      );
      await refetch();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Falha ao atualizar status.');
    }
  }

  async function removeRecord(record: Transportadora): Promise<void> {
    if (!window.confirm(`Excluir a transportadora ${record.nome}?`)) {
      return;
    }

    setFeedback('');

    try {
      await deleteTransportadora({
        resource: 'transportadoras',
        id: record.id,
      });
      setFeedback('Transportadora excluida com sucesso.');
      await refetch();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Falha ao excluir transportadora.');
    }
  }

  return (
    <section className="content-stack">
      <PageHeader
        title="Transportadoras"
        description="Gerencie parceiros logísticos, integrações e parâmetros operacionais em uma visão única."
        actionLabel="Nova transportadora"
        actionHref="/transportadoras/create"
        eyebrow="Cadastros logísticos"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          helper="Base atual disponível para cotação"
          label="Total de transportadoras"
          value={data?.total ?? 0}
        />
        <MetricCard
          helper="Operando normalmente no tenant"
          label="Ativas"
          value={transportadoras.filter((item) => item.ativo).length}
        />
        <MetricCard
          helper="Fluxos mais rápidos para manutenção"
          label="Integração manual"
          value={manualCount}
        />
        <MetricCard
          helper="Cobertura configurada por UF origem"
          label="UFs de origem"
          tone="highlight"
          value={new Set(transportadoras.map((item) => item.estadoOrigem)).size}
        />
      </div>

      <SectionCard
        action={
          <>
            <ActionButton onClick={() => refetch()} variant="subtle">
              {isFetching ? 'Atualizando...' : 'Atualizar dados'}
            </ActionButton>
            <ActionButton
              onClick={() => {
                setTenantId('');
                setNome('');
                setAtivo('');
              }}
              variant="secondary"
            >
              Limpar filtros
            </ActionButton>
          </>
        }
        description="Filtre por tenant, nome ou status para encontrar rapidamente a transportadora certa."
        eyebrow="Operação"
        title="Filtros de consulta"
      >
        <div className="filter-grid">
          <label className="field">
            <span>Tenant</span>
            <select value={tenantId} onChange={(event) => setTenantId(event.target.value)}>
              <option value="">Todos</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Nome</span>
            <input
              placeholder="Buscar por nome"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
            />
          </label>
          <label className="field">
            <span>Status</span>
            <select value={ativo} onChange={(event) => setAtivo(event.target.value)}>
              <option value="">Todos</option>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </label>
        </div>

        {feedback ? <p className="status-inline">{feedback}</p> : null}
      </SectionCard>

      <SectionCard
        action={
          <div className="flex items-center gap-3 text-sm text-[var(--wf-muted)]">
            <span>{transportadoras.length} registro(s)</span>
            <ActionButton href="/transportadoras/create" variant="primary">
              Nova transportadora
            </ActionButton>
          </div>
        }
        description="Visão de cadastro com status, tenant, modalidade e atalhos de manutenção."
        eyebrow="Listagem"
        title="Base de transportadoras"
      >
        <DataTable
          columns={[
            {
              key: 'nome',
              header: 'Transportadora',
              render: (record) => (
                <div>
                  <strong className="block text-sm font-semibold text-[var(--wf-ink)]">
                    {record.nome}
                  </strong>
                  <span className="text-sm text-[var(--wf-muted)]">
                    Código {record.codigoInterno}
                  </span>
                </div>
              ),
            },
            {
              key: 'tenant',
              header: 'Tenant',
              render: (record) => tenantNameById[record.tenantId] ?? record.tenantId,
            },
            {
              key: 'tipo',
              header: 'Integração',
              render: (record) => (
                <div>
                  <strong className="block text-sm font-medium">
                    {record.tipoIntegracao.toUpperCase()}
                  </strong>
                  <span className="text-sm text-[var(--wf-muted)]">
                    {record.modalidade ?? 'Modalidade não informada'}
                  </span>
                </div>
              ),
            },
            {
              key: 'parametros',
              header: 'Parâmetros',
              render: (record) => (
                <div className="space-y-1 text-sm text-[var(--wf-muted)]">
                  <p>UF origem: {record.estadoOrigem}</p>
                  <p>Prazo CD: {record.prazoCd} dia(s)</p>
                </div>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (record) => <StatusBadge active={record.ativo} />,
            },
            {
              key: 'acoes',
              header: 'Ações',
              className: 'min-w-[240px]',
              render: (record) => (
                <div className="flex flex-wrap gap-2">
                  <ActionButton href={`/transportadoras/${record.id}/edit`} variant="secondary">
                    Editar
                  </ActionButton>
                  <ActionButton onClick={() => toggleStatus(record)} variant="subtle">
                    {record.ativo ? 'Inativar' : 'Ativar'}
                  </ActionButton>
                  <ActionButton onClick={() => removeRecord(record)} variant="danger">
                    Excluir
                  </ActionButton>
                </div>
              ),
            },
          ]}
          data={transportadoras}
          emptyDescription="Ajuste os filtros ou crie o primeiro cadastro operacional para começar."
          emptyTitle="Nenhuma transportadora encontrada."
          loading={isLoading}
          loadingLabel="Carregando transportadoras..."
        />
      </SectionCard>
    </section>
  );
}
