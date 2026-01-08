# Hostinger Workspace Manager - AI Coding Instructions

## Architecture Overview

This is an **Angular 21 standalone components** application following **Clean Architecture** + **Atomic Design**. Never violate the layer dependency rules.

### Dependency Flow (CRITICAL)
```
Presentation → Application → Domain ← Infrastructure
```

**Strict Rules:**
- ✅ Presentation imports from Application + Domain
- ✅ Application imports from Domain only
- ✅ Infrastructure implements Domain interfaces
- ❌ Domain NEVER imports from other layers (must be pure TypeScript)
- ❌ Infrastructure NEVER imports from Presentation/Application

### Layer Structure
```
src/app/
├── presentation/     # UI: Atoms→Molecules→Organisms→Pages→Layouts (PrimeNG only)
├── application/      # Services, Guards, Interceptors (orchestration logic)
├── domain/           # Pure TS: Entities, Interfaces, Models, Enums (NO framework deps)
└── infrastructure/   # Adapters: Firebase, Hostinger API, Repositories
```

## Tech Stack Specifics

- **Framework**: Angular 21 - All components MUST be standalone
- **UI Library**: PrimeNG exclusively - NO custom HTML inputs/buttons
- **State**: Angular Signals (not RxJS Subject/BehaviorSubject for local state)
- **Backend**: Firebase (Auth via `FirebaseAdapter.getAuth()`, Firestore via `FirebaseAdapter.getFirestore()`)
- **Testing**: Vitest (run with `npm test`)
- **Styling**: SCSS with PrimeNG themes - NO Tailwind/Bootstrap

## Critical Patterns

### 1. Barrel Exports (MANDATORY)
Always use `index.ts` barrel exports to keep imports clean:

```typescript
// ✅ CORRECT
import { WorkspaceService, AuthService } from '@app/application';
import { Workspace, WorkspaceStatus } from '@app/domain';

// ❌ WRONG
import { WorkspaceService } from '@app/application/services/workspace.service';
```

### 2. Angular 21 Modern Syntax

**Signals (preferred over observables for local state):**
```typescript
export class MyComponent {
  count = signal(0);
  double = computed(() => this.count() * 2);
  
  increment() {
    this.count.update(v => v + 1);  // Use update, NEVER mutate
  }
}
```

**Input/Output with signals:**
```typescript
export class MyComponent {
  title = input.required<string>();      // Input function (no @Input decorator)
  itemClicked = output<string>();        // Output function (no @Output decorator)
  
  onClick() {
    this.itemClicked.emit('value');
  }
}
```

**Component Requirements:**
- Standalone: `standalone: true` (default in Angular 20+, can be omitted)
- Change detection: `changeDetection: ChangeDetectionStrategy.OnPush` (MANDATORY)
- Selector prefix: `app-` (e.g., `app-workspace-card`)
- NO `@HostBinding`/`@HostListener` - use `host` object in decorator instead
- Use `inject()` function instead of constructor DI (preferred)
- **NEVER import CommonModule** in standalone components - import specific directives instead:
  - `NgIf`, `NgFor`, `NgSwitch` → Use native `@if`, `@for`, `@switch` instead (no imports needed)
  - `AsyncPipe`, `DatePipe`, `JsonPipe` → Import from `@angular/common` individually
  - `NgClass`, `NgStyle` → Avoid; use property bindings instead

**Templates:**
- Use native control flow: `@if`, `@for`, `@switch` (NOT `*ngIf`, `*ngFor`, `*ngSwitch`)
- NO `ngClass` - use `[class.active]="isActive"` or `[class]="{'active': isActive}"`
- NO `ngStyle` - use `[style.color]="color"` bindings
- NO arrow functions in templates (not supported)
- Use `async` pipe for observables (import `AsyncPipe` from `@angular/common`)
- Use `NgOptimizedImage` for static images (import from `@angular/common`)

### 3. Firebase Integration

**Never call Firebase directly**. Use `FirebaseAdapter` (already initialized in `app.config.ts`):

```typescript
import { FirebaseAdapter } from '@app/infrastructure/adapters/firebase.adapter';

// Get instances
const auth = FirebaseAdapter.getAuth();
const firestore = FirebaseAdapter.getFirestore();
```

### 4. Service Pattern (Application Layer)

Services use **signals** for reactive state and `inject()` for DI:

```typescript
@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private readonly firestore = inject(Firestore);  // Use inject(), not constructor
  
  readonly workspaces = signal<Workspace[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  
  async getAllWorkspaces(): Promise<Workspace[]> {
    this.isLoading.set(true);
    try {
      const data = await this.fetchData();
      this.workspaces.set(data);
      return data;
    } catch (error: unknown) {
      // Always type catch as unknown, then narrow
      if (error instanceof Error) {
        this.error.set(error.message);
      }
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }
}
```

### 5. Domain Models with Business Logic

Models in `domain/models/` contain business logic methods:

```typescript
export class Workspace implements WorkspaceInterface {
  // ... properties
  
  isHealthy(): boolean {
    return this.status === WorkspaceStatus.ACTIVE;
  }
  
  canSync(): boolean {
    return !this.isDisabled() && !this.hasTokenIssue();
  }
}
```

### 6. Atomic Design Component Organization

- **Atoms** (`components/atoms/`): Single PrimeNG components (badge, button wrapper)
- **Molecules** (`components/molecules/`): 2-3 atoms combined (search-bar = input + button)
- **Organisms** (`components/organisms/`): Complex components (tables, forms, header/footer/sidebar)
- **Pages**: Smart components with service injection and state management
- **Layouts**: Structural wrappers (main-layout with header/sidebar/footer)

## Development Workflows

