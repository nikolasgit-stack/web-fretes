'use client';

import { useState } from 'react';
import { HttpError, useOne, useUpdate } from '@refinedev/core';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../components/ui/page-header';
import { CentroDistribuicao, CentroDistribuicaoPayload } from '../types';
import { CentrosDistribuicaoForm } from './centros-distribuicao-form';

interface CentrosDistribuicaoEditPageProps {
  id: string;
}

export function CentrosDistribuicaoEditPage({
  id,
}: CentrosDistribuicaoEditPageProps): React.JSX.Element {
  const router = useRouter();
  const { data, isLoading } = useOne<CentroDistribuicao>({
    resource: 'centros-distribuicao',
    id,
  });
  const { mutateAsync, isPending } = useUpdate<CentroDistribuicao, HttpError>();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function handleSubmit(payload: CentroDistribuicaoPayload): Promise<void> {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await mutateAsync({
        resource: 'centros-distribuicao',
        id,
        values: payload,
      });
      setSuccessMessage('Centro atualizado com sucesso.');
      router.push('/centros-distribuicao');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Nao foi possivel atualizar o centro.',
      );
    }
  }

  const record = data?.data;

  return (
    <section className="content-stack">
      <PageHeader
        title="Editar centro de distribuicao"
        description="Atualize os dados administrativos e logistico-operacionais do centro."
      />

      <section className="panel form-panel">
        {isLoading || !record ? (
          <div className="state-card">
            <strong>Carregando centro de distribuicao...</strong>
          </div>
        ) : (
          <CentrosDistribuicaoForm
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
