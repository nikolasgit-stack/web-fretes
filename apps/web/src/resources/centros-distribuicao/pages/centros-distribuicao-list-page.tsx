'use client';

import Link from 'next/link';
import { useState } from 'react';
import { HttpError, useDelete, useList, useUpdate } from '@refinedev/core';
import { PageHeader } from '../../../components/ui/page-header';
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
        description="Mantenha os centros de distribuicao que participam da operacao de frete."
        actionLabel="Novo centro"
        actionHref="/centros-distribuicao/create"
      />

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total</span>
          <strong>{data?.total ?? 0}</strong>
        </div>
        <div className="stat-card">
          <span>Ativos</span>
          <strong>{centros.filter((item) => item.ativo).length}</strong>
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
          <h3>Lista de centros</h3>
          <span>{centros.length} registro(s)</span>
        </div>

        {isLoading ? (
          <div className="state-card">
            <strong>Carregando centros de distribuicao...</strong>
          </div>
        ) : centros.length === 0 ? (
          <div className="state-card">
            <strong>Nenhum centro cadastrado.</strong>
            <span>Crie o primeiro centro de distribuicao para o tenant.</span>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Codigo</th>
                  <th>Cidade</th>
                  <th>Estado</th>
                  <th>Status</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {centros.map((record) => (
                  <tr key={record.id}>
                    <td>{record.nome}</td>
                    <td>{record.codigoInterno}</td>
                    <td>{record.cidade}</td>
                    <td>{record.estado}</td>
                    <td>
                      <span className={record.ativo ? 'badge badge-success' : 'badge'}>
                        {record.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link href={`/centros-distribuicao/${record.id}/edit`}>Editar</Link>
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