### Start Development
```bash
npm run start  # Runs ng serve on localhost:4200
```

### Code Quality
```bash
npm run lint          # ESLint check
npm run lint:fix      # Auto-fix linting issues
npm run format        # Prettier format all files
npm run format:check  # Check formatting without changes
```

### Testing
```bash
npm test  # Runs Vitest
```

### Build
```bash
npm run build  # Production build to dist/
```

## Routing Guards

Three critical guards protect routes:
- **`authGuard`**: Requires Firebase authentication (wraps all protected routes)
- **`loginGuard`**: Prevents authenticated users from accessing /login
- **`workspaceGuard`**: Ensures workspace context exists before accessing workspace-specific routes

See [app.routes.ts](src/app/app.routes.ts) for routing structure.

## Naming Conventions (Enforced by ESLint)

- Components/Services/Classes: `PascalCase` (`WorkspaceService`, `LoginPage`)
- Interfaces: `PascalCase` (prefix `I` optional: `IWorkspace` or `Workspace`)
- Files: `kebab-case.suffix.ts` (`workspace.service.ts`, `login.page.ts`)
- Enums: `PascalCase` (`WorkspaceStatus`)
- Constants: `UPPER_SNAKE_CASE` (`API_BASE_URL`)
- Variables/Functions: `camelCase` (`workspaceId`, `getAllWorkspaces()`)

## Key Files Reference

- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md) - Full clean architecture explanation
- **Development**: [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) - Detailed coding examples
- **App Config**: [app.config.ts](src/app/app.config.ts) - DI providers, Firebase init
- **Routing**: [app.routes.ts](src/app/app.routes.ts) - Route structure with guards
- **Firebase**: [infrastructure/adapters/firebase.adapter.ts](src/app/infrastructure/adapters/firebase.adapter.ts)
- **Layer READMEs**: Each layer has a README explaining its purpose and principles

## Common Pitfalls to Avoid

1. **Don't use custom HTML form elements** - Always use PrimeNG components (`<p-inputText>`, `<p-button>`)
2. **Don't import CommonModule** - In standalone components, import specific directives/pipes individually (e.g., `AsyncPipe`)
3. **Don't import domain into infrastructure** - Infrastructure implements domain interfaces, not vice versa
4. **Don't use RxJS for local component state** - Use signals (`signal()`, `computed()`)
5. **Don't skip barrel exports** - Always import via `@app/domain`, `@app/application`, etc.
6. **Don't forget standalone: true** - All components must be standalone in Angular 21
7. **Don't skip change detection strategy** - Always use `OnPush`
8. **Don't call Firebase directly** - Use `FirebaseAdapter` methods
9. **Don't use `any` type** - Use `unknown` for uncertain types, then narrow with type guards
10. **Don't use `var`** - Always use `const` (default) or `let` when reassignment needed
11. **Don't use `==` or `!=`** - Always use `===` and `!==` (except for `null` checks)
12. **Don't use arrow functions in templates** - Not supported by Angular compiler
13. **Don't mutate signals directly** - Use `set()` or `update()` methods

## When Creating New Features

1. **Domain first**: Define interfaces/models in `domain/` (pure TS, no framework imports)
2. **Application services**: Create service in `application/services/` using domain types
3. **Infrastructure**: Implement external integrations in `infrastructure/adapters/`
4. **Presentation**: Build UI bottom-up (Atom → Molecule → Organism → Page)
5. **Update barrel exports**: Add exports to `index.ts` in each layer
6. **Guard if needed**: Add route guards in `application/guards/`

## Additional Context

- **Encryption**: Hostinger API tokens are encrypted via `EncryptionService` before Firestore storage
- **Workspace Context**: `WorkspaceContextService` manages current workspace selection
- **PrimeNG Theme**: Lara preset configured in `app.config.ts` with dark mode support
- **ESLint**: Strict naming conventions enforced - see [eslint.config.js](eslint.config.js)

## TypeScript & Code Quality Standards

### Type Safety
- Use **strict type checking** - enabled in `tsconfig.json`
- Prefer **type inference** when obvious: `const x = 5` (not `const x: number = 5`)
- **Never use `any`** - use `unknown` and narrow with type guards
- Catch blocks must type as `unknown`: `catch (error: unknown)`
- Explicitly specify generics for empty collections: `new Set<string>()`

### Variables & Functions
- Use `const` by default, `let` only when reassignment needed (NEVER `var`)
- Use arrow functions for callbacks and inline functions
- Top-level functions: use function declarations (`function foo() {}`)
- Prefer named imports over namespace imports for frequently used symbols
- Use spread syntax (`[...arr]`) over `.concat()` or manual copying

### Error Handling
- Only throw `Error` instances (or subclasses), never strings or primitives
- Always include error messages: `throw new Error('Workspace not found')`
- Use try/catch/finally patterns with proper cleanup
- Don't use empty catch blocks - document why if truly needed

### Arrays & Objects
- Use `[]` for arrays, never `new Array()` constructor
- Use object/array destructuring when unpacking multiple values
- Prefer `for...of` over `.forEach()` or index-based loops
- Use `Object.keys()`, `Object.values()`, `Object.entries()` over `for...in`

### Comments & Documentation
- Use `/** JSDoc */` for public APIs (functions, classes, exported symbols)
- Use `//` for implementation comments
- Document the "why", not the "what" - code should be self-documenting
- Use `@param` and `@return` only when adding information beyond the type

### Accessibility (MUST PASS)
- All components MUST pass AXE accessibility checks
- Follow WCAG AA minimums (color contrast, focus management, ARIA)
- Use semantic HTML with PrimeNG components
- Provide proper labels and ARIA attributes for interactive elements
