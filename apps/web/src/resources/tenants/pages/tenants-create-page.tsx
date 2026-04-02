'use client';

import { FormEvent, useState } from 'react';
import { HttpError, useCreate } from '@refinedev/core';
import { useRouter } from 'next/navigation';
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
      />

      <section className="panel form-panel">
        <form className="form-grid" onSubmit={handleSubmit}>
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

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          <div className="form-actions">
            <button className="primary-button" disabled={isPending} type="submit">
              {isPending ? 'Salvando...' : 'Criar tenant'}
            </button>
          </div>
        </form>
      </section>
    </section>
  );
}
