'use client';

import { FormEvent, useState } from 'react';
import { useList } from '@refinedev/core';
import { CentroDistribuicao } from '../../centros-distribuicao/types';
import { Tenant } from '../../tenants/types';
import { Transportadora } from '../../transportadoras/types';
import { RegraFrete, RegraFretePayload } from '../types';

interface RegrasFreteFormProps {
  initialValues?: Partial<RegraFrete>;
  submitLabel: string;
  isPending: boolean;
  errorMessage: string;
  successMessage?: string;
  onSubmit: (payload: RegraFretePayload) => Promise<void>;
}

function toOptionalNumber(value: string): number | undefined {
  return value.trim() === '' ? undefined : Number(value);
}

export function RegrasFreteForm({
  initialValues,
  submitLabel,
  isPending,
  errorMessage,
  successMessage,
  onSubmit,
}: RegrasFreteFormProps): React.JSX.Element {
  const { data: tenantsData } = useList<Tenant>({
    resource: 'tenants',
    pagination: { current: 1, pageSize: 100 },
  });
  const { data: transportadorasData } = useList<Transportadora>({
    resource: 'transportadoras',
    pagination: { current: 1, pageSize: 200 },
  });
  const { data: centrosData } = useList<CentroDistribuicao>({
    resource: 'centros-distribuicao',
    pagination: { current: 1, pageSize: 200 },
  });

  const [tenantId, setTenantId] = useState(initialValues?.tenantId ?? '');
  const [nome, setNome] = useState(initialValues?.nome ?? '');
  const [marketplace, setMarketplace] = useState(initialValues?.marketplace ?? '');
  const [transportadoraId, setTransportadoraId] = useState(
    initialValues?.transportadoraId ?? '',
  );
  const [centroDistribuicaoId, setCentroDistribuicaoId] = useState(
    initialValues?.centroDistribuicaoId ?? '',
  );
  const [ufDestino, setUfDestino] = useState(initialValues?.ufDestino ?? '');
  const [cepInicial, setCepInicial] = useState(initialValues?.cepInicial ?? '');
  const [cepFinal, setCepFinal] = useState(initialValues?.cepFinal ?? '');
  const [pesoMin, setPesoMin] = useState(initialValues?.pesoMin?.toString() ?? '');
  const [pesoMax, setPesoMax] = useState(initialValues?.pesoMax?.toString() ?? '');
  const [prioridade, setPrioridade] = useState(String(initialValues?.prioridade ?? 0));
  const [observacao, setObservacao] = useState(initialValues?.observacao ?? '');
  const [ativo, setAtivo] = useState(initialValues?.ativo ?? true);

  const transportadoras = (transportadorasData?.data ?? []).filter(
    (record) => !tenantId || record.tenantId === tenantId,
  );
  const centros = (centrosData?.data ?? []).filter(
    (record) => !tenantId || record.tenantId === tenantId,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    await onSubmit({
      tenantId,
      nome,
      marketplace,
      transportadoraId,
      centroDistribuicaoId,
      ufDestino: ufDestino.toUpperCase(),
      cepInicial,
      cepFinal,
      pesoMin: toOptionalNumber(pesoMin),
      pesoMax: toOptionalNumber(pesoMax),
      prioridade: Number(prioridade),
      observacao,
      ativo,
    });
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <label className="field">
        <span>Tenant</span>
        <select value={tenantId} onChange={(event) => setTenantId(event.target.value)}>
          <option value="">Selecione um tenant</option>
          {(tenantsData?.data ?? []).map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.nome}
            </option>
          ))}
        </select>
      </label>

      <div className="filter-grid">
        <label className="field">
          <span>Nome</span>
          <input value={nome} onChange={(event) => setNome(event.target.value)} />
        </label>
        <label className="field">
          <span>Marketplace</span>
          <input
            value={marketplace}
            onChange={(event) => setMarketplace(event.target.value)}
            placeholder="mercado-livre"
          />
        </label>
        <label className="field">
          <span>UF destino</span>
          <input
            value={ufDestino}
            maxLength={2}
            onChange={(event) => setUfDestino(event.target.value.toUpperCase())}
          />
        </label>
        <label className="field">
          <span>Prioridade</span>
          <input
            type="number"
            min="0"
            value={prioridade}
            onChange={(event) => setPrioridade(event.target.value)}
          />
        </label>
      </div>

      <div className="filter-grid">
        <label className="field">
          <span>Transportadora</span>
          <select
            value={transportadoraId}
            onChange={(event) => setTransportadoraId(event.target.value)}
          >
            <option value="">Selecione</option>
            {transportadoras.map((record) => (
              <option key={record.id} value={record.id}>
                {record.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Centro de distribuicao</span>
          <select
            value={centroDistribuicaoId}
            onChange={(event) => setCentroDistribuicaoId(event.target.value)}
          >
            <option value="">Selecione</option>
            {centros.map((record) => (
              <option key={record.id} value={record.id}>
                {record.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>CEP inicial</span>
          <input
            value={cepInicial}
            maxLength={8}
            onChange={(event) => setCepInicial(event.target.value)}
          />
        </label>
        <label className="field">
          <span>CEP final</span>
          <input
            value={cepFinal}
            maxLength={8}
            onChange={(event) => setCepFinal(event.target.value)}
          />
        </label>
      </div>

      <div className="filter-grid">
        <label className="field">
          <span>Peso minimo</span>
          <input
            type="number"
            min="0"
            step="0.0001"
            value={pesoMin}
            onChange={(event) => setPesoMin(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Peso maximo</span>
          <input
            type="number"
            min="0"
            step="0.0001"
            value={pesoMax}
            onChange={(event) => setPesoMax(event.target.value)}
          />
        </label>
      </div>

      <label className="field">
        <span>Observacao</span>
        <textarea value={observacao} onChange={(event) => setObservacao(event.target.value)} />
      </label>

      <label className="field-inline">
        <input
          checked={ativo}
          type="checkbox"
          onChange={(event) => setAtivo(event.target.checked)}
        />
        <span>Regra ativa</span>
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
