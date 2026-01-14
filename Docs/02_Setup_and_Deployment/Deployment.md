# Guía de Despliegue - Hostinger Workspace Manager

## 🚀 Estrategia de Despliegue

Este proyecto utiliza **GitHub Actions** para CI/CD y se despliega en **Hostinger** mediante Git.

## 📋 Requisitos Previos

1. **Cuenta Hostinger** con acceso a Git deployment
2. **Repositorio GitHub** configurado
3. **Node.js 22** instalado localmente para desarrollo

## 🔄 Flujos de Trabajo (Workflows)

### CI - Integración Continua

**Archivo:** `.github/workflows/ci.yml`

**Se ejecuta en:**
- Push a `main`
- Pull Requests

**Pasos:**
1. ✅ Checkout del código
2. ✅ Setup Node.js 22
3. ✅ Instalación de dependencias (`npm ci`)
4. ✅ Verificación de formato (`npm run format:check`)
5. ✅ Linting (`npm run lint`)
6. ✅ Build de producción (`npm run build`)

**Propósito:** Validar que el código cumple con los estándares de calidad antes de mergear.

### Deploy - Despliegue Continuo

**Archivo:** `.github/workflows/deploy.yml`

**Se ejecuta en:**
- Push a `main`
- Manualmente via `workflow_dispatch`

**Pasos:**
1. ✅ Checkout del código
2. ✅ Setup Node.js 22
3. ✅ Instalación de dependencias
4. ✅ Build de producción
5. ✅ Copia de `.htaccess` al directorio de build
6. ✅ Publicación a branch `hostinger-deploy`

**Output:**
- Los archivos compilados se publican en la rama `hostinger-deploy`
- Hostinger sincroniza automáticamente desde esta rama

## 📁 Estructura de Despliegue

```
dist/hostinger-workspace-manager/browser/
├── index.html              # Entry point (sin cache)
├── .htaccess              # Configuración Apache (copiado desde deploy/)
├── main-[hash].js         # Bundle principal (cache 1 año)
├── styles-[hash].css      # Estilos (cache 1 año)
├── chunk-*.js             # Chunks lazy-loaded (cache 1 año)
└── assets/                # Assets estáticos
```

## 🔧 Configuración de Hostinger

### 1. Crear Repositorio Git en Hostinger

1. Acceder a **hPanel > Git**
2. Crear nuevo repositorio Git
3. Configurar:
   - **Branch:** `hostinger-deploy`
   - **Ruta destino:** `/public_html` (o subdirectorio deseado)

### 2. Configurar Webhook (Opcional)

Para despliegue automático:
1. En GitHub: **Settings > Webhooks > Add webhook**
2. **Payload URL:** URL proporcionada por Hostinger
3. **Content type:** `application/json`
4. **Events:** Just the push event
5. **Active:** ✓

### 3. Configuración Apache (.htaccess)

El archivo `deploy/.htaccess` ya está configurado con:

✅ **Redirección SPA:** Todas las rutas → `index.html`
✅ **Cache optimizado:**
- Assets (JS, CSS, imágenes): 1 año
- `index.html`: sin cache

✅ **Seguridad:**
- Sin listado de directorios
- Firmas de servidor ocultas

## 🛠️ Comandos de Desarrollo

```bash
# Desarrollo local
npm run start              # Dev server en http://localhost:4200

# Calidad de código
npm run lint               # Ejecutar linter
npm run lint:fix           # Auto-fix linting
npm run format             # Formatear código
npm run format:check       # Verificar formato

# Build
npm run build              # Build de producción
npm run watch              # Build con watch mode
```

## 🔍 Testing Local del Build

```bash
# Build de producción
npm run build

# Servir build localmente (instalar serve primero)
npx serve dist/hostinger-workspace-manager/browser

# Abrir http://localhost:3000
```

## 📊 Monitoreo de Despliegues

### GitHub Actions

