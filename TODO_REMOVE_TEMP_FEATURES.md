# TODO - Elementos Temporales para Eliminar

## 🧪 Funcionalidad de Testing - Sincronización Batch Manual

Los siguientes elementos fueron agregados **temporalmente** para probar la sincronización batch antes de las 03:00 AM. Deben ser **eliminados después de las pruebas**.

---

### 📝 Archivos Modificados

#### 1. `workspace.service.ts`
**Línea ~35:**
```typescript
private readonly syncAllUrl = 'https://us-central1-hostinger-workspace-manager.cloudfunctions.net/syncAllWorkspaces';
```
**Acción:** ❌ ELIMINAR esta línea

**Línea ~350-430 (método completo):**
```typescript
async syncAllWorkspaces(): Promise<{...}> {
  // ... todo el método
}
```
**Acción:** ❌ ELIMINAR todo el método `syncAllWorkspaces()`

---

#### 2. `workspaces.page.ts`
**Línea ~60:**
```typescript
readonly isSyncingAll = signal<boolean>(false); // TEMP: For testing batch sync
```
**Acción:** ❌ ELIMINAR este signal

**Línea ~290-340 (método completo):**
```typescript
async syncAllWorkspaces(): Promise<void> {
  // ... todo el método con confirmación
}
```
**Acción:** ❌ ELIMINAR todo el método `syncAllWorkspaces()`

---

#### 3. `workspaces.page.html`
**Líneas ~9-19 (botón completo):**
```html
<!-- TEMP: Batch Sync Button (remove after testing) -->
<p-button
  label="🧪 Sincronizar Todos"
  icon="pi pi-sync"
  severity="warning"
  [outlined]="true"
  [loading]="isSyncingAll()"
  (onClick)="syncAllWorkspaces()"
  pTooltip="TEMP: Test batch sync (producción usa cron job a las 03:00 AM)"
  tooltipPosition="bottom"
/>
```
**Acción:** ❌ ELIMINAR todo el botón

**Restaurar:**
```html
<p-button
  label="Nuevo Workspace"
  icon="pi pi-plus"
  (onClick)="createWorkspace()"
/>
```
(Eliminar el `<div class="flex gap-2">` wrapper y dejar solo el botón de Nuevo Workspace)

---

### ✅ Checklist de Eliminación

Después de validar que el cron job funciona correctamente:

- [ ] Eliminar `syncAllUrl` en `workspace.service.ts`
- [ ] Eliminar método `syncAllWorkspaces()` en `workspace.service.ts`
- [ ] Eliminar signal `isSyncingAll` en `workspaces.page.ts`
- [ ] Eliminar método `syncAllWorkspaces()` en `workspaces.page.ts`
- [ ] Eliminar botón "🧪 Sincronizar Todos" en `workspaces.page.html`
- [ ] Restaurar estructura original del header (solo botón "Nuevo Workspace")
- [ ] Eliminar este archivo `TODO_REMOVE_TEMP_FEATURES.md`

---

### 🔍 Cómo Verificar que el Cron Job Funciona

**Opción 1: Ver logs después de las 03:00 AM**
```bash
firebase functions:log --only syncAllWorkspacesScheduled
```

**Opción 2: Verificar `sync_runs` en Firestore**
```javascript
db.collection('sync_runs')
  .where('type', '==', 'batch')
  .where('trigger', '==', 'scheduled')
  .orderBy('startAt', 'desc')
  .limit(1)
```

**Opción 3: Ejecutar manualmente vía Cloud Scheduler**
Google Cloud Console → Cloud Scheduler → Seleccionar job → "RUN NOW"

---

### 📅 Fecha de Creación
8 de enero de 2026

### ⏰ Próxima Ejecución Automática
9 de enero de 2026 a las 03:00 AM (America/Bogota)
