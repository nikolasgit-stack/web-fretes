'use client';

import { FormEvent, useState } from 'react';
import { HttpError, useCreate, useList } from '@refinedev/core';
import { useRouter } from 'next/navigation';
import { FormShell } from '../../../components/ui/form-shell';
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
        title="Novo usuário"
        description="Cadastre um acesso administrativo e vincule-o ao tenant correto."
        actionLabel="Voltar para lista"
        actionHref="/users"
        eyebrow="Acesso e governança"
      />

      <FormShell
        description="Defina tenant, identificação e credenciais iniciais para o novo acesso."
        metrics={[
          {
            label: 'Escopo',
            value: 'Admin',
            helper: 'Acesso operacional da plataforma',
          },
          {
            label: 'Tipo',
            value: 'Usuário',
            helper: 'Conta administrativa',
          },
          {
            label: 'Tenants disponíveis',
            value: tenants.length,
            helper: 'Opções de vínculo atuais',
            tone: 'highlight',
          },
        ]}
        title="Configuração do usuário"
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          <section className="rounded-[28px] border border-[var(--wf-border)] bg-[var(--wf-surface-alt)] p-5">
            <div className="mb-5">
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-[var(--wf-ink)]">
                Dados de acesso
              </h3>
              <p className="mt-1 text-sm text-[var(--wf-muted)]">
                Informações básicas para criação da conta administrativa.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="field md:col-span-2">
                <span>Tenant</span>
                <select value={tenantId} onChange={(event) => setTenantId(event.target.value)}>
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

              <label className="field md:col-span-2">
                <span>Senha</span>
                <input
                  type="password"
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  placeholder="Senha inicial"
                />
              </label>
            </div>
          </section>

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          <div className="form-actions">
            <button className="primary-button" disabled={isPending} type="submit">
              {isPending ? 'Salvando...' : 'Criar usuário'}
            </button>
          </div>
        </form>
      </FormShell>
    </section>
  );
}
