# Script de Despliegue - Nuevas Funcionalidades
# Despliega las nuevas Cloud Functions y reglas de Firestore

Write-Host "🚀 Iniciando despliegue de nuevas funcionalidades..." -ForegroundColor Cyan

# 1. Desplegar reglas e índices de Firestore
Write-Host "`n📋 Desplegando reglas e índices de Firestore..." -ForegroundColor Blue
firebase deploy --only firestore:rules,firestore:indexes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Reglas e índices desplegados" -ForegroundColor Green
} else {
    Write-Host "⚠️  Error desplegando reglas/índices" -ForegroundColor Yellow
    exit 1
}

# 2. Build de Cloud Functions
Write-Host "`n🔨 Compilando Cloud Functions..." -ForegroundColor Blue
Set-Location functions
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Compilación exitosa" -ForegroundColor Green
} else {
    Write-Host "⚠️  Error en compilación" -ForegroundColor Yellow
    exit 1
}

# 3. Desplegar nuevas Cloud Functions
Write-Host "`n☁️  Desplegando Cloud Functions..." -ForegroundColor Blue
firebase deploy --only functions:generateAlertsScheduled,functions:wompiWebhook

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Funciones desplegadas" -ForegroundColor Green
} else {
    Write-Host "⚠️  Error desplegando funciones" -ForegroundColor Yellow
    exit 1
}

Set-Location ..

Write-Host "`n🎉 ¡Despliegue completado!" -ForegroundColor Green
Write-Host "`nFunciones desplegadas:"
Write-Host "  - generateAlertsScheduled (Scheduler - 8:00 AM diario)"
Write-Host "  - wompiWebhook (HTTP)"
Write-Host "`nPróximos pasos:"
Write-Host "  1. Configurar webhook en Wompi dashboard"
Write-Host "  2. Agregar WOMPI_INTEGRITY_KEY a functions/.env"
Write-Host "  3. Verificar logs: firebase functions:log"
Write-Host ""
