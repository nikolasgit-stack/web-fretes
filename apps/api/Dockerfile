FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json

RUN npm ci

COPY apps/api ./apps/api

RUN npm run build --workspace @sdf/api

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json

RUN npm ci --omit=dev --workspace @sdf/api

COPY --from=builder /app/apps/api/dist ./apps/api/dist

EXPOSE 8080

CMD ["npm", "run", "start:prod", "--workspace", "@sdf/api"]
