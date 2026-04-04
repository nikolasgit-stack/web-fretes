'use client';

import { FormEvent, useState } from 'react';
import { HttpError, useCreate } from '@refinedev/core';
import { useRouter } from 'next/navigation';
import { FormShell } from '../../../components/ui/form-shell';
import { PageHeader } from '../../../components/ui/page-header';
import { CreateTenantPayload, Tenant } from '../types';

export function TenantsCreatePage(): React.JSX.Element {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreate<
    Tenant,
    HttpError,
    CreateTenantPayload
  >();
  const [nome, setNome] = useState('');
  const [slug, setSlug] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErrorMessage('');

    try {
      await mutateAsync({
        resource: 'tenants',
        values: {
          nome,
          slug,
        },
      });

      router.push('/tenants');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Nao foi possivel criar o tenant.',
      );
    }
  }

  return (
    <section className="content-stack">
      <PageHeader
        title="Novo tenant"
        description="Cadastre uma nova empresa cliente na base administrativa."
        actionLabel="Voltar para lista"
        actionHref="/tenants"
        eyebrow="Base multi-tenant"
      />

      <FormShell
        description="Crie a nova conta da empresa e defina o identificador usado no ambiente."
        metrics={[
          {
            label: 'Escopo',
            value: 'Conta',
            helper: 'Empresa cliente da plataforma',
          },
          {
            label: 'Tipo',
            value: 'Tenant',
            helper: 'Base multi-tenant',
          },
          {
            label: 'Status inicial',
            value: 'Ativo',
            helper: 'Definido pelo backend após criação',
            tone: 'highlight',
          },
        ]}
        title="Configuração do tenant"
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          <section className="rounded-[28px] border border-[var(--wf-border)] bg-[var(--wf-surface-alt)] p-5">
            <div className="mb-5">
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-[var(--wf-ink)]">
                Dados da empresa
              </h3>
              <p className="mt-1 text-sm text-[var(--wf-muted)]">
                Nome exibido e slug único para identificação da conta.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="field">
                <span>Nome</span>
                <input
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  placeholder="Empresa Exemplo"
                />
              </label>

              <label className="field">
                <span>Slug</span>
                <input
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  placeholder="empresa-exemplo"
                />
              </label>
            </div>
          </section>

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          <div className="form-actions">
            <button className="primary-button" disabled={isPending} type="submit">
              {isPending ? 'Salvando...' : 'Criar tenant'}
            </button>
          </div>
        </form>
      </FormShell>
    </section>
  );
}
