'use client';

import { useState } from 'react';
import { HttpError, useCreate } from '@refinedev/core';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../components/ui/page-header';
import { RegraFrete, RegraFretePayload } from '../types';
import { RegrasFreteForm } from './regras-frete-form';

export function RegrasFreteCreatePage(): React.JSX.Element {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreate<
    RegraFrete,
    HttpError,
    RegraFretePayload
  >();
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(payload: RegraFretePayload): Promise<void> {
    setErrorMessage('');

    try {
      await mutateAsync({
        resource: 'regras-frete',
        values: payload,
      });
      router.push('/regras-frete');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Nao foi possivel criar a regra.',
      );
    }
  }

  return (
    <section className="content-stack">
      <PageHeader
        title="Nova regra de frete"
        description="Cadastre uma regra de negocio para orientar a escolha de opcoes de frete."
      />

      <section className="panel form-panel">
        <RegrasFreteForm
          submitLabel="Criar regra"
          isPending={isPending}
          errorMessage={errorMessage}
          onSubmit={handleSubmit}
        />
      </section>
    </section>
  );
}
