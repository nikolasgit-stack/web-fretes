'use client';

import { useEffect, useMemo, useState } from 'react';
import { useGetIdentity, useList } from '@refinedev/core';
import { ActionButton } from '../../../components/ui/action-button';
import { DataTable } from '../../../components/ui/data-table';
import { DialogPanel } from '../../../components/ui/dialog-panel';
import { MetricCard } from '../../../components/ui/metric-card';
import { PageHeader } from '../../../components/ui/page-header';
import { SectionCard } from '../../../components/ui/section-card';
import { StatusBadge } from '../../../components/ui/status-badge';
import { Transportadora } from '../../transportadoras/types';
import {
  FreightTableListItem,
  FreightTableModelType,
  FreightTablePreviewResponse,
  FreightTableValidationResponse,
} from '../types';

function apiUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = 'Falha ao comunicar com a API.';
    try {
      const body = (await response.json()) as { message?: string | string[] };
      message = Array.isArray(body.message) ? body.message.join(', ') : (body.message ?? message);
    } catch {}
    throw new Error(message);
  }
  return (await response.json()) as T;
}

function modelLabel(value: FreightTableModelType): string {
  return value === 'web_fretes_multi_origens' ? 'Web Fretes Multi Origens' : 'Web Fretes Padrao';
}

function asText(value: unknown): string {
  return value === null || value === undefined || value === '' ? '-' : String(value);
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString('pt-BR');
}

async function listFreightTables(transportadoraId: string, tenantId: string): Promise<FreightTableListItem[]> {
  const query = new URLSearchParams({ tenantId, page: '1', limit: '100' });
  const response = await fetch(`${apiUrl()}/transportadoras/${transportadoraId}/tabelas-frete?${query.toString()}`, { cache: 'no-store' });
  const result = await parseApiResponse<{ data: FreightTableListItem[] }>(response);
  return result.data;
}

async function validateSpreadsheet(params: {
  transportadoraId: string;
  tenantId: string;
  tipoTabela: FreightTableModelType;
  importadoPor?: string;
  arquivo: File;
}): Promise<FreightTableValidationResponse> {
  const formData = new FormData();
  formData.append('tenantId', params.tenantId);
  formData.append('tipoTabela', params.tipoTabela);
  if (params.importadoPor) formData.append('importadoPor', params.importadoPor);
  formData.append('arquivo', params.arquivo);
  const response = await fetch(`${apiUrl()}/transportadoras/${params.transportadoraId}/tabelas-frete/validar`, { method: 'POST', body: formData });
  return parseApiResponse<FreightTableValidationResponse>(response);
}

async function uploadSpreadsheet(params: {
  transportadoraId: string;
  tenantId: string;
  tipoTabela: FreightTableModelType;
  importadoPor?: string;
  arquivo: File;
}): Promise<void> {
  const formData = new FormData();
  formData.append('tenantId', params.tenantId);
  formData.append('tipoTabela', params.tipoTabela);
  if (params.importadoPor) formData.append('importadoPor', params.importadoPor);
  formData.append('arquivo', params.arquivo);
  const response = await fetch(`${apiUrl()}/transportadoras/${params.transportadoraId}/tabelas-frete/upload`, { method: 'POST', body: formData });
  await parseApiResponse<Record<string, unknown>>(response);
}

async function fetchPreview(transportadoraId: string, tableId: string): Promise<FreightTablePreviewResponse> {
  const response = await fetch(`${apiUrl()}/transportadoras/${transportadoraId}/tabelas-frete/${tableId}/preview`, { cache: 'no-store' });
  return parseApiResponse<FreightTablePreviewResponse>(response);
}

async function inactivateTable(transportadoraId: string, tableId: string): Promise<void> {
  const response = await fetch(`${apiUrl()}/transportadoras/${transportadoraId}/tabelas-frete/${tableId}`, { method: 'DELETE' });
  await parseApiResponse<Record<string, unknown>>(response);
}

