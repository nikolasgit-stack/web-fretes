'use client';

import { FormEvent, useState } from 'react';
import { useList } from '@refinedev/core';
import { Tenant } from '../../tenants/types';
import {
  CentroDistribuicao,
  CentroDistribuicaoPayload,
} from '../types';

interface CentrosDistribuicaoFormProps {
  initialValues?: Partial<CentroDistribuicao>;
  submitLabel: string;
  isPending: boolean;
  errorMessage: string;
  successMessage?: string;
  onSubmit: (payload: CentroDistribuicaoPayload) => Promise<void>;
}

export function CentrosDistribuicaoForm({
  initialValues,
  submitLabel,
  isPending,
  errorMessage,
  successMessage,
  onSubmit,
}: CentrosDistribuicaoFormProps): React.JSX.Element {
  const { data, isLoading } = useList<Tenant>({
    resource: 'tenants',
    pagination: { current: 1, pageSize: 100 },
  });

  const tenants = data?.data ?? [];
  const [tenantId, setTenantId] = useState(initialValues?.tenantId ?? '');
  const [nome, setNome] = useState(initialValues?.nome ?? '');
  const [codigoInterno, setCodigoInterno] = useState(initialValues?.codigoInterno ?? '');
  const [cep, setCep] = useState(initialValues?.cep ?? '');
  const [cidade, setCidade] = useState(initialValues?.cidade ?? '');
  const [estado, setEstado] = useState(initialValues?.estado ?? 'SP');
  const [endereco, setEndereco] = useState(initialValues?.endereco ?? '');
  const [ativo, setAtivo] = useState(initialValues?.ativo ?? true);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await onSubmit({
      tenantId,
      nome,
      codigoInterno,
      cep,
      cidade,
      estado: estado.toUpperCase(),
      endereco,
      ativo,
    });
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <section className="rounded-[28px] border border-[var(--wf-border)] bg-[var(--wf-surface-alt)] p-5">
          <div className="mb-5">
            <h3 className="text-lg font-semibold tracking-[-0.03em] text-[var(--wf-ink)]">
              Identificação do centro
            </h3>
            <p className="mt-1 text-sm text-[var(--wf-muted)]">
              Defina tenant, nome e código usados nas regras de frete e operações.
            </p>
          </div>

          <div className="space-y-4">
            <label className="field">
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

            <div className="grid gap-4 md:grid-cols-2">
              <label className="field">
                <span>Nome</span>
                <input value={nome} onChange={(event) => setNome(event.target.value)} />
              </label>
              <label className="field">
                <span>Codigo interno</span>
                <input
                  value={codigoInterno}
                  onChange={(event) => setCodigoInterno(event.target.value)}
                />
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--wf-border)] bg-white p-5">
          <div className="mb-5">
            <h3 className="text-lg font-semibold tracking-[-0.03em] text-[var(--wf-ink)]">
              Status operacional
            </h3>
            <p className="mt-1 text-sm text-[var(--wf-muted)]">
              Defina se o centro pode participar da operação atual.
            </p>
          </div>

          <label className="flex items-center justify-between rounded-2xl border border-[var(--wf-border)] bg-[var(--wf-surface-alt)] px-4 py-3">
            <span className="text-sm font-medium text-[var(--wf-ink)]">Centro ativo</span>
            <input
              checked={ativo}
              type="checkbox"
              onChange={(event) => setAtivo(event.target.checked)}
            />
          </label>
        </section>
      </div>

      <section className="rounded-[28px] border border-[var(--wf-border)] bg-white p-5">
        <div className="mb-5">
          <h3 className="text-lg font-semibold tracking-[-0.03em] text-[var(--wf-ink)]">
            Localização e endereço
          </h3>
          <p className="mt-1 text-sm text-[var(--wf-muted)]">
            Informações geográficas para cobertura, malha e identificação da origem.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="field">
            <span>CEP</span>
            <input value={cep} onChange={(event) => setCep(event.target.value)} maxLength={8} />
          </label>
          <label className="field">
            <span>Estado</span>
            <input
              value={estado}
              maxLength={2}
              onChange={(event) => setEstado(event.target.value.toUpperCase())}
            />
          </label>
          <label className="field xl:col-span-2">
            <span>Cidade</span>
            <input value={cidade} onChange={(event) => setCidade(event.target.value)} />
          </label>
          <label className="field md:col-span-2 xl:col-span-4">
            <span>Endereco</span>
            <textarea value={endereco} onChange={(event) => setEndereco(event.target.value)} />
          </label>
        </div>
      </section>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
      {successMessage ? <p className="status-inline">{successMessage}</p> : null}

      <div className="form-actions">
        <button className="primary-button" disabled={isPending} type="submit">
          {isPending ? 'Salvando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
