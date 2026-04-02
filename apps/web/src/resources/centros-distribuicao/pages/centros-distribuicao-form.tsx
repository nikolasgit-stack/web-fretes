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
    <form className="form-grid" onSubmit={handleSubmit}>
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

      <div className="filter-grid">
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
      </div>

      <div className="filter-grid">
        <label className="field">
          <span>Cidade</span>
          <input value={cidade} onChange={(event) => setCidade(event.target.value)} />
        </label>
      </div>

      <label className="field">
        <span>Endereco</span>
        <textarea value={endereco} onChange={(event) => setEndereco(event.target.value)} />
      </label>

      <label className="field-inline">
        <input
          checked={ativo}
          type="checkbox"
          onChange={(event) => setAtivo(event.target.checked)}
        />
        <span>Centro ativo</span>
      </label>

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
