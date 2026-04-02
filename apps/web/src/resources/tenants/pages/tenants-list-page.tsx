'use client';

import { useList } from '@refinedev/core';
import { PageHeader } from '../../../components/ui/page-header';
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
        description="Gerencie as empresas clientes da plataforma SaaS."
        actionLabel="Novo tenant"
        actionHref="/tenants/create"
      />

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total</span>
          <strong>{data?.total ?? 0}</strong>
        </div>
        <div className="stat-card">
          <span>Ativos</span>
          <strong>{tenants.filter((tenant) => tenant.ativo).length}</strong>
        </div>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h3>Lista de tenants</h3>
          <span>{isFetching ? 'Atualizando...' : 'Sincronizado com a API'}</span>
        </div>

        {isLoading ? (
          <div className="state-card">
            <strong>Carregando tenants...</strong>
          </div>
        ) : tenants.length === 0 ? (
          <div className="state-card">
            <strong>Nenhum tenant cadastrado.</strong>
            <span>Comece criando o primeiro tenant administrativo.</span>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Criado em</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.id}>
                    <td>{tenant.nome}</td>
                    <td>{tenant.slug}</td>
                    <td>
                      <span className={tenant.ativo ? 'badge badge-success' : 'badge'}>
                        {tenant.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>{new Date(tenant.criadoEm).toLocaleString('pt-BR')}</td>
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
