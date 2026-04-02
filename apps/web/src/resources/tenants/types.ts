export interface Tenant {
  id: string;
  nome: string;
  slug: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CreateTenantPayload {
  nome: string;
  slug: string;
}
