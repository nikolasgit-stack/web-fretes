export interface User {
  id: string;
  tenantId: string;
  nome: string;
  email: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
  tenant?: {
    id: string;
    nome: string;
    slug: string;
    ativo: boolean;
  };
}

export interface CreateUserPayload {
  tenantId: string;
  nome: string;
  email: string;
  senha: string;
}
