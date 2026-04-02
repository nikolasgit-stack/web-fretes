'use client';

import Link from 'next/link';
import { useState } from 'react';
import { HttpError, useDelete, useList, useUpdate } from '@refinedev/core';
import { PageHeader } from '../../../components/ui/page-header';
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
        description="Mantenha as regras que determinam elegibilidade e prioridade no motor de cotacao."
        actionLabel="Nova regra"
        actionHref="/regras-frete/create"
      />

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total</span>
          <strong>{data?.total ?? 0}</strong>
        </div>
        <div className="stat-card">
          <span>Ativas</span>
          <strong>{regras.filter((item) => item.ativo).length}</strong>
        </div>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h3>Filtros</h3>
          <span>{isFetching ? 'Atualizando...' : 'Sincronizado com a API'}</span>
        </div>

        <div className="filter-grid">
          <label className="field">
            <span>Marketplace</span>
            <input value={marketplace} onChange={(event) => setMarketplace(event.target.value)} />
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
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Lista de regras</h3>
          <span>{regras.length} registro(s)</span>
        </div>

        {isLoading ? (
          <div className="state-card">
            <strong>Carregando regras...</strong>
          </div>
        ) : regras.length === 0 ? (
          <div className="state-card">
            <strong>Nenhuma regra cadastrada.</strong>
            <span>Crie a primeira regra operacional do tenant.</span>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Marketplace</th>
                  <th>Transportadora</th>
                  <th>Centro</th>
                  <th>Prioridade</th>
                  <th>Status</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {regras.map((record) => (
                  <tr key={record.id}>
                    <td>{record.nome}</td>
                    <td>{record.marketplace ?? '-'}</td>
                    <td>{record.transportadora?.nome ?? record.transportadoraId ?? '-'}</td>
                    <td>{record.centroDistribuicao?.nome ?? record.centroDistribuicaoId ?? '-'}</td>
                    <td>{record.prioridade}</td>
                    <td>
                      <span className={record.ativo ? 'badge badge-success' : 'badge'}>
                        {record.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link href={`/regras-frete/${record.id}/edit`}>Editar</Link>
                        <button type="button" onClick={() => toggleStatus(record)}>
                          {record.ativo ? 'Inativar' : 'Ativar'}
                        </button>
                        <button type="button" onClick={() => removeRecord(record)}>
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
