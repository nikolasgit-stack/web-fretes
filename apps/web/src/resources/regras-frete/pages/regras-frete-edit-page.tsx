'use client';

import { useState } from 'react';
import { HttpError, useOne, useUpdate } from '@refinedev/core';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../components/ui/page-header';
import { RegraFrete, RegraFretePayload } from '../types';
import { RegrasFreteForm } from './regras-frete-form';

interface RegrasFreteEditPageProps {
  id: string;
}

export function RegrasFreteEditPage({
  id,
}: RegrasFreteEditPageProps): React.JSX.Element {
  const router = useRouter();
  const { data, isLoading } = useOne<RegraFrete>({
    resource: 'regras-frete',
    id,
  });
  const { mutateAsync, isPending } = useUpdate<RegraFrete, HttpError>();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function handleSubmit(payload: RegraFretePayload): Promise<void> {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await mutateAsync({
        resource: 'regras-frete',
        id,
        values: payload,
      });
      setSuccessMessage('Regra atualizada com sucesso.');
      router.push('/regras-frete');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Nao foi possivel atualizar a regra.',
      );
    }
  }

  const record = data?.data;

  return (
    <section className="content-stack">
      <PageHeader
        title="Editar regra de frete"
        description="Atualize os parametros operacionais e de prioridade da regra."
      />

      <section className="panel form-panel">
        {isLoading || !record ? (
          <div className="state-card">
            <strong>Carregando regra...</strong>
          </div>
        ) : (
          <RegrasFreteForm
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
