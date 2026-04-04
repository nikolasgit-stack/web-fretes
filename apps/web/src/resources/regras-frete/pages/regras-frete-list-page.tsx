'use client';

import { useState } from 'react';
import { HttpError, useDelete, useList, useUpdate } from '@refinedev/core';
import { ActionButton } from '../../../components/ui/action-button';
import { DataTable } from '../../../components/ui/data-table';
import { MetricCard } from '../../../components/ui/metric-card';
import { PageHeader } from '../../../components/ui/page-header';
import { SectionCard } from '../../../components/ui/section-card';
import { StatusBadge } from '../../../components/ui/status-badge';
import { RegraFrete } from '../types';

export function RegrasFreteListPage(): React.JSX.Element {
  const [marketplace, setMarketplace] = useState('');
  const [ufDestino, setUfDestino] = useState('');
  const [ativo, setAtivo] = useState('');
  const [feedback, setFeedback] = useState('');
  const { mutateAsync: updateRegra } = useUpdate<RegraFrete, HttpError>();
  const { mutateAsync: deleteRegra } = useDelete<RegraFrete, HttpError>();

  const { data, isLoading, isFetching, refetch } = useList<RegraFrete>({
    resource: 'regras-frete',
    pagination: { current: 1, pageSize: 100 },
    filters: [
      { field: 'marketplace', operator: 'contains', value: marketplace || undefined },
      { field: 'ufDestino', operator: 'eq', value: ufDestino || undefined },
      { field: 'ativo', operator: 'eq', value: ativo || undefined },
    ],
  });

  const regras = data?.data ?? [];

  async function toggleStatus(record: RegraFrete): Promise<void> {
    try {
      await updateRegra({
        resource: 'regras-frete',
        id: record.id,
        values: { ativo: !record.ativo },
      });
      setFeedback(record.ativo ? 'Regra inativada com sucesso.' : 'Regra ativada com sucesso.');
      await refetch();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Falha ao atualizar regra.');
    }
  }

  async function removeRecord(record: RegraFrete): Promise<void> {
    if (!window.confirm(`Excluir a regra ${record.nome}?`)) {
      return;
    }

    try {
      await deleteRegra({
        resource: 'regras-frete',
        id: record.id,
      });
      setFeedback('Regra excluida com sucesso.');
      await refetch();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Falha ao excluir regra.');
    }
  }

  return (
    <section className="content-stack">
      <PageHeader
        title="Regras de Frete"
        description="Controle elegibilidade, prioridade e recortes logísticos usados pelo motor de decisão."
        actionLabel="Nova regra"
        actionHref="/regras-frete/create"
        eyebrow="Motor de decisão"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard helper="Regras disponíveis no tenant" label="Total de regras" value={data?.total ?? 0} />
        <MetricCard helper="Regras já consideradas pelo motor" label="Ativas" value={regras.filter((item) => item.ativo).length} />
        <MetricCard helper="Abrangência geográfica parametrizada" label="UFs cobertas" value={new Set(regras.map((item) => item.ufDestino).filter(Boolean)).size} />
        <MetricCard helper="Fluxos com marketplace específico" label="Com marketplace" tone="highlight" value={regras.filter((item) => Boolean(item.marketplace)).length} />
      </div>

      <SectionCard
        action={
          <>
            <ActionButton onClick={() => refetch()} variant="subtle">
              {isFetching ? 'Atualizando...' : 'Atualizar dados'}
            </ActionButton>
            <ActionButton
              onClick={() => {
                setMarketplace('');
                setUfDestino('');
                setAtivo('');
              }}
              variant="secondary"
            >
              Limpar filtros
            </ActionButton>
          </>
        }
        description="Refine a busca por marketplace, UF de destino ou status da regra operacional."
        eyebrow="Operação"
        title="Filtros de consulta"
      >
        <div className="filter-grid">
          <label className="field">
            <span>Marketplace</span>
            <input
              placeholder="Buscar marketplace"
              value={marketplace}
              onChange={(event) => setMarketplace(event.target.value)}
            />
          </label>
          <label className="field">
            <span>UF destino</span>
            <input
              value={ufDestino}
              maxLength={2}
              onChange={(event) => setUfDestino(event.target.value.toUpperCase())}
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
            <span>{regras.length} registro(s)</span>
            <ActionButton href="/regras-frete/create" variant="primary">
              Nova regra
            </ActionButton>
          </div>
        }
        description="Listagem com prioridade, escopo logístico e ações de manutenção do motor de frete."
        eyebrow="Listagem"
        title="Base de regras"
      >
        <DataTable
          columns={[
            {
              key: 'nome',
              header: 'Regra',
              render: (record) => (
                <div>
                  <strong className="block text-sm font-semibold text-[var(--wf-ink)]">
                    {record.nome}
                  </strong>
                  <span className="text-sm text-[var(--wf-muted)]">
                    {record.marketplace ?? 'Marketplace geral'}
                  </span>
                </div>
              ),
            },
            {
              key: 'escopo',
              header: 'Escopo',
              render: (record) => (
                <div className="space-y-1 text-sm text-[var(--wf-muted)]">
                  <p>UF destino: {record.ufDestino ?? 'Todos'}</p>
                  <p>
                    CEP: {record.cepInicial ?? '0'} até {record.cepFinal ?? 'final aberto'}
                  </p>
                </div>
              ),
            },
            {
              key: 'vinculos',
              header: 'Vínculos',
              render: (record) => (
                <div className="space-y-1">
                  <p className="text-sm text-[var(--wf-ink)]">
                    {record.transportadora?.nome ?? record.transportadoraId ?? '-'}
                  </p>
                  <p className="text-sm text-[var(--wf-muted)]">
                    {record.centroDistribuicao?.nome ?? record.centroDistribuicaoId ?? '-'}
                  </p>
                </div>
              ),
            },
            {
              key: 'prioridade',
              header: 'Prioridade',
              render: (record) => (
                <span className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-2xl bg-[var(--wf-surface-alt)] px-3 text-sm font-semibold text-[var(--wf-ink)]">
                  {record.prioridade}
                </span>
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
                  <ActionButton href={`/regras-frete/${record.id}/edit`} variant="secondary">
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
          data={regras}
          emptyDescription="Crie a primeira regra operacional para alimentar o motor de cotação."
          emptyTitle="Nenhuma regra cadastrada."
          loading={isLoading}
          loadingLabel="Carregando regras de frete..."
        />
      </SectionCard>
    </section>
  );
}
