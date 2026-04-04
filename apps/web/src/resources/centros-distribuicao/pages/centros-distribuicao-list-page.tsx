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
import { CentroDistribuicao } from '../types';

export function CentrosDistribuicaoListPage(): React.JSX.Element {
  const [tenantId, setTenantId] = useState('');
  const [nome, setNome] = useState('');
  const [ativo, setAtivo] = useState('');
  const [feedback, setFeedback] = useState('');
  const { mutateAsync: updateCentro } = useUpdate<CentroDistribuicao, HttpError>();
  const { mutateAsync: deleteCentro } = useDelete<CentroDistribuicao, HttpError>();
  const { data: tenantsData } = useList<Tenant>({
    resource: 'tenants',
    pagination: { current: 1, pageSize: 100 },
  });
  const { data, isLoading, isFetching, refetch } = useList<CentroDistribuicao>({
    resource: 'centros-distribuicao',
    pagination: { current: 1, pageSize: 100 },
    filters: [
      { field: 'tenantId', operator: 'eq', value: tenantId || undefined },
      { field: 'nome', operator: 'contains', value: nome || undefined },
      { field: 'ativo', operator: 'eq', value: ativo || undefined },
    ],
  });

  const centros = data?.data ?? [];
  const tenants = tenantsData?.data ?? [];
  const tenantNameById = Object.fromEntries(tenants.map((tenant) => [tenant.id, tenant.nome]));

  async function toggleStatus(record: CentroDistribuicao): Promise<void> {
    try {
      await updateCentro({
        resource: 'centros-distribuicao',
        id: record.id,
        values: { ativo: !record.ativo },
      });
      setFeedback(
        record.ativo
          ? 'Centro de distribuicao inativado com sucesso.'
          : 'Centro de distribuicao ativado com sucesso.',
      );
      await refetch();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Falha ao atualizar status.');
    }
  }

  async function removeRecord(record: CentroDistribuicao): Promise<void> {
    if (!window.confirm(`Excluir o centro ${record.nome}?`)) {
      return;
    }

    try {
      await deleteCentro({
        resource: 'centros-distribuicao',
        id: record.id,
      });
      setFeedback('Centro de distribuicao excluido com sucesso.');
      await refetch();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Falha ao excluir centro.');
    }
  }

  return (
    <section className="content-stack">
      <PageHeader
        title="Centros de Distribuicao"
        description="Organize origens logísticas, cobertura regional e disponibilidade operacional dos CDs."
        actionLabel="Novo centro"
        actionHref="/centros-distribuicao/create"
        eyebrow="Malha logística"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard helper="Origens disponíveis no ambiente" label="Total de centros" value={data?.total ?? 0} />
        <MetricCard helper="Unidades liberadas para operação" label="Ativos" value={centros.filter((item) => item.ativo).length} />
        <MetricCard helper="Cobertura interestadual cadastrada" label="Estados atendidos" value={new Set(centros.map((item) => item.estado)).size} />
        <MetricCard helper="Distribuição geográfica da malha" label="Cidades únicas" tone="highlight" value={new Set(centros.map((item) => item.cidade)).size} />
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
        description="Use os filtros para localizar unidades por tenant, nome e disponibilidade."
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
            <span>{centros.length} registro(s)</span>
            <ActionButton href="/centros-distribuicao/create" variant="primary">
              Novo centro
            </ActionButton>
          </div>
        }
        description="Listagem operacional com localização, tenant e disponibilidade do centro de distribuição."
        eyebrow="Listagem"
        title="Base de centros"
      >
        <DataTable
          columns={[
            {
              key: 'nome',
              header: 'Centro',
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
              key: 'localizacao',
              header: 'Localização',
              render: (record) => (
                <div>
                  <strong className="block text-sm font-medium">{record.cidade}</strong>
                  <span className="text-sm text-[var(--wf-muted)]">
                    {record.estado}
                    {record.cep ? ` • CEP ${record.cep}` : ''}
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
              key: 'endereco',
              header: 'Endereço',
              render: (record) => record.endereco || 'Endereço não informado',
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
                  <ActionButton href={`/centros-distribuicao/${record.id}/edit`} variant="secondary">
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
          data={centros}
          emptyDescription="Crie o primeiro centro de distribuição para começar a operar o tenant."
          emptyTitle="Nenhum centro cadastrado."
          loading={isLoading}
          loadingLabel="Carregando centros de distribuição..."
        />
      </SectionCard>
    </section>
  );
}
