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
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-[var(--wf-border)] bg-[var(--wf-surface-alt)] p-5">
            <div className="mb-5">
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-[var(--wf-ink)]">
                Identificação da regra
              </h3>
              <p className="mt-1 text-sm text-[var(--wf-muted)]">
                Nome, tenant, marketplace e prioridade para o motor de decisão.
              </p>
            </div>

            <div className="space-y-4">
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

              <div className="grid gap-4 md:grid-cols-2">
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
            </div>
          </section>

          <section className="rounded-[28px] border border-[var(--wf-border)] bg-white p-5">
            <div className="mb-5">
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-[var(--wf-ink)]">
                Escopo logístico
              </h3>
              <p className="mt-1 text-sm text-[var(--wf-muted)]">
                Escolha os vínculos de operação e os recortes de CEP e peso.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-[var(--wf-border)] bg-white p-5">
            <div className="mb-5">
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-[var(--wf-ink)]">
                Status da regra
              </h3>
              <p className="mt-1 text-sm text-[var(--wf-muted)]">
                Ative a regra para que ela participe das próximas decisões.
              </p>
            </div>

            <label className="flex items-center justify-between rounded-2xl border border-[var(--wf-border)] bg-[var(--wf-surface-alt)] px-4 py-3">
              <span className="text-sm font-medium text-[var(--wf-ink)]">Regra ativa</span>
              <input
                checked={ativo}
                type="checkbox"
                onChange={(event) => setAtivo(event.target.checked)}
              />
            </label>
          </section>

          <section className="rounded-[28px] border border-[var(--wf-border)] bg-white p-5">
            <label className="field">
              <span>Observacao</span>
              <textarea
                value={observacao}
                onChange={(event) => setObservacao(event.target.value)}
              />
            </label>
          </section>
        </div>
      </div>

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
