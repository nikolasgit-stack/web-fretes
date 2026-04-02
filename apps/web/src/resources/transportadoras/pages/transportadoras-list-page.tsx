'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { HttpError, useDelete, useList, useUpdate } from '@refinedev/core';
import { PageHeader } from '../../../components/ui/page-header';
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
        description="Cadastre e mantenha as transportadoras operacionais que alimentam o motor de cotacao."
        actionLabel="Nova transportadora"
        actionHref="/transportadoras/create"
      />

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total</span>
          <strong>{data?.total ?? 0}</strong>
        </div>
        <div className="stat-card">
          <span>Ativas</span>
          <strong>{transportadoras.filter((item) => item.ativo).length}</strong>
        </div>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h3>Filtros</h3>
          <span>{isFetching ? 'Atualizando...' : 'Sincronizado com a API'}</span>
        </div>

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
            <input value={nome} onChange={(event) => setNome(event.target.value)} />
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
          <h3>Lista de transportadoras</h3>
          <span>{transportadoras.length} registro(s)</span>
        </div>

        {isLoading ? (
          <div className="state-card">
            <strong>Carregando transportadoras...</strong>
          </div>
        ) : transportadoras.length === 0 ? (
          <div className="state-card">
            <strong>Nenhuma transportadora encontrada.</strong>
            <span>Ajuste os filtros ou crie o primeiro cadastro operacional.</span>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Codigo</th>
                  <th>Tenant</th>
                  <th>Tipo</th>
                  <th>Status</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {transportadoras.map((record) => (
                  <tr key={record.id}>
                    <td>{record.nome}</td>
                    <td>{record.codigoInterno}</td>
                    <td>{record.tenantId}</td>
                    <td>{record.modalidade ?? record.tipoIntegracao}</td>
                    <td>
                      <span className={record.ativo ? 'badge badge-success' : 'badge'}>
                        {record.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link href={`/transportadoras/${record.id}/edit`}>Editar</Link>
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
