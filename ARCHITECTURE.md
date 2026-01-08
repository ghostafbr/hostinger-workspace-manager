# Hostinger Workspace Manager - Arquitectura

Este documento describe la arquitectura del proyecto siguiendo **Clean Architecture** y **Atomic Design**.

## 📐 Principios de Arquitectura

### Clean Architecture - Capas

```
┌─────────────────────────────────────────────────┐
│              PRESENTATION                       │
│  (UI Components, Pages, Layouts)                │
│  - Atomic Design (Atoms, Molecules, Organisms)  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│              APPLICATION                        │
│  (Services, Guards, Interceptors, Validators)   │
│  - Orquestación de casos de uso                 │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│                DOMAIN                           │
│  (Entities, Interfaces, Models, Enums)          │
│  - Lógica de negocio pura                       │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│            INFRASTRUCTURE                       │
│  (Adapters, Repositories, Utils, Constants)     │
│  - Implementaciones técnicas                    │
└─────────────────────────────────────────────────┘
```

### Atomic Design

Los componentes se organizan en:

- **Atoms**: Componentes básicos indivisibles (botones, inputs, badges)
- **Molecules**: Combinación de atoms (search-bar, form-field)
- **Organisms**: Componentes complejos (tablas, formularios, cards)
- **Pages**: Páginas completas (containers/smart components)
- **Layouts**: Estructuras de layout reutilizables

## 🎯 Principios SOLID

### Single Responsibility (SRP)
- Cada componente/servicio tiene una única responsabilidad
- Separación clara entre lógica de negocio y presentación

### Open/Closed (OCP)
- Abierto para extensión, cerrado para modificación
- Uso de interfaces y abstracciones

### Liskov Substitution (LSP)
- Las implementaciones pueden ser sustituidas por sus abstracciones
- Contratos claros en interfaces

### Interface Segregation (ISP)
- Interfaces específicas por responsabilidad
- No obligar a implementar métodos innecesarios

### Dependency Inversion (DIP)
- Dependencias hacia abstracciones, no implementaciones
- Uso de Dependency Injection de Angular

## 📁 Estructura de Carpetas

```
src/app/
├── presentation/           # Capa de presentación
│   ├── components/
│   │   ├── atoms/         # Componentes básicos
│   │   ├── molecules/     # Componentes compuestos
│   │   └── organisms/     # Componentes complejos
│   ├── pages/             # Páginas/Containers
│   └── layouts/           # Layouts reutilizables
├── application/           # Capa de aplicación
│   ├── services/          # Servicios de negocio
│   ├── guards/            # Route guards
│   ├── interceptors/      # HTTP interceptors
│   └── validators/        # Validators personalizados
├── domain/                # Capa de dominio
│   ├── entities/          # Entidades del dominio
│   ├── interfaces/        # Interfaces y contratos
│   ├── models/            # DTOs y modelos
│   └── enums/             # Enumeraciones
└── infrastructure/        # Capa de infraestructura
    ├── adapters/          # Adaptadores externos
    ├── repositories/      # Implementación de repos
    ├── utils/             # Utilidades técnicas
    └── constants/         # Constantes

```

## 🔧 Stack Tecnológico

- **Framework**: Angular 21 (Standalone Components)
- **UI Library**: PrimeNG (exclusivo)
- **State**: Signals + RxJS
- **Styling**: SCSS + PrimeNG Theme
- **Testing**: Vitest
- **Backend**: Firebase (Auth, Firestore, Functions)
- **Linting**: ESLint + Prettier

## 📝 Convenciones de Código

### Nomenclatura

- **Components**: PascalCase (`WorkspaceCard`, `LoginPage`)
- **Services**: PascalCase + Service suffix (`WorkspaceService`)
- **Interfaces**: PascalCase + I prefix opcional (`IWorkspace` o `Workspace`)
- **Models**: PascalCase (`WorkspaceModel`, `DomainDto`)
- **Enums**: PascalCase (`WorkspaceStatus`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Variables/Functions**: camelCase (`workspaceId`, `getWorkspace()`)

### Prefijos de Componentes

- Selector: `app-` (ej: `app-workspace-card`)
- Standalone: Todos los componentes deben ser standalone
- ChangeDetection: OnPush por defecto

### Imports

Usar barrel exports (`index.ts`) para importaciones limpias:

```typescript
// ✅ Correcto
import { WorkspaceService, AuthService } from '@app/application';
import { Workspace } from '@app/domain';

// ❌ Incorrecto
import { WorkspaceService } from '@app/application/services/workspace.service';
```

## 🧪 Testing

- Tests unitarios para servicios y lógica de negocio
- Tests de componentes para UI crítica
- Mocks para servicios externos
- Coverage mínimo: 70%

## 📚 Referencias

- [Angular Style Guide](https://angular.dev/style-guide)
- [PrimeNG Documentation](https://primeng.org/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/)
