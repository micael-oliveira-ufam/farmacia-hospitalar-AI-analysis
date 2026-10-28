#!/usr/bin/env bash
cd "$(dirname "$0")/.."
docker compose logs tunnel 2>&1 | grep -Eo 'https://[a-z0-9-]+\.trycloudflare\.com' | tail -1 || echo "Sem link: o túnel está rodando? (docker compose ps)"
