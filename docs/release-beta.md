# Release Beta

## Objetivo

Publicar a primeira versao beta interna do Web Fretes com:

- frontend no Vercel
- backend no Cloud Run
- banco PostgreSQL no Cloud SQL

## Backend

### Variaveis obrigatorias

- `NODE_ENV=production`
- `PORT=8080`
- `API_PREFIX=api`
- `DATABASE_HOST`
- `DATABASE_PORT`
- `DATABASE_NAME`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `DATABASE_SSL=true`
- `GCS_BUCKET_NAME`

### Build local

```bash
npm run build --workspace @sdf/api
```

### Migrations

```bash
npm run migration:run --workspace @sdf/api
```

### Container

Dockerfile: `apps/api/Dockerfile`

Sugestao de deploy no Cloud Run:

1. criar instancia PostgreSQL no Cloud SQL
2. configurar usuario, banco e conectividade
3. criar servico `web-fretes-api` no Cloud Run apontando para a imagem da API do Web Fretes
4. configurar as variaveis de ambiente da API
5. executar migration antes de abrir o trafego

## Frontend

### Variavel obrigatoria

- `NEXT_PUBLIC_API_URL=https://sua-api/api`

### Build local

```bash
npm run build --workspace @sdf/web
```

### Deploy no Vercel

1. criar o projeto `web-fretes-web` apontando para a pasta `apps/web`
2. configurar `NEXT_PUBLIC_API_URL`
3. publicar

## Checklist minimo de validacao

1. `GET /api/health`
2. criar tenant
3. criar user
4. criar transportadora
5. criar centro de distribuicao
6. criar tabela de frete
7. executar `POST /api/cotacoes/simular`

## Classificacao desta release

Esta release deve ser tratada como `beta interno` do Web Fretes.

Antes de producao externa, ainda recomendamos:

- autenticacao real com JWT
- migrations incrementais futuras
- observabilidade
- tratamento mais rico de cobertura geografica
- endurecimento das regras do decision engine
