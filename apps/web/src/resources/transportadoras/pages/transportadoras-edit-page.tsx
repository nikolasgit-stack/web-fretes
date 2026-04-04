'use client';

import { useState } from 'react';
import { HttpError, useOne, useUpdate } from '@refinedev/core';
import { useRouter } from 'next/navigation';
import { FormShell } from '../../../components/ui/form-shell';
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
        actionLabel="Voltar para lista"
        actionHref="/transportadoras"
        eyebrow="Cadastros logísticos"
      />

      {isLoading || !record ? (
        <section className="state-card">
          <strong>Carregando transportadora...</strong>
        </section>
      ) : (
        <FormShell
          description="Revise informações cadastrais, integração e parâmetros usados na operação."
          metrics={[
            {
              label: 'Transportadora',
              value: record.codigoInterno,
              helper: record.nome,
            },
            {
              label: 'Integração',
              value: record.tipoIntegracao.toUpperCase(),
              helper: record.modalidade ?? 'Modalidade não informada',
            },
            {
              label: 'Status atual',
              value: record.ativo ? 'Ativa' : 'Inativa',
              helper: `Origem ${record.estadoOrigem}`,
              tone: record.ativo ? 'highlight' : 'default',
            },
          ]}
          title="Ajustes da transportadora"
        >
          <TransportadorasForm
            initialValues={record}
            submitLabel="Salvar alteracoes"
            isPending={isPending}
            errorMessage={errorMessage}
            successMessage={successMessage}
            onSubmit={handleSubmit}
          />
        </FormShell>
      )}
    </section>
  );
}
