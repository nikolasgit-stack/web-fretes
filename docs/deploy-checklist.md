# Deploy Checklist

## 1. Banco

- criar instancia PostgreSQL no Cloud SQL
- criar banco `shopping_fretes`
- criar usuario de aplicacao
- liberar conectividade para Cloud Run
- preservar o nome atual do banco e da estrutura fisica do PostgreSQL durante a transicao de branding para Web Fretes

## 2. Backend

- preencher `apps/api/.env.production.example` como referencia de secrets
- buildar a imagem com `apps/api/cloudbuild.yaml`
- publicar imagem no Artifact Registry com o identificador `web-fretes-api`
- criar servico `web-fretes-api` no Cloud Run
- configurar variaveis:
  - `NODE_ENV`
  - `PORT`
  - `API_PREFIX`
  - `DATABASE_HOST`
  - `DATABASE_PORT`
  - `DATABASE_NAME`
  - `DATABASE_USER`
  - `DATABASE_PASSWORD`
  - `DATABASE_SSL`
  - `GCS_BUCKET_NAME`
- executar migrations:

```bash
npm run migration:run --workspace @sdf/api
```

## 3. Frontend

- criar projeto `web-fretes-web` no Vercel apontando para `apps/web`
- configurar `NEXT_PUBLIC_API_URL`
- validar build e publicacao

## 4. Smoke Test

- `GET /api/health`
- `POST /api/tenants`
- `POST /api/users`
- `POST /api/transportadoras`
- `POST /api/centros-distribuicao`
- `POST /api/tabelas-frete`
- `POST /api/cotacoes/simular`

## 5. Classificacao

- usar como beta interno
- nao abrir para clientes externos antes de autenticacao real, observabilidade e hardening operacional
