# Issue #14: Configurar CI/CD con GitHub Actions

## 📋 Descripción

Implementar flujos de trabajo de CI/CD usando GitHub Actions para automatizar la validación de código y el despliegue a Hostinger.

## 🎯 Objetivos

1. **CI (Continuous Integration):** Validar automáticamente cada push y PR
2. **CD (Continuous Deployment):** Desplegar automáticamente a Hostinger cuando hay cambios en `main`
3. **Calidad de código:** Asegurar que todo el código cumple estándares antes de mergear

## ✅ Criterios de Aceptación

### Workflow CI (`ci.yml`)

- [ ] Se ejecuta en push a `main` y en pull requests
- [ ] Instala dependencias con `npm ci`
- [ ] Verifica formato con `npm run format:check`
- [ ] Ejecuta linter con `npm run lint`
- [ ] Compila el proyecto con `npm run build`
- [ ] Falla si algún paso no pasa

### Workflow Deploy (`deploy.yml`)

- [ ] Se ejecuta solo en push a `main`
- [ ] Puede ejecutarse manualmente (workflow_dispatch)
- [ ] Compila la aplicación de producción
- [ ] Copia `.htaccess` al directorio de build
- [ ] Publica archivos a la rama `hostinger-deploy`
- [ ] Hostinger sincroniza automáticamente desde esa rama

### Configuración de Hostinger

- [ ] Repositorio Git configurado en Hostinger
- [ ] Branch `hostinger-deploy` como fuente
- [ ] Ruta de despliegue configurada (ej: `/public_html`)
- [ ] `.htaccess` funcionando correctamente (redirección SPA)
- [ ] Webhook configurado para auto-deploy (opcional)

## 🔧 Tareas Técnicas

### 1. Crear Workflows de GitHub Actions

**Archivos a crear/modificar:**

```
.github/workflows/
├── ci.yml       # Integración continua
└── deploy.yml   # Despliegue continuo
```

**CI Workflow debe:**
- Usar Node.js 22
- Ejecutar en Ubuntu latest
- Cache de npm para velocidad
- Reportar errores claramente

**Deploy Workflow debe:**
- Usar `peaceiris/actions-gh-pages@v3` para publicar
- Publicar en branch `hostinger-deploy`
- Incluir mensaje de commit con SHA

### 2. Configurar Hostinger

**Pasos en hPanel:**
1. Git > Crear nuevo repositorio
2. Conectar con GitHub repository
3. Configurar branch: `hostinger-deploy`
4. Configurar ruta destino
5. Hacer pull inicial
6. (Opcional) Configurar webhook

### 3. Archivo .htaccess

**Ubicación:** `deploy/.htaccess`

**Debe incluir:**
- Redirección de todas las rutas a `index.html` (SPA routing)
- Configuración de cache para assets
- Seguridad básica (no directory listing, etc.)

### 4. Testing del Pipeline

- [ ] Hacer push a una feature branch
- [ ] Verificar que CI se ejecuta
- [ ] Crear PR y verificar que CI valida
- [ ] Mergear a main
- [ ] Verificar que Deploy se ejecuta
- [ ] Confirmar que Hostinger sincronizó
- [ ] Probar app en producción

## 📝 Notas de Implementación

### Estructura del Build

El build de Angular genera:
```
dist/hostinger-workspace-manager/browser/
├── index.html
├── main-[hash].js
├── styles-[hash].css
└── ...
```

### Cache Strategy

- **index.html:** No cache (debe ser siempre fresco)
- **JS/CSS/Assets:** Cache 1 año (tienen hash en nombre)

### Variables de Entorno

No se requieren secrets para el despliegue básico. Firebase credentials están en el código del cliente (solo para auth pública).

## 🐛 Testing

### Testing Local

```bash
# Simular CI localmente
npm ci
npm run format:check
npm run lint
npm run build

# Servir build
npx serve dist/hostinger-workspace-manager/browser
```

### Verificar en Hostinger

1. Acceder a la URL de producción
2. Verificar rutas funcionan (ej: `/dashboard`)
3. Verificar assets cargan correctamente
4. Verificar funcionalidad básica (login, navegación)

## 🔗 Recursos

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Hostinger Git Tutorial](https://www.hostinger.com/tutorials/how-to-use-git)
- [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages)

## 📦 Entregables

1. `.github/workflows/ci.yml` - Workflow de CI
2. `.github/workflows/deploy.yml` - Workflow de Deploy
3. `deploy/.htaccess` - Configuración Apache
4. `DEPLOYMENT.md` - Documentación de despliegue
5. Hostinger configurado y funcionando
6. Primer despliegue exitoso

## ⏱️ Estimación

**Tiempo estimado:** 2-3 horas

- Setup de workflows: 1 hora
- Configuración Hostinger: 30 min
- Testing y ajustes: 1-1.5 horas

## 🎓 Aprendizajes

Este issue enseña:
- GitHub Actions workflows
- CI/CD best practices
- Despliegue de Angular SPAs
- Configuración Apache (.htaccess)
- Git branching strategies

## ✨ Mejoras Futuras

- [ ] Tests automatizados en CI
- [ ] Ambiente de staging
- [ ] Lighthouse CI para performance
- [ ] Notificaciones de Slack/Discord
- [ ] Preview deployments para PRs

---

**Prioridad:** Alta (MVP)  
**Dependencias:** Ninguna (puede hacerse en paralelo con otros issues)  
**Labels:** `ci/cd`, `devops`, `infrastructure`
