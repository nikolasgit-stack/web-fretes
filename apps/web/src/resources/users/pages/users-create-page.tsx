'use client';

import { FormEvent, useState } from 'react';
import { HttpError, useCreate, useList } from '@refinedev/core';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../components/ui/page-header';
import { Tenant } from '../../tenants/types';
import { CreateUserPayload, User } from '../types';

export function UsersCreatePage(): React.JSX.Element {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreate<User, HttpError, CreateUserPayload>();
  const { data, isLoading } = useList<Tenant>({
    resource: 'tenants',
    pagination: {
      current: 1,
      pageSize: 100,
    },
  });

  const tenants = data?.data ?? [];
  const [tenantId, setTenantId] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErrorMessage('');

    try {
      await mutateAsync({
        resource: 'users',
        values: {
          tenantId,
          nome,
          email,
          senha,
        },
      });

      router.push('/users');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Nao foi possivel criar o user.',
      );
    }
  }

  return (
    <section className="content-stack">
      <PageHeader
        title="Novo user"
        description="Cadastre um usuario administrativo e vincule-o a um tenant."
      />

      <section className="panel form-panel">
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field">
            <span>Tenant</span>
            <select
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
            >
              <option value="">Selecione um tenant</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.nome}
                </option>
              ))}
            </select>
            {isLoading ? <small>Carregando tenants...</small> : null}
          </label>

          <label className="field">
            <span>Nome</span>
            <input
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Administrador"
            />
          </label>

          <label className="field">
            <span>E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@empresa.com"
            />
          </label>

          <label className="field">
            <span>Senha</span>
            <input
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Senha inicial"
            />
          </label>

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          <div className="form-actions">
            <button className="primary-button" disabled={isPending} type="submit">
              {isPending ? 'Salvando...' : 'Criar user'}
            </button>
          </div>
        </form>
      </section>
    </section>
  );
}
