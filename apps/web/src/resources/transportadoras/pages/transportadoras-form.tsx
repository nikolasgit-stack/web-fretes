'use client';

import { FormEvent, useState } from 'react';
import { useList } from '@refinedev/core';
import { Tenant } from '../../tenants/types';
import {
  TipoIntegracaoTransportadora,
  Transportadora,
  TransportadoraPayload,
} from '../types';

interface TransportadorasFormProps {
  initialValues?: Partial<Transportadora>;
  submitLabel: string;
  isPending: boolean;
  errorMessage: string;
  successMessage?: string;
  onSubmit: (payload: TransportadoraPayload) => Promise<void>;
}

function toOptionalNumber(value: string): number | undefined {
  return value.trim() === '' ? undefined : Number(value);
}

export function TransportadorasForm({
  initialValues,
  submitLabel,
  isPending,
  errorMessage,
  successMessage,
  onSubmit,
}: TransportadorasFormProps): React.JSX.Element {
  const { data, isLoading } = useList<Tenant>({
    resource: 'tenants',
    pagination: {
      current: 1,
      pageSize: 100,
    },
  });
  const tenants = data?.data ?? [];

  const [tenantId, setTenantId] = useState(initialValues?.tenantId ?? '');
  const [nome, setNome] = useState(initialValues?.nome ?? '');
  const [codigoInterno, setCodigoInterno] = useState(initialValues?.codigoInterno ?? '');
  const [modalidade, setModalidade] = useState(initialValues?.modalidade ?? '');
  const [tipoIntegracao, setTipoIntegracao] = useState<TipoIntegracaoTransportadora>(
    initialValues?.tipoIntegracao ?? 'manual',
  );
  const [contato, setContato] = useState(initialValues?.contato ?? '');
  const [observacao, setObservacao] = useState(initialValues?.observacao ?? '');
  const [prazoCd, setPrazoCd] = useState(String(initialValues?.prazoCd ?? 0));
  const [cubagem, setCubagem] = useState(String(initialValues?.cubagem ?? 0));
  const [estadoOrigem, setEstadoOrigem] = useState(initialValues?.estadoOrigem ?? 'SP');
  const [limiteAltura, setLimiteAltura] = useState(
    initialValues?.limiteAltura?.toString() ?? '',
  );
  const [limiteLargura, setLimiteLargura] = useState(
    initialValues?.limiteLargura?.toString() ?? '',
  );
  const [limiteComprimento, setLimiteComprimento] = useState(
    initialValues?.limiteComprimento?.toString() ?? '',
  );
  const [isencaoCubagem, setIsencaoCubagem] = useState(
    initialValues?.isencaoCubagem ?? false,
  );
  const [icmsIncluso, setIcmsIncluso] = useState(initialValues?.icmsIncluso ?? false);
  const [linhaBranca, setLinhaBranca] = useState(initialValues?.linhaBranca ?? false);
  const [ativo, setAtivo] = useState(initialValues?.ativo ?? true);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    await onSubmit({
      tenantId,
      nome,
      codigoInterno,
      modalidade,
      tipoIntegracao,
      contato,
      observacao,
      prazoCd: Number(prazoCd),
      cubagem: Number(cubagem),
      isencaoCubagem,
      icmsIncluso,
      estadoOrigem: estadoOrigem.toUpperCase(),
      linhaBranca,
      limiteAltura: toOptionalNumber(limiteAltura),
      limiteLargura: toOptionalNumber(limiteLargura),
      limiteComprimento: toOptionalNumber(limiteComprimento),
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
          <span>Codigo</span>
          <input
            value={codigoInterno}
            onChange={(event) => setCodigoInterno(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Modalidade</span>
          <input
            value={modalidade}
            onChange={(event) => setModalidade(event.target.value)}
            placeholder="Rodoviario"
          />
        </label>
        <label className="field">
          <span>Tipo de integracao</span>
          <select
            value={tipoIntegracao}
            onChange={(event) =>
              setTipoIntegracao(event.target.value as TipoIntegracaoTransportadora)
            }
          >
            <option value="manual">Manual</option>
            <option value="api">API</option>
            <option value="hub">Hub</option>
          </select>
        </label>
      </div>

      <div className="filter-grid">
        <label className="field">
          <span>Contato</span>
          <input
            value={contato}
            onChange={(event) => setContato(event.target.value)}
            placeholder="operacao@transportadora.com"
          />
        </label>
        <label className="field">
          <span>Prazo no CD</span>
          <input
            type="number"
            min="0"
            value={prazoCd}
            onChange={(event) => setPrazoCd(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Cubagem</span>
          <input
            type="number"
            min="0"
            step="0.0001"
            value={cubagem}
            onChange={(event) => setCubagem(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Estado de origem</span>
          <input
            value={estadoOrigem}
            maxLength={2}
            onChange={(event) => setEstadoOrigem(event.target.value.toUpperCase())}
          />
        </label>
      </div>

      <div className="filter-grid">
        <label className="field">
          <span>Limite de altura</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={limiteAltura}
            onChange={(event) => setLimiteAltura(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Limite de largura</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={limiteLargura}
            onChange={(event) => setLimiteLargura(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Limite de comprimento</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={limiteComprimento}
            onChange={(event) => setLimiteComprimento(event.target.value)}
          />
        </label>
      </div>

      <label className="field">
        <span>Observacao</span>
        <textarea
          value={observacao}
          onChange={(event) => setObservacao(event.target.value)}
          placeholder="Observacoes operacionais da transportadora"
        />
      </label>

      <div className="form-grid">
        <label className="field-inline">
          <input
            checked={isencaoCubagem}
            type="checkbox"
            onChange={(event) => setIsencaoCubagem(event.target.checked)}
          />
          <span>Isencao de cubagem</span>
        </label>
        <label className="field-inline">
          <input
            checked={icmsIncluso}
            type="checkbox"
            onChange={(event) => setIcmsIncluso(event.target.checked)}
          />
          <span>ICMS incluso</span>
        </label>
        <label className="field-inline">
          <input
            checked={linhaBranca}
            type="checkbox"
            onChange={(event) => setLinhaBranca(event.target.checked)}
          />
          <span>Atende linha branca</span>
        </label>
        <label className="field-inline">
          <input
            checked={ativo}
            type="checkbox"
            onChange={(event) => setAtivo(event.target.checked)}
          />
          <span>Transportadora ativa</span>
        </label>
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
