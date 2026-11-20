# Windows (PowerShell): sobe o aplicativo e o túnel temporário do Cloudflare.
Set-Location (Join-Path $PSScriptRoot "..")
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { Write-Host "Docker nao encontrado. Instale o Docker Desktop."; exit 1 }
if (-not (Test-Path .env)) { Copy-Item .env.example .env; Write-Host "Criei .env a partir de .env.example." }

# Procura uma porta livre a partir de HOST_PORT (ou 8080).
function Test-PortBusy($p) { return [bool](Get-NetTCPConnection -State Listen -LocalPort $p -ErrorAction SilentlyContinue) }
$line = Select-String -Path .env -Pattern '^HOST_PORT=(\d+)' | Select-Object -Last 1
$cur = if ($line) { [int]$line.Matches[0].Groups[1].Value } else { 8080 }
$mine = (docker compose port app 8080 2>$null) -replace '.*:', ''
$port = $cur
if ("$mine" -ne "$port") { $n = 0; while ((Test-PortBusy $port) -and $n -lt 200) { $port++; $n++ } }
if ($port -ne $cur) { Write-Host "Porta $cur ocupada; usando $port." }
$env = Get-Content .env
if ($env -match '^HOST_PORT=') { $env = $env -replace '^HOST_PORT=.*', "HOST_PORT=$port" } else { $env += "HOST_PORT=$port" }
Set-Content .env $env

docker compose up -d --build
Write-Host "Aguardando o link do Cloudflare..."
$url = $null
for ($i = 0; $i -lt 30 -and -not $url; $i++) {
  Start-Sleep -Seconds 2
  $m = [regex]::Matches((docker compose logs tunnel 2>&1 | Out-String), 'https://[a-z0-9-]+\.trycloudflare\.com')
  if ($m.Count) { $url = $m[$m.Count - 1].Value }
}
Write-Host "Local:   http://localhost:$port"
Write-Host "Guia:    http://localhost:$port/guia/"
if ($url) { Write-Host "Publico: $url (temporario)" } else { Write-Host "Link ainda nao apareceu: docker compose logs tunnel" }
