'use client';

import { useState } from 'react';
import { HttpError, useCreate } from '@refinedev/core';
import { useRouter } from 'next/navigation';
import { ActionButton } from '../../../components/ui/action-button';
import { FormShell } from '../../../components/ui/form-shell';
import { PageHeader } from '../../../components/ui/page-header';
import { Transportadora, TransportadoraPayload } from '../types';
import { TransportadorasForm } from './transportadoras-form';

export function TransportadorasCreatePage(): React.JSX.Element {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreate<
    Transportadora,
    HttpError,
    TransportadoraPayload
  >();
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(payload: TransportadoraPayload): Promise<void> {
    setErrorMessage('');

    try {
      await mutateAsync({
        resource: 'transportadoras',
        values: payload,
      });

      router.push('/transportadoras');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel criar a transportadora.',
      );
    }
  }

  return (
    <section className="content-stack">
      <PageHeader
        title="Nova transportadora"
        description="Cadastre uma nova transportadora para operacao de cotacao e manutencao administrativa."
        actionLabel="Voltar para lista"
        actionHref="/transportadoras"
        eyebrow="Cadastros logísticos"
      />

      <FormShell
        description="Preencha os dados cadastrais, parâmetros operacionais e flags da integração."
        metrics={[
          {
            label: 'Escopo',
            value: 'Operação',
            helper: 'Cadastro para cotações e regras',
          },
          {
            label: 'Tipo',
            value: 'Transportadora',
            helper: 'Parceiro logístico do tenant',
          },
          {
            label: 'Status inicial',
            value: 'Ativo',
            helper: 'Pode ser alterado no formulário',
            tone: 'highlight',
          },
        ]}
        title="Configuração da transportadora"
      >
        <TransportadorasForm
          submitLabel="Criar transportadora"
          isPending={isPending}
          errorMessage={errorMessage}
          onSubmit={handleSubmit}
        />
      </FormShell>
    </section>
  );
}
