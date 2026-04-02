'use client';

import { useState } from 'react';
import { HttpError, useCreate } from '@refinedev/core';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../components/ui/page-header';
import { CentroDistribuicao, CentroDistribuicaoPayload } from '../types';
import { CentrosDistribuicaoForm } from './centros-distribuicao-form';

export function CentrosDistribuicaoCreatePage(): React.JSX.Element {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreate<
    CentroDistribuicao,
    HttpError,
    CentroDistribuicaoPayload
  >();
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(payload: CentroDistribuicaoPayload): Promise<void> {
    setErrorMessage('');

    try {
      await mutateAsync({
        resource: 'centros-distribuicao',
        values: payload,
      });
      router.push('/centros-distribuicao');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Nao foi possivel criar o centro.',
      );
    }
  }

  return (
    <section className="content-stack">
      <PageHeader
        title="Novo centro de distribuicao"
        description="Cadastre um novo centro para abastecer tabelas e regras de frete."
      />

      <section className="panel form-panel">
        <CentrosDistribuicaoForm
          submitLabel="Criar centro"
          isPending={isPending}
          errorMessage={errorMessage}
          onSubmit={handleSubmit}
        />
      </section>
    </section>
  );
}
