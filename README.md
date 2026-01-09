# HostingerWorkspaceManager

Aplicación Angular 21 para gestión centralizada de múltiples cuentas Hostinger con sincronización automática de dominios y suscripciones.

## 🚀 Quick Start

### Prerrequisitos
- Node.js 20+ 
- Angular CLI 21+
- Cuenta Firebase configurada
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

## 📚 Documentación

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Clean Architecture + Atomic Design
- **[DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)** - Ejemplos de código detallados
- **[FIREBASE_SETUP.md](FIREBASE_SETUP.md)** - Configuración Firebase paso a paso
- **[CLOUD_FUNCTIONS.md](CLOUD_FUNCTIONS.md)** - Cloud Functions sin emulador (producción directa)

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
