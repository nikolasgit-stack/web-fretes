# Web Fretes

Base inicial do SaaS multi-tenant Web Fretes para cotacao de fretes, construida do zero para substituir gradualmente o legado em C# sem copiar sua estrutura.

## Stack

- Frontend: Next.js, Refine, TypeScript, Vercel
- Backend: NestJS, TypeScript, TypeORM, PostgreSQL, Cloud Run
- Banco: PostgreSQL (Cloud SQL)
- Arquivos: Google Cloud Storage

## Estrutura

```text
apps/
  api/  -> backend NestJS
  web/  -> frontend Next.js + Refine
docs/   -> arquitetura e guias
```

## Primeira fase

- `health`
- `auth`
- `tenants`
- `users`
- `config`
- `common`

## Como evoluir

1. consolidar autenticacao real e estrategia JWT
2. introduzir migracoes TypeORM
3. conectar frontend ao backend
4. iniciar mapeamento das regras do legado por contexto de dominio

## Ambiente local

Cada maquina deve possuir seu proprio `.env`. Nunca versione segredos.

- Backend: copiar `apps/api/.env.example` para `apps/api/.env`
- Frontend: copiar `apps/web/.env.example` para `apps/web/.env.local`
