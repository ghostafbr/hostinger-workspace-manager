# Hostinger Workspace Manager

![CI Status](https://github.com/[usuario]/hostinger-workspace-manager/workflows/CI/badge.svg)
![Node Version](https://img.shields.io/badge/node-22.x-brightgreen)
![Angular Version](https://img.shields.io/badge/angular-21.x-red)
![License](https://img.shields.io/badge/license-MIT-blue)

Aplicación Angular 21 para gestión centralizada de múltiples cuentas Hostinger con sincronización automática de dominios y suscripciones.

## 🚀 Quick Start

### Prerrequisitos
- Node.js 22+ 
- Angular CLI 21+
- Firebase project configurado
- (Opcional) Cuenta Hostinger con API token

### Desarrollo Local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar Firebase (ver FIREBASE_SETUP.md)
# Crear src/environments/environment.development.ts con tu config

# 3. Iniciar servidor de desarrollo
npm run start
# → http://localhost:4200

# 4. (Si modificas Cloud Functions)
cd functions
npm run build
firebase deploy --only functions
```

## 🏗️ Arquitectura

Este proyecto sigue **Clean Architecture** + **Atomic Design**:

```
Presentation → Application → Domain ← Infrastructure
```

- **Domain:** Entidades, interfaces y lógica de negocio pura
- **Application:** Servicios, guards, interceptors
- **Infrastructure:** Adaptadores (Firebase, Hostinger API)
- **Presentation:** UI con Atomic Design (Atoms → Molecules → Organisms → Pages)

Ver [ARCHITECTURE.md](ARCHITECTURE.md) para detalles completos.

## 🛠️ Tech Stack

- **Framework:** Angular 21 (Standalone Components)
- **UI Library:** PrimeNG (Lara theme)
- **Backend:** Firebase (Firestore + Authentication)
- **Cloud Functions:** Node.js con TypeScript
- **State Management:** Angular Signals
- **Styling:** SCSS
- **Linting:** ESLint + Prettier
- **Testing:** Vitest
- **CI/CD:** GitHub Actions
- **Hosting:** Hostinger

## 📁 Estructura del Proyecto

```
src/app/
├── domain/          # Entidades, interfaces, enums (puro TypeScript)
├── application/     # Servicios, guards, interceptors
├── infrastructure/  # Adaptadores (Firebase, Hostinger API)
└── presentation/    # UI Components (Atomic Design)
    ├── components/
    │   ├── atoms/
    │   ├── molecules/
    │   └── organisms/
    ├── layouts/
    └── pages/
```

## 📚 Documentación

La documentación completa del proyecto se encuentra en la carpeta [`Docs/`](Docs/).

### Estructura de Documentación

#### [01. Arquitectura](Docs/01_Architecture/)
- **[Architecture.md](Docs/01_Architecture/Architecture.md)** - Clean Architecture y Diseño
- **[Implementation_Summary.md](Docs/01_Architecture/Implementation_Summary.md)** - Resumen de implementación

#### [02. Setup y Despliegue](Docs/02_Setup_and_Deployment/)
- **[Setup.md](Docs/02_Setup_and_Deployment/Firebase_Setup.md)** - Configuración inicial y Firebase
- **[Development.md](Docs/02_Setup_and_Deployment/Development.md)** - Guía de desarrollo
- **[Deployment.md](Docs/02_Setup_and_Deployment/Deployment.md)** - Guías de despliegue y CI/CD

#### [03. Funcionalidades](Docs/03_Features/)
- **[Cloud_Functions.md](Docs/03_Features/Cloud_Functions.md)** - Documentación de backend
- **[DNS_Viewer.md](Docs/03_Features/DNS_Viewer.md)** - Visor y comparador de DNS
- **[DNS_Validation.md](Docs/03_Features/DNS_Validation.md)** - Validación y salud de registros DNS
- **[Sync_and_Audit.md](Docs/03_Features/Sync_and_Audit.md)** - Sistema de sincronización

#### [04. Calidad (QA)](Docs/04_Quality_Assurance/)
- **[Tests.md](Docs/04_Quality_Assurance/Tests.md)** - Estrategia de pruebas
- **[Performance.md](Docs/04_Quality_Assurance/Performance.md)** - Análisis de rendimiento

#### [05. Seguridad](Docs/05_Security/)
- **[Security_Rules.md](Docs/05_Security/Security_Rules.md)** - Reglas de seguridad Firestore

## ✨ Funcionalidades

### Sincronización de Workspaces

#### 🔄 Sincronización Individual (Manual)
Desde la UI, ejecuta sync de un workspace específico:
- Dominios desde Hostinger API
- Suscripciones activas
- Registro en `sync_runs` collection

#### 🤖 Sincronización Automática Diaria
Cloud Scheduler ejecuta **todos los días a las 03:00 AM** (America/Bogota):
- Sincroniza TODOS los workspaces activos
- Circuit breaker: deshabilita workspaces con 3+ errores consecutivos
- Rate limiting: 2 segundos entre cada workspace
- Logs detallados en Firebase Console

#### 📊 Circuit Breaker
Protección automática contra workspaces problemáticos:
- **Umbral**: 3 errores consecutivos
- **Acción**: Status → `REQUIRES_ATTENTION`
- **Prevención**: Se salta en próximas sincronizaciones
- **Reset**: Automático al tener sync exitoso

### Cloud Functions Desplegadas

1. **`syncWorkspace`** (HTTPS)
   - URL: `https://us-central1-hostinger-workspace-manager.cloudfunctions.net/syncWorkspace`
   - Sincroniza workspace individual
   - Requiere: Authorization header con Firebase ID token

2. **`syncAllWorkspaces`** (HTTPS)
   - URL: `https://us-central1-hostinger-workspace-manager.cloudfunctions.net/syncAllWorkspaces`
   - Sincroniza todos los workspaces (ejecución manual)
   - Requiere: Authorization header

3. **`syncAllWorkspacesScheduled`** (Scheduled)
   - Cron: `0 3 * * *` (03:00 AM diario)
   - Zona: America/Bogota
   - Ejecución automática sin intervención

## 🔍 Monitoreo y Logs

Ver logs en tiempo real:
```bash
# Logs de todas las funciones
firebase functions:log

# Logs de función específica
firebase functions:log --only syncAllWorkspacesScheduled
```

Consultar `sync_runs` en Firestore para métricas detalladas:
- Total de workspaces procesados
- Conteos de éxitos/fallos
- Workspaces deshabilitados
- Errores específicos

Ver [SYNC_AUDIT_LOGS.md](SYNC_AUDIT_LOGS.md) para detalles completos.

## 🚢 CI/CD y Despliegue

Este proyecto usa **GitHub Actions** para CI/CD y se despliega en **Hostinger**.

### Workflows Automatizados

#### CI (Continuous Integration)
Se ejecuta en cada push y PR:
```bash
✓ Lint (ESLint)
✓ Format check (Prettier)
✓ Build (producción)
```

#### Deploy (Continuous Deployment)
Se ejecuta en push a `main`:
```bash
✓ Build de producción
✓ Copia .htaccess
✓ Publica a branch hostinger-deploy
✓ Hostinger sincroniza automáticamente
```

### Comandos de Desarrollo

```bash
# Desarrollo
npm run start              # Dev server → http://localhost:4200

# Calidad de código
npm run lint               # Ejecutar linter
npm run lint:fix           # Auto-fix linting
npm run format             # Formatear código
npm run format:check       # Verificar formato

# Build
npm run build              # Build de producción
npm run watch              # Build con watch mode

# Testing
npm run test               # Ejecutar tests con Vitest
```

### Despliegue Manual

```bash
# Build local
npm run build

# Los archivos están en:
# dist/hostinger-workspace-manager/browser/

# El deploy automático se hace via GitHub Actions
# pero puedes forzar un deploy con:
git push origin main
```

Ver [DEPLOYMENT.md](DEPLOYMENT.md) para configuración completa.

## 🔧 Code Scaffolding

Angular CLI incluye herramientas de generación de código:

```bash
# Generar componente
ng generate component component-name

# Ver todas las opciones
ng generate --help
```

## 🧪 Testing

Ejecutar tests unitarios con Vitest:

```bash
npm run test
```

## 🤝 Contribuir

Ver [CONTRIBUTING.md](.github/CONTRIBUTING.md) para guías de contribución.

### Branch Strategy

- `main` - Producción (protegida)
- `develop` - Desarrollo (futuro)
- `feature/*` - Nuevas funcionalidades
- `fix/*` - Bug fixes

### Commit Messages

Usar formato convencional:
```
feat: add new feature
fix: correct bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

## 📄 Licencia

Este proyecto es privado y propietario.

## 📞 Soporte

- **Issues:** Reportar bugs o sugerencias en GitHub Issues
- **Documentación:** Ver carpeta [`Docs/`](Docs/) para más guías
- **Cloud Functions:** Ver logs en Firebase Console

## 🎯 Roadmap

Ver [Issues](../../issues) en GitHub para el roadmap completo.

### MVP Completado
- ✅ #1 + #2 - Dashboards
- ✅ #16 - Sistema de Alertas
- ✅ #11 - Audit Logs
- ✅ #21 - Security Rules

### En Progreso
- 🚧 #14 - CI/CD
- 🚧 #26 - Documentación

## 🙏 Agradecimientos

- Angular Team por el excelente framework
- PrimeNG por la librería de componentes UI
- Firebase por la infraestructura backend
- Hostinger por el hosting

---

**Última actualización:** 11 de enero de 2026
