#!/usr/bin/env bash
# Sobe o aplicativo e o túnel temporário do Cloudflare, e mostra o link.
set -euo pipefail
cd "$(dirname "$0")/.."
command -v docker >/dev/null || { echo "Docker não encontrado. Instale o Docker Desktop (Windows/Mac) ou Docker Engine (Linux)."; exit 1; }
[ -f .env ] || { cp .env.example .env; echo "Criei .env a partir de .env.example (defina SITE_PASSWORD para proteger o link público)."; }

# Procura uma porta livre no computador, a partir de HOST_PORT (ou 8080).
port_busy() {
  if command -v ss >/dev/null; then ss -ltn 2>/dev/null | awk '{print $4}' | grep -Eq "[:.]$1$"
  elif command -v lsof >/dev/null; then lsof -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1
  else (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null; fi
}
# Se a porta é do próprio app (já em execução), mantém; senão procura outra.
cur=$(grep -E '^HOST_PORT=' .env | tail -1 | cut -d= -f2 | tr -d '\r' || true); cur=${cur:-8080}
mine=$(docker compose port app 8080 2>/dev/null | awk -F: '{print $NF}' || true)
port=$cur
if [ "$mine" != "$port" ]; then
  n=0; while port_busy "$port" && [ $n -lt 200 ]; do port=$((port+1)); n=$((n+1)); done
fi
[ "$port" != "$cur" ] && echo "Porta $cur ocupada; usando $port."
if grep -q '^HOST_PORT=' .env; then sed -i.bak "s/^HOST_PORT=.*/HOST_PORT=$port/" .env && rm -f .env.bak; else echo "HOST_PORT=$port" >> .env; fi

docker compose up -d --build
echo "Aguardando o link do Cloudflare..."
for i in $(seq 1 30); do
  url=$(docker compose logs tunnel 2>&1 | grep -Eo 'https://[a-z0-9-]+\.trycloudflare\.com' | tail -1 || true)
  [ -n "$url" ] && break
  sleep 2
done
echo
echo "Local:    http://localhost:$port"
echo "Guia:     http://localhost:$port/guia/"
if [ -n "${url:-}" ]; then echo "Público:  $url   (temporário; muda a cada execução)"; else echo "Link ainda não apareceu: rode ./scripts/link.sh em alguns segundos."; fi
