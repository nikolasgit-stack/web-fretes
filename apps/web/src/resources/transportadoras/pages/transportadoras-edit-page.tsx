'use client';

import { useState } from 'react';
import { HttpError, useOne, useUpdate } from '@refinedev/core';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../components/ui/page-header';
import { Transportadora, TransportadoraPayload } from '../types';
import { TransportadorasForm } from './transportadoras-form';

interface TransportadorasEditPageProps {
  id: string;
}

export function TransportadorasEditPage({
  id,
}: TransportadorasEditPageProps): React.JSX.Element {
  const router = useRouter();
  const { data, isLoading } = useOne<Transportadora>({
    resource: 'transportadoras',
    id,
  });
  const { mutateAsync, isPending } = useUpdate<Transportadora, HttpError>();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function handleSubmit(payload: TransportadoraPayload): Promise<void> {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await mutateAsync({
        resource: 'transportadoras',
        id,
        values: payload,
      });
      setSuccessMessage('Transportadora atualizada com sucesso.');
      router.push('/transportadoras');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel atualizar a transportadora.',
      );
    }
  }

  const record = data?.data;

  return (
    <section className="content-stack">
      <PageHeader
        title="Editar transportadora"
        description="Atualize os dados administrativos e operacionais da transportadora."
      />

      <section className="panel form-panel">
        {isLoading || !record ? (
          <div className="state-card">
            <strong>Carregando transportadora...</strong>
          </div>
        ) : (
          <TransportadorasForm
            initialValues={record}
            submitLabel="Salvar alteracoes"
            isPending={isPending}
            errorMessage={errorMessage}
            successMessage={successMessage}
            onSubmit={handleSubmit}
          />
        )}
      </section>
    </section>
  );
}
