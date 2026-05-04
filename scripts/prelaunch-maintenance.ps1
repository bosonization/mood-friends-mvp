# eMoodition pre-launch maintenance script
# Run from the project root: C:\Users\maabo\Documents\mood-friends-mvp

$ErrorActionPreference = "Stop"

Write-Host "== eMoodition pre-launch maintenance ==" -ForegroundColor Cyan

$middlewarePath = "src\middleware.ts"
$proxyPath = "src\proxy.ts"

if ((Test-Path $middlewarePath) -and !(Test-Path $proxyPath)) {
  Write-Host "Renaming src\middleware.ts -> src\proxy.ts" -ForegroundColor Yellow
  Move-Item $middlewarePath $proxyPath

  $content = Get-Content $proxyPath -Raw
  $content = $content -replace "export\s+async\s+function\s+middleware\s*\(", "export async function proxy("
  $content = $content -replace "export\s+function\s+middleware\s*\(", "export function proxy("
  $content = $content -replace "export\s+const\s+middleware\s*=", "export const proxy ="
  Set-Content $proxyPath $content -NoNewline

  Write-Host "Proxy migration done." -ForegroundColor Green
} elseif ((Test-Path $middlewarePath) -and (Test-Path $proxyPath)) {
  Write-Host "Both src\middleware.ts and src\proxy.ts exist. Please compare them and delete src\middleware.ts manually after confirming." -ForegroundColor Red
} else {
  Write-Host "No src\middleware.ts found, or proxy migration already completed." -ForegroundColor Green
}

# Avoid committing TypeScript incremental build cache if it was accidentally tracked.
if (Test-Path "tsconfig.tsbuildinfo") {
  Write-Host "Removing tsconfig.tsbuildinfo from working tree." -ForegroundColor Yellow
  Remove-Item "tsconfig.tsbuildinfo" -Force
}

Write-Host "Done. Next run:" -ForegroundColor Cyan
Write-Host "npm run typecheck" -ForegroundColor White
Write-Host "npm run build" -ForegroundColor White
Write-Host "npm run dev" -ForegroundColor White
