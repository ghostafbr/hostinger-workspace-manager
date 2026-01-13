# Service Worker Setup

## Instalación

Para habilitar el Service Worker y PWA features, ejecuta:

```bash
ng add @angular/pwa
```

Esto instalará:
- `@angular/service-worker`
- Configurará automáticamente el proyecto
- Creará iconos de PWA
- Actualizará index.html con meta tags

## Después de instalar

1. Descomenta las líneas en `app.config.ts`:
   - Import de `provideServiceWorker`
   - Import de `SwUpdateService`
   - Provider de Service Worker
   - App initializer

2. Verifica que `angular.json` tenga:
```json
"serviceWorker": "src/ngsw-config.json"
```

3. Build de producción:
```bash
npm run build
```

4. Verificar Service Worker:
```bash
npx http-server dist/hostinger-workspace-manager/browser -p 8080
```

Abrir Chrome DevTools > Application > Service Workers

## Archivos ya preparados

✅ `src/ngsw-config.json` - Configuración de cache  
✅ `public/manifest.webmanifest` - PWA manifest  
✅ `src/app/application/services/sw-update.service.ts` - Service de updates  
✅ `public/.htaccess` - Configuración de servidor  
✅ `src/index.html` - Meta tags de PWA

Solo falta instalar el paquete y descomentar el código.