Ver estado en: `https://github.com/[usuario]/hostinger-workspace-manager/actions`

**Estados posibles:**
- ✅ Success - Despliegue exitoso
- ❌ Failed - Error en build o despliegue
- 🟡 In progress - Ejecutándose

### Hostinger Panel

1. **hPanel > Git > Ver historial**
2. Verificar último commit sincronizado
3. Revisar logs de despliegue

## 🐛 Troubleshooting

### Error: Build falla en CI

```bash
# Verificar localmente
npm ci
npm run lint
npm run build
```

**Solución:** Corregir errores de lint o build antes de push.

### Error: .htaccess no se copia

**Verificar:**
- Archivo existe en `deploy/.htaccess`
- Workflow tiene paso de copia
- Path es correcto: `dist/hostinger-workspace-manager/browser/`

### Error: Rutas de Angular no funcionan (404)

**Causa:** `.htaccess` no configurado o no procesado por Apache.

**Solución:**
1. Verificar que `.htaccess` está en el root del dominio
2. Verificar que Apache tiene `AllowOverride All`
3. Contactar soporte Hostinger si es necesario

### Error: Assets no cargan

**Verificar:**
- Build completado correctamente
- Ruta base correcta en `index.html`
- Permisos de archivos en servidor (644 para archivos, 755 para directorios)

## 🔒 Seguridad

### Variables de Entorno

**IMPORTANTE:** Las credenciales de Firebase están en el código del cliente solo para autenticación. Las operaciones sensibles usan Firebase Security Rules.

**No se requieren secrets en GitHub Actions** para el despliegue básico.

### Configuración Firebase

Las reglas de seguridad ya están desplegadas en Firebase. Ver:
- `firestore.rules` - Reglas de Firestore
- `SECURITY_RULES.md` - Documentación completa

## 📈 Optimizaciones de Rendimiento

### Build de Producción

El build incluye automáticamente:
- ✅ Minificación de JS/CSS
- ✅ Tree shaking
- ✅ Lazy loading de rutas
- ✅ Output hashing para cache busting
- ✅ Bundling optimizado

### Configuración de Cache

Ver `deploy/.htaccess`:
- **Assets hasheados:** Cache 1 año (inmutable)
- **index.html:** Sin cache (siempre fresco)

### Lighthouse Score Objetivo

- **Performance:** > 90
- **Accessibility:** > 90
- **Best Practices:** > 90
- **SEO:** > 90

## 🔄 Rollback

Si un despliegue causa problemas:

```bash
# Opción 1: Revertir commit en main
git revert [commit-hash]
git push origin main
# Trigger automático de nuevo despliegue

# Opción 2: Despliegue manual de commit anterior
git push origin [commit-hash]:hostinger-deploy --force
```

## 📝 Checklist Pre-Despliegue

Antes de hacer push a `main`:

- [ ] Código pasó lint local (`npm run lint`)
- [ ] Código formateado (`npm run format`)
- [ ] Build exitoso local (`npm run build`)
- [ ] Testing manual en dev (`npm run start`)
- [ ] Variables de entorno actualizadas (si aplica)
- [ ] Documentación actualizada

## 🎯 Próximos Pasos

### Mejoras Futuras

1. **Testing Automatizado**
   - Agregar tests unitarios con Vitest
   - Tests E2E con Playwright
   - Coverage mínimo del 80%

2. **Staging Environment**
   - Branch `develop` → staging.dominio.com
   - Branch `main` → producción

3. **Monitoring**
   - Google Analytics
   - Error tracking (Sentry)
   - Performance monitoring

4. **CDN**
   - Configurar Cloudflare
   - Cache de assets globalmente

## 📞 Soporte

- **GitHub Issues:** Reportar bugs o sugerencias
- **Hostinger Support:** Problemas de hosting
- **Documentación:** Ver `/docs` para más guías

---

**Última actualización:** 11 de enero de 2026