export function FreightTablesPage(): React.JSX.Element {
  const { data: identity } = useGetIdentity<{ email: string; tenantId: string }>();
  const tenantId = identity?.tenantId ?? '';
  const [selectedTransportadoraId, setSelectedTransportadoraId] = useState('');
  const [items, setItems] = useState<FreightTableListItem[]>([]);
  const [search, setSearch] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [feedback, setFeedback] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<FreightTablePreviewResponse | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [uploadTipoTabela, setUploadTipoTabela] = useState<FreightTableModelType>('web_fretes_padrao');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadObservacao, setUploadObservacao] = useState('');
  const [validationResult, setValidationResult] = useState<FreightTableValidationResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { data: transportadorasData, isLoading: isLoadingTransportadoras } = useList<Transportadora>({
    resource: 'transportadoras',
    pagination: { current: 1, pageSize: 100 },
    filters: [{ field: 'tenantId', operator: 'eq', value: tenantId || undefined }],
  });

  const transportadoras = transportadorasData?.data ?? [];
  const selectedTransportadora = transportadoras.find((item) => item.id === selectedTransportadoraId);

  useEffect(() => {
    if (!selectedTransportadoraId && transportadoras.length > 0) setSelectedTransportadoraId(transportadoras[0].id);
  }, [selectedTransportadoraId, transportadoras]);

  async function loadList(): Promise<void> {
    if (!selectedTransportadoraId || !tenantId) {
      setItems([]);
      return;
    }
    setIsLoadingList(true);
    setErrorMessage('');
    try {
      setItems(await listFreightTables(selectedTransportadoraId, tenantId));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Falha ao listar tabelas.');
    } finally {
      setIsLoadingList(false);
    }
  }

  useEffect(() => {
    void loadList();
  }, [selectedTransportadoraId, tenantId]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const term = search.trim().toLowerCase();
      const matchesSearch =
        term === '' ||
        item.nomeTabela.toLowerCase().includes(term) ||
        (item.nomeArquivoOriginal ?? '').toLowerCase().includes(term);
      const matchesTipo = !tipoFiltro || item.tipoTabela === tipoFiltro;
      const matchesStatus =
        !statusFiltro || (statusFiltro === 'ativo' ? item.ativo : !item.ativo);
      const matchesDate = !dateFilter || new Date(item.criadoEm).toISOString().slice(0, 10) === dateFilter;
      return matchesSearch && matchesTipo && matchesStatus && matchesDate;
    });
  }, [dateFilter, items, search, statusFiltro, tipoFiltro]);

  const metrics = useMemo(() => ({
    total: filteredItems.length,
    ativas: filteredItems.filter((item) => item.ativo).length,
    multi: filteredItems.filter((item) => item.tipoTabela === 'web_fretes_multi_origens').length,
    erros: filteredItems.filter((item) => (item.resumo?.erros ?? 0) > 0).length,
  }), [filteredItems]);

  async function handleValidate(): Promise<void> {
    if (!selectedTransportadoraId || !tenantId || !uploadFile) {
      setErrorMessage('Selecione uma transportadora e um arquivo .xlsx para validar.');
      return;
    }
    setIsValidating(true);
    setErrorMessage('');
    setFeedback('');
    try {
      const result = await validateSpreadsheet({
        transportadoraId: selectedTransportadoraId,
        tenantId,
        tipoTabela: uploadTipoTabela,
        importadoPor: uploadObservacao || identity?.email,
        arquivo: uploadFile,
      });
      setValidationResult(result);
      setFeedback(result.valido ? 'Planilha validada com sucesso. Voce ja pode importar.' : 'A validacao encontrou erros. Revise o preview antes de importar.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Falha ao validar planilha.');
    } finally {
      setIsValidating(false);
    }
  }

  async function handleUpload(): Promise<void> {
    if (!validationResult?.valido || !uploadFile || !selectedTransportadoraId || !tenantId) {
      setErrorMessage('Valide uma planilha sem erros antes de importar.');
      return;
    }
    setIsUploading(true);
    setErrorMessage('');
    try {
      await uploadSpreadsheet({
        transportadoraId: selectedTransportadoraId,
        tenantId,
        tipoTabela: uploadTipoTabela,
        importadoPor: uploadObservacao || identity?.email,
        arquivo: uploadFile,
      });
      setFeedback('Tabela importada com sucesso.');
      setIsUploadOpen(false);
      setValidationResult(null);
      setUploadFile(null);
      setUploadObservacao('');
      await loadList();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Falha ao importar planilha.');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleOpenPreview(item: FreightTableListItem): Promise<void> {
    setPreviewOpen(true);
    setPreviewData(null);
    setIsLoadingPreview(true);
    try {
      setPreviewData(await fetchPreview(item.transportadoraId, item.id));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Falha ao carregar preview.');
    } finally {
      setIsLoadingPreview(false);
    }
  }

  async function handleInactivate(item: FreightTableListItem): Promise<void> {
    if (!window.confirm(`Inativar a tabela ${item.nomeTabela}?`)) return;
    try {
      await inactivateTable(item.transportadoraId, item.id);
      setFeedback('Tabela inativada com sucesso.');
      await loadList();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Falha ao inativar tabela.');
    }
  }

  return (
    <section className="content-stack">
      <PageHeader
        title="Tabelas de Fretes"
        description="Faca upload, valide, filtre e visualize as tabelas Web Fretes Padrao e Web Fretes Multi Origens por transportadora."
        eyebrow="Transportadoras • Arquivos"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard helper="Itens visiveis apos os filtros" label="Total filtrado" value={metrics.total} />
        <MetricCard helper="Tabelas disponiveis para uso futuro" label="Ativas" value={metrics.ativas} />
        <MetricCard helper="Arquivos com multiplas origens" label="Multi origens" value={metrics.multi} />
        <MetricCard helper="Itens com erros de validacao" label="Com erros" tone="highlight" value={metrics.erros} />
      </div>

      <SectionCard
        action={
          <>
            <ActionButton onClick={() => setIsUploadOpen(true)} variant="primary">Upload de planilha</ActionButton>
            <ActionButton onClick={() => void loadList()} variant="secondary">Atualizar lista</ActionButton>
          </>
        }
        description="Escolha a transportadora e opere o fluxo de validacao e importacao."
        eyebrow="Operacao"
        title="Contexto da importacao"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="field">
            <span>Transportadora</span>
            <select value={selectedTransportadoraId} onChange={(event) => setSelectedTransportadoraId(event.target.value)}>
              <option value="">Selecione</option>
              {transportadoras.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
            </select>
            {isLoadingTransportadoras ? <small>Carregando transportadoras...</small> : null}
          </label>
          <div className="rounded-[24px] border border-[var(--wf-border)] bg-[var(--wf-surface-alt)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--wf-muted)]">Tenant atual</p>
            <strong className="mt-2 block text-sm text-[var(--wf-ink)]">{tenantId || 'Nao identificado'}</strong>
          </div>
          <div className="rounded-[24px] border border-[var(--wf-border)] bg-[var(--wf-surface-alt)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--wf-muted)]">Selecionada</p>
            <strong className="mt-2 block text-sm text-[var(--wf-ink)]">{selectedTransportadora?.nome ?? 'Nenhuma transportadora selecionada'}</strong>
          </div>
        </div>
        {feedback ? <p className="status-inline">{feedback}</p> : null}
        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
      </SectionCard>

      <SectionCard
        action={<ActionButton onClick={() => { setSearch(''); setTipoFiltro(''); setStatusFiltro(''); setDateFilter(''); }} variant="secondary">Limpar filtros</ActionButton>}
        description="Localize rapidamente por nome, tipo, status e data de importacao."
        eyebrow="Filtros"
        title="Refinar listagem"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="field">
            <span>Buscar</span>
            <input value={search} placeholder="Nome da tabela ou arquivo" onChange={(event) => setSearch(event.target.value)} />
          </label>
          <label className="field">
            <span>Tipo</span>
            <select value={tipoFiltro} onChange={(event) => setTipoFiltro(event.target.value)}>
              <option value="">Todos</option>
              <option value="web_fretes_padrao">Web Fretes Padrao</option>
              <option value="web_fretes_multi_origens">Web Fretes Multi Origens</option>
            </select>
          </label>
          <label className="field">
            <span>Status da tabela</span>
            <select value={statusFiltro} onChange={(event) => setStatusFiltro(event.target.value)}>
              <option value="">Todos</option>
              <option value="ativo">Ativas</option>
              <option value="inativo">Inativas</option>
            </select>
          </label>
          <label className="field">
            <span>Data da importacao</span>
            <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
          </label>
        </div>
      </SectionCard>

      <SectionCard description="Listagem operacional dos arquivos importados, com resumo e acoes de manutencao." eyebrow="Listagem" title="Arquivos importados">
        {!selectedTransportadoraId ? (
          <div className="state-card"><strong>Selecione uma transportadora para ver as tabelas.</strong></div>
        ) : (
          <DataTable
            columns={[
              { key: 'arquivo', header: 'Arquivo / tabela', render: (item) => <div><strong className="block text-sm font-semibold text-[var(--wf-ink)]">{item.nomeTabela}</strong><span className="text-sm text-[var(--wf-muted)]">{item.nomeArquivoOriginal ?? 'Arquivo sem nome'}</span></div> },
              { key: 'tipo', header: 'Tipo', render: (item) => modelLabel(item.tipoTabela) },
              { key: 'status', header: 'Status', render: (item) => <div className="space-y-2"><StatusBadge active={item.ativo} activeLabel="Ativa" inactiveLabel="Inativa" /><p className="text-xs text-[var(--wf-muted)]">{item.status ?? 'sem status'}</p></div> },
              { key: 'resumo', header: 'Resumo', render: (item) => <div className="space-y-1 text-sm text-[var(--wf-muted)]"><p>Faixas: {item.resumo?.totalFaixas ?? 0}</p><p>Origens: {item.resumo?.totalOrigens ?? 0}</p><p>Taxas: {item.resumo?.totalTaxas ?? 0}</p></div> },
              { key: 'data', header: 'Importada em', render: (item) => formatDate(item.criadoEm) },
              { key: 'acoes', header: 'Acoes', className: 'min-w-[260px]', render: (item) => <div className="flex flex-wrap gap-2"><ActionButton onClick={() => void handleOpenPreview(item)} variant="secondary">Preview</ActionButton><ActionButton onClick={() => window.open(`${apiUrl()}/transportadoras/${item.transportadoraId}/tabelas-frete/${item.id}/download`, '_blank', 'noopener,noreferrer')} variant="subtle">Download</ActionButton><ActionButton onClick={() => void handleInactivate(item)} variant="danger">Inativar</ActionButton></div> },
            ]}
            data={filteredItems}
            emptyDescription="Valide e importe a primeira planilha de frete para a transportadora selecionada."
            emptyTitle="Nenhuma tabela encontrada."
            loading={isLoadingList}
            loadingLabel="Carregando tabelas..."
          />
        )}
      </SectionCard>

      {isUploadOpen ? (
        <DialogPanel title="Upload de tabela de frete" description="Valide a planilha antes da importacao definitiva." onClose={() => { setIsUploadOpen(false); setValidationResult(null); setUploadFile(null); }}>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="space-y-4">
              <label className="field">
                <span>Transportadora</span>
                <select value={selectedTransportadoraId} onChange={(event) => setSelectedTransportadoraId(event.target.value)}>
                  <option value="">Selecione</option>
                  {transportadoras.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Tipo da tabela</span>
                <select value={uploadTipoTabela} onChange={(event) => setUploadTipoTabela(event.target.value as FreightTableModelType)}>
                  <option value="web_fretes_padrao">Web Fretes Padrao</option>
                  <option value="web_fretes_multi_origens">Web Fretes Multi Origens</option>
                </select>
              </label>
              <label className="field">
                <span>Arquivo .xlsx</span>
                <input accept=".xlsx" type="file" onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)} />
              </label>
              <label className="field">
                <span>Observacao opcional</span>
                <textarea value={uploadObservacao} onChange={(event) => setUploadObservacao(event.target.value)} placeholder="Ex.: tabela abril 2026 revisada" />
              </label>
              <div className="form-actions">
                <ActionButton onClick={() => void handleValidate()} variant="secondary">{isValidating ? 'Validando...' : 'Validar planilha'}</ActionButton>
                <ActionButton onClick={() => void handleUpload()} variant="primary">{isUploading ? 'Importando...' : 'Importar tabela'}</ActionButton>
              </div>
            </div>

            <div className="space-y-4">
              {!validationResult ? (
                <div className="state-card"><strong>Valide a planilha para ver o preview da importacao.</strong></div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <MetricCard label="Modelo detectado" value={modelLabel(validationResult.detectedModel)} />
                    <MetricCard label="Linhas validas" tone={validationResult.valido ? 'highlight' : 'default'} value={validationResult.resumo.linhasValidas} />
                    <MetricCard label="Linhas invalidas" value={validationResult.resumo.linhasInvalidas} />
                    <MetricCard label="Taxas detectadas" value={validationResult.resumo.totalTaxas} />
                  </div>
                  <section className="rounded-[24px] border border-[var(--wf-border)] bg-[var(--wf-surface-alt)] p-4">
                    <h4 className="text-base font-semibold text-[var(--wf-ink)]">Resumo da validacao</h4>
                    <div className="mt-3 grid gap-2 text-sm text-[var(--wf-muted)] md:grid-cols-2">
                      <p>Nome da tabela: {validationResult.configuracao.nomeTabela ?? 'Nao identificado'}</p>
                      <p>ICMS: {validationResult.configuracao.icmsCalculado ?? 'Nao identificado'}</p>
                      <p>Faixas: {validationResult.resumo.totalFaixas}</p>
                      <p>Origens: {validationResult.resumo.totalOrigens}</p>
                    </div>
                  </section>
                  <section className="rounded-[24px] border border-[var(--wf-border)] bg-white p-4">
                    <h4 className="text-base font-semibold text-[var(--wf-ink)]">Erros e avisos</h4>
                    <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
                      {validationResult.issues.length === 0 ? (
                        <p className="text-sm text-[var(--wf-muted)]">Nenhum erro encontrado.</p>
                      ) : (
                        validationResult.issues.map((issue, index) => (
                          <div key={`${issue.code}-${index}`} className="rounded-2xl border border-[var(--wf-border)] bg-[var(--wf-surface-alt)] px-4 py-3">
                            <p className="text-sm font-semibold text-[var(--wf-ink)]">{issue.message}</p>
                            <p className="mt-1 text-xs text-[var(--wf-muted)]">{issue.severity} • {issue.sheet ?? 'planilha'}{issue.row ? ` • linha ${issue.row}` : ''}{issue.column ? ` • coluna ${issue.column}` : ''}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>
        </DialogPanel>
      ) : null}

      {previewOpen ? (
        <DialogPanel title="Preview da tabela importada" description="Resumo persistido da importacao estruturada da tabela." onClose={() => { setPreviewOpen(false); setPreviewData(null); }}>
          {isLoadingPreview || !previewData ? (
            <div className="state-card"><strong>Carregando preview...</strong></div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard label="Tabela" value={previewData.table.nomeTabela} />
                <MetricCard label="Tipo" value={modelLabel(previewData.table.tipoTabela)} />
                <MetricCard label="Status" tone={previewData.table.ativo ? 'highlight' : 'default'} value={previewData.table.ativo ? 'Ativa' : 'Inativa'} />
              </div>

              <div className="grid gap-6 xl:grid-cols-3">
                <section className="rounded-[24px] border border-[var(--wf-border)] bg-white p-4">
                  <h4 className="text-base font-semibold text-[var(--wf-ink)]">Origens</h4>
                  <div className="mt-4 space-y-3">
                    {previewData.preview.origens.length === 0 ? (
                      <p className="text-sm text-[var(--wf-muted)]">Sem origens vinculadas.</p>
                    ) : (
                      previewData.preview.origens.map((origin, index) => (
                        <div key={index} className="rounded-2xl border border-[var(--wf-border)] bg-[var(--wf-surface-alt)] px-4 py-3">
                          <p className="text-sm font-semibold text-[var(--wf-ink)]">{asText((origin as Record<string, unknown>).nomeOrigem ?? (origin as Record<string, unknown>).metodoExternoId)}</p>
                          <p className="mt-1 text-sm text-[var(--wf-muted)]">CEP origem: {asText((origin as Record<string, unknown>).cepOrigemInicial)} ate {asText((origin as Record<string, unknown>).cepOrigemFinal)}</p>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <section className="rounded-[24px] border border-[var(--wf-border)] bg-white p-4 xl:col-span-2">
                  <h4 className="text-base font-semibold text-[var(--wf-ink)]">Faixas, tarifas e taxas</h4>
                  <div className="mt-4 space-y-3">
                    {previewData.preview.faixas.length === 0 ? (
                      <p className="text-sm text-[var(--wf-muted)]">Sem faixas persistidas.</p>
                    ) : (
                      previewData.preview.faixas.map((range, index) => {
                        const item = range as Record<string, unknown>;
                        const weightPrices = Array.isArray(item.weightPrices) ? (item.weightPrices as Array<Record<string, unknown>>) : [];
                        const fees = Array.isArray(item.fees) ? (item.fees as Array<Record<string, unknown>>) : [];
                        const comparisonPrice = (item.comparisonPrice as Record<string, unknown> | null) ?? null;

                        return (
                          <div key={index} className="rounded-2xl border border-[var(--wf-border)] bg-[var(--wf-surface-alt)] p-4">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                              <div className="space-y-1">
                                <p className="text-sm font-semibold text-[var(--wf-ink)]">{asText(item.uf)} {item.cidade ? `• ${asText(item.cidade)}` : ''}</p>
                                <p className="text-sm text-[var(--wf-muted)]">CEP: {asText(item.cepInicial)} ate {asText(item.cepFinal)}</p>
                                <p className="text-sm text-[var(--wf-muted)]">Prazo: {asText(item.prazo)} dia(s)</p>
                              </div>
                              <StatusBadge active={String(item.modoTarifa) === 'peso'} activeLabel="Tarifa por peso" inactiveLabel="Tarifa por comparacao" />
                            </div>

                            {weightPrices.length > 0 ? (
                              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                {weightPrices.map((price, priceIndex) => (
                                  <div key={priceIndex} className="rounded-2xl border border-[var(--wf-border)] bg-white px-4 py-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--wf-muted)]">Faixa de peso</p>
                                    <strong className="mt-2 block text-sm text-[var(--wf-ink)]">{asText(price.pesoFaixa)} kg</strong>
                                    <p className="mt-1 text-sm text-[var(--wf-muted)]">Valor: {asText(price.valor)}</p>
                                  </div>
                                ))}
                              </div>
                            ) : null}

                            {comparisonPrice ? (
                              <div className="mt-4 grid gap-3 md:grid-cols-3">
                                <div className="rounded-2xl border border-[var(--wf-border)] bg-white px-4 py-3"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--wf-muted)]">Valor por kg</p><strong className="mt-2 block text-sm text-[var(--wf-ink)]">{asText(comparisonPrice.valorPorKg)}</strong></div>
                                <div className="rounded-2xl border border-[var(--wf-border)] bg-white px-4 py-3"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--wf-muted)]">Percentual NF</p><strong className="mt-2 block text-sm text-[var(--wf-ink)]">{asText(comparisonPrice.percentualSobreNF)}</strong></div>
                                <div className="rounded-2xl border border-[var(--wf-border)] bg-white px-4 py-3"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--wf-muted)]">Frete minimo</p><strong className="mt-2 block text-sm text-[var(--wf-ink)]">{asText(comparisonPrice.freteMinimo)}</strong></div>
                              </div>
                            ) : null}

                            <div className="mt-4">
                              <h5 className="text-sm font-semibold text-[var(--wf-ink)]">Taxas</h5>
                              {fees.length === 0 ? (
                                <p className="mt-2 text-sm text-[var(--wf-muted)]">Sem taxas vinculadas a esta faixa.</p>
                              ) : (
                                <div className="mt-3 grid gap-3 md:grid-cols-2">
                                  {fees.map((fee, feeIndex) => (
                                    <div key={feeIndex} className="rounded-2xl border border-[var(--wf-border)] bg-white px-4 py-3">
                                      <p className="text-sm font-semibold text-[var(--wf-ink)]">{asText(fee.tipoTaxa)}</p>
                                      <p className="mt-1 text-sm text-[var(--wf-muted)]">Fixo: {asText(fee.valorFixo)} • Percentual: {asText(fee.percentual)}</p>
                                      <p className="mt-1 text-xs text-[var(--wf-muted)]">Min: {asText(fee.minimo)} • Max: {asText(fee.maximo)}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>
              </div>
            </div>
          )}
        </DialogPanel>
      ) : null}
    </section>
  );
}
