'use client';

import { useList } from '@refinedev/core';
import { PageHeader } from '../../../components/ui/page-header';
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
        title="Users"
        description="Gerencie usuarios administrativos e seus tenants vinculados."
        actionLabel="Novo user"
        actionHref="/users/create"
      />

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total</span>
          <strong>{data?.total ?? 0}</strong>
        </div>
        <div className="stat-card">
          <span>Ativos</span>
          <strong>{users.filter((user) => user.ativo).length}</strong>
        </div>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h3>Lista de users</h3>
          <span>{isFetching ? 'Atualizando...' : 'Sincronizado com a API'}</span>
        </div>

        {isLoading ? (
          <div className="state-card">
            <strong>Carregando users...</strong>
          </div>
        ) : users.length === 0 ? (
          <div className="state-card">
            <strong>Nenhum user cadastrado.</strong>
            <span>Cadastre o primeiro usuario administrativo do tenant.</span>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Tenant</th>
                  <th>Status</th>
                  <th>Criado em</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.nome}</td>
                    <td>{user.email}</td>
                    <td>{user.tenant?.nome ?? user.tenantId}</td>
                    <td>
                      <span className={user.ativo ? 'badge badge-success' : 'badge'}>
                        {user.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>{new Date(user.criadoEm).toLocaleString('pt-BR')}</td>
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
