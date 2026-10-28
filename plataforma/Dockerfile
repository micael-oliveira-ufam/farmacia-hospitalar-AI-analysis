# syntax=docker/dockerfile:1
# Imagem única: página inicial (/), guia de doses (/guia/) e app de estoque ABC (/estoque/).

# 1) App ABC (React/Vite)
FROM node:22-alpine AS abc
WORKDIR /abc
COPY abc-app/package.json abc-app/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY abc-app/ ./
COPY data/catalog.json data/codajas.json public/data/
RUN npm test && npx vite build --base=/estoque/

# 2) Guia de doses (arquivo HTML único gerado a partir de data/catalog.json)
FROM python:3.12-alpine AS guia
WORKDIR /suite
COPY data/ data/
COPY guia/ guia/
RUN apk add --no-cache nodejs \
 && node guia/test.js \
 && node guia/triagem.test.js \
 && python3 guia/build.py /out

# 3) Servidor
FROM node:22-alpine AS runtime
ENV NODE_ENV=production PORT=8080 PUBLIC_DIR=/app/public DATA_DIR=/app/data
WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY server/server.js server/db.js server/auth.js server/billing.js ./
COPY server/landing ./public/landing
COPY --from=abc /abc/dist ./public/abc
COPY --from=guia /out/index.html /out/manifest.json /out/sw.js /out/icon.svg ./public/guia/
RUN mkdir -p /app/data && chown node:node /app/data
USER node
VOLUME /app/data
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null || exit 1
CMD ["node", "server.js"]
