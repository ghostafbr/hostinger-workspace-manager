# Guía de Desarrollo - Clean Architecture + Atomic Design

## 🎯 Principios a seguir en TODOS los issues

### 1. Clean Architecture - Flujo de dependencias

```
Presentation → Application → Domain ← Infrastructure
```

**Reglas:**
- ✅ Presentation puede usar Application y Domain
- ✅ Application puede usar Domain
- ✅ Infrastructure implementa interfaces de Domain
- ❌ Domain NO puede depender de nada
- ❌ Infrastructure NO puede importar Presentation ni Application

### 2. Atomic Design

#### Atoms (Componentes básicos)
```typescript
// Ejemplo: Button, Input, Badge
@Component({
  selector: 'app-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeModule],
  template: `<p-badge [value]="status()" [severity]="severity()" />`
})
export class StatusBadgeComponent {
  status = input.required<string>();
  severity = computed(() => this.getSeverity(this.status()));
}
```

#### Molecules (Combinación de atoms)
```typescript
// Ejemplo: SearchBar, FormField
@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [InputTextModule, ButtonModule],
  template: `
    <div class="flex gap-2">
      <input pInputText [(ngModel)]="searchTerm" />
      <p-button icon="pi pi-search" (onClick)="search()" />
    </div>
  `
})
export class SearchBarComponent {
  searchTerm = model('');
  search = output<string>();
}
```

#### Organisms (Componentes complejos)
```typescript
// Ejemplo: DataTable, Form, Card
@Component({
  selector: 'app-workspace-table',
  standalone: true,
  imports: [TableModule, StatusBadgeComponent, ButtonModule],
  template: `<p-table [value]="workspaces()">...</p-table>`
})
export class WorkspaceTableComponent {}
```

#### Pages (Smart components)
```typescript
// Ejemplo: DashboardPage, LoginPage
@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [WorkspaceTableComponent, SearchBarComponent],
  template: `
    <app-search-bar (search)="onSearch($event)" />
    <app-workspace-table [workspaces]="filteredWorkspaces()" />
  `
})
export class DashboardPageComponent {
  private workspaceService = inject(WorkspaceService);
  workspaces = signal<Workspace[]>([]);
}
```

### 3. SOLID Principles

#### Single Responsibility
```typescript
// ✅ Correcto: Un servicio = una responsabilidad
@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  // Solo gestiona workspaces
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Solo gestiona autenticación
}
```

#### Dependency Inversion
```typescript
// Domain: Define la interfaz
export interface IWorkspaceRepository {
  getAll(): Observable<Workspace[]>;
  save(workspace: Workspace): Observable<void>;
}

// Infrastructure: Implementa la interfaz
@Injectable({ providedIn: 'root' })
export class FirestoreWorkspaceRepository implements IWorkspaceRepository {
  getAll(): Observable<Workspace[]> {
    // Implementación Firestore
  }
}

// Application: Depende de la abstracción
@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  constructor(@Inject(WORKSPACE_REPOSITORY) private repo: IWorkspaceRepository) {}
}
```

### 4. Angular 21 Best Practices

#### Signals
```typescript
// ✅ Usar signals para estado
export class MyComponent {
  count = signal(0);
  double = computed(() => this.count() * 2);
  
  increment() {
    this.count.update(v => v + 1);
  }
}
```

#### Input/Output con signals
```typescript
export class MyComponent {
  // Input
  title = input.required<string>();
  
  // Output
  save = output<Workspace>();
  
  onSave() {
    this.save.emit(workspace);
  }
}
```

#### OnPush Change Detection
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush, // SIEMPRE
  standalone: true,
})
export class MyComponent {}
```

### 5. Estructura de archivos por feature

```
src/app/
├── presentation/
│   ├── components/
│   │   ├── atoms/
│   │   │   └── status-badge/
│   │   │       ├── status-badge.component.ts
│   │   │       └── status-badge.component.spec.ts
│   │   ├── molecules/
│   │   │   └── search-bar/
│   │   └── organisms/
│   │       └── workspace-table/
│   ├── pages/
│   │   └── dashboard/
│   │       ├── dashboard.page.ts
│   │       ├── dashboard.page.html
│   │       ├── dashboard.page.scss
│   │       └── dashboard.page.spec.ts
│   └── layouts/
│       └── main-layout/
├── application/
│   ├── services/
│   │   └── workspace.service.ts
│   ├── guards/
│   │   └── auth.guard.ts
│   └── validators/
│       └── workspace-name.validator.ts
├── domain/
│   ├── models/
│   │   └── workspace.model.ts
│   ├── interfaces/
│   │   └── workspace-repository.interface.ts
│   └── enums/
│       └── workspace-status.enum.ts
└── infrastructure/
    ├── repositories/
    │   └── firestore-workspace.repository.ts
    ├── adapters/
    │   └── firebase.adapter.ts
    └── constants/
        └── api.constants.ts
```

### 6. Nomenclatura

- **Componentes**: `workspace-card.component.ts`
- **Pages**: `dashboard.page.ts`
- **Services**: `workspace.service.ts`
- **Models**: `workspace.model.ts`
- **Interfaces**: `workspace-repository.interface.ts`
- **Enums**: `workspace-status.enum.ts`
- **Guards**: `auth.guard.ts`
- **Validators**: `workspace-name.validator.ts`

### 7. Solo PrimeNG para UI

```typescript
// ✅ Correcto
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';

// ❌ PROHIBIDO
import { MatButtonModule } from '@angular/material/button';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
```

### 8. Testing con Vitest

```typescript
import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';

describe('WorkspaceService', () => {
  it('should create', () => {
    const service = TestBed.inject(WorkspaceService);
    expect(service).toBeTruthy();
  });
});
```

## 📋 Checklist para cada issue

- [ ] Código en la capa correcta (Presentation/Application/Domain/Infrastructure)
- [ ] Componentes standalone
- [ ] ChangeDetection OnPush
- [ ] Usar signals para estado
- [ ] Solo PrimeNG para UI
- [ ] Seguir nomenclatura establecida
- [ ] Tests incluidos
- [ ] Sin dependencias circulares
- [ ] Código formateado (Prettier)
- [ ] Sin errores de linting (ESLint)

## 🚀 Comandos útiles

```bash
npm run lint        # Verificar linting
npm run lint:fix    # Arreglar errores de linting
npm run format      # Formatear código
npm run build       # Compilar proyecto
npm run test        # Ejecutar tests
npm start           # Servidor desarrollo
```
