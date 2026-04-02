# Arquitetura Inicial do Web Fretes

## Principios

- SaaS desde o dia zero
- Multi-tenant por modelagem, nao por improviso
- Regra de negocio centralizada em `services`
- Controllers apenas como camada de entrada/saida
- Separacao clara entre dominio, aplicacao e infraestrutura
- Reaproveitar inteligencia do legado, nao sua estrutura

## Estrategia de multi-tenant

- Toda entidade tenant-scoped deve carregar `tenantId`
- O `tenantId` sera resolvido por contexto de requisicao
- Entidades globais nao recebem `tenantId`
- No banco, indices por `tenantId` devem ser padrao sempre que a consulta for contextual

## Monorepo

- `apps/api`: API NestJS com modulos por contexto
- `apps/web`: portal administrativo em Next.js + Refine
- `docs`: decisoes de arquitetura, plano de migracao do legado e guias operacionais do Web Fretes

## Fase 1

### Backend

- `common`: base entity, contexto de tenant, filtros, utilitarios
- `config`: leitura e validacao de ambiente
- `health`: endpoints de disponibilidade
- `tenants`: cadastro e consulta de tenants
- `users`: usuarios por tenant
- `auth`: autenticacao base

### Frontend

- shell administrativa
- provedor de autenticacao
- pagina inicial
- recursos iniciais para `tenants` e `users`

## Evolucao recomendada

1. Mapear os modulos do legado por dominio de negocio, nao por tela.
2. Extrair formulas e regras para servicos testaveis.
3. Encapsular integracoes externas em adaptadores.
4. Introduzir auditoria e rastreabilidade antes da fase de tracking.
