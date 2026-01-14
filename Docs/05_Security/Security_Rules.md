# Firestore Security Rules - Documentación

## Índice

1. [Visión General](#visión-general)
2. [Arquitectura de Seguridad](#arquitectura-de-seguridad)
3. [Funciones Helper](#funciones-helper)
4. [Reglas por Colección](#reglas-por-colección)
5. [Validaciones de Datos](#validaciones-de-datos)
6. [Campos Inmutables](#campos-inmutables)
7. [Testing](#testing)
8. [Despliegue](#despliegue)

---

## Visión General

Las reglas de seguridad de Firestore implementan un modelo **fail-closed** (denegar por defecto) que protege todos los datos de la aplicación. Están diseñadas para una aplicación personal de un solo propietario.

### Principios de Seguridad

1. **Deny by Default**: Todo acceso está denegado a menos que se permita explícitamente
2. **Data Validation**: Todas las escrituras validan estructura y tipos de datos
3. **Immutable Fields**: Campos críticos (IDs, timestamps de creación) son inmutables
4. **No Privilege Escalation**: No es posible elevar privilegios modificando datos
5. **Workspace Isolation**: Cada workspace está aislado (importante para futuras expansiones)

### Modelo de Autenticación

- **Owner UID**: `HnIKbU4OUoWQurj03y8pRrgxeMl2` (hardcoded)
- **Cloud Functions**: Usan Admin SDK (bypass rules)
- **Frontend**: Requiere autenticación con el UID del owner

---

## Arquitectura de Seguridad

```
┌─────────────────────────────────────────────────────────────┐
│                    FIRESTORE DATABASE                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌─────────────────┐                 │
│  │   Frontend   │──────│  Auth Check     │                 │
│  │   (Angular)  │      │  isOwner()      │                 │
│  └──────────────┘      └─────────────────┘                 │
│         │                       │                            │
│         │              ┌────────▼──────────┐                │
│         └──────────────│  Security Rules   │                │
│                        │  - Validation     │                │
│                        │  - Immutability   │                │
│                        │  - Type Checking  │                │
│                        └────────┬──────────┘                │
│                                 │                            │
│  ┌──────────────┐               │                            │
│  │   Cloud      │      ┌────────▼──────────┐                │
│  │  Functions   │──────│  Admin SDK        │                │
│  │  (Bypass)    │      │  (No Rules Check) │                │
│  └──────────────┘      └───────────────────┘                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Funciones Helper

### Autenticación

```javascript
function isOwner() {
  return request.auth != null && 
         request.auth.uid == 'HnIKbU4OUoWQurj03y8pRrgxeMl2';
}
```

### Operaciones

```javascript
function isCreating() {
  return request.method == 'create';
}

function isUpdating() {
  return request.method == 'update';
}

function isDeleting() {
  return request.method == 'delete';
}
```

### Validación de Inmutabilidad

```javascript
function immutableFieldsValid(fields) {
  return !isUpdating() || 
         fields.toSet().intersection(
           request.resource.data.diff(resource.data).affectedKeys()
         ).size() == 0;
}
```

**Uso**: `immutableFieldsValid(['createdAt', 'workspaceId'])`

### Validación de Tipos

```javascript
function isValidString(field)         // String no vacío
function isValidOptionalString(field)  // String opcional no vacío
function isValidBoolean(field)         // Boolean
function isValidNumber(field)          // Number
function isValidTimestamp(field)       // Timestamp
```

---

## Reglas por Colección

### 1. `workspaces`

**Permisos**:
- **Read**: Owner ✅
- **Create**: Owner ✅ + Validación de datos
- **Update**: Owner ✅ + Campos inmutables protegidos
- **Delete**: Owner ✅

**Campos Requeridos** (create):
- `name`: String (1-100 caracteres)
- `status`: Enum ['ACTIVE', 'REQUIRES_ATTENTION', 'INACTIVE']
- `createdAt`: Timestamp
- `disabled`: Boolean

**Campos Opcionales**:
- `encryptedToken`: String (si existe, no vacío)
- `lastError`: String (si existe, no vacío)
- `lastSyncAt`: Timestamp
- `lastSyncStatus`: String

**Campos Inmutables** (update):
- `createdAt`
- `id`

**Validaciones Especiales**:
- `name`: Máximo 100 caracteres
- `status`: Solo valores permitidos del enum

---

### 2. `domains`

**Permisos**:
- **Read**: Owner ✅
- **Create**: Owner ✅ (Cloud Functions)
- **Update**: Owner ✅ + Inmutabilidad
- **Delete**: Owner ✅

**Campos Requeridos** (create):
- `workspaceId`: String (referencia al workspace)
- `domainName`: String (nombre del dominio)
- `expiresAt`: Timestamp (fecha de expiración)
- `syncedAt`: Timestamp (última sincronización)

**Campos Inmutables** (update):
- `workspaceId` (no se puede mover a otro workspace)
- `domainName` (identificador único)

**Campos Opcionales**:
- `createdAt`: Timestamp
- `nameservers`: Array
- `domainLock`: Boolean
- `privacyProtection`: Boolean
- `raw`: Map (datos crudos de Hostinger API)

---

### 3. `subscriptions`

**Permisos**:
- **Read**: Owner ✅
- **Create**: Owner ✅ (Cloud Functions)
- **Update**: Owner ✅ + Inmutabilidad
- **Delete**: Owner ✅

**Campos Requeridos** (create):
- `workspaceId`: String
- `subscriptionId`: String (ID único de Hostinger)
- `productName`: String
- `expiresAt`: Timestamp
- `syncedAt`: Timestamp

**Campos Inmutables** (update):
- `workspaceId`
- `subscriptionId`

**Campos Opcionales**:
- `nextBillingAt`: Timestamp
- `autoRenew`: Boolean
- `status`: String
- `raw`: Map

---

### 4. `alert_rules`

**Permisos**:
- **Read**: Owner ✅
- **Create**: Owner ✅
- **Update**: Owner ✅ + Inmutabilidad
- **Delete**: Owner ✅

**Campos Requeridos** (create):
- `workspaceId`: String
- `daysBefore`: Number (> 0)
- `channel`: Enum ['EMAIL', 'SLACK', 'WEBHOOK', 'LOG_ONLY']
- `enabled`: Boolean
- `createdAt`: Timestamp

**Campos Inmutables** (update):
- `workspaceId`
- `createdAt`

**Validaciones Especiales**:
- `daysBefore`: Debe ser mayor a 0
- `channel`: Solo valores permitidos

**Campos Opcionales**:
- `emailRecipients`: Array
- `slackWebhook`: String
- `webhookUrl`: String

---

### 5. `alert_logs`

**Permisos**:
- **Read**: Owner ✅
- **Create**: Owner ✅ (Cloud Functions)
- **Update**: Owner ✅ (solo para marcar como procesado)
- **Delete**: Owner ✅

**Campos Requeridos** (create):
- `workspaceId`: String
- `entityType`: Enum ['domain', 'subscription']
- `entityId`: String (referencia a domain/subscription)
- `daysBefore`: Number (días antes de expirar)
- `createdAt`: Timestamp

**Campos Inmutables** (update):
- `workspaceId`
- `entityType`
- `entityId`
- `daysBefore`
- `createdAt`

**Campos Opcionales**:
- `processed`: Boolean
- `processedAt`: Timestamp
- `alertRuleId`: String
- `expiresAt`: Timestamp
- `entityName`: String

---

### 6. `audit_logs` ⚠️ IMMUTABLE

**Permisos**:
- **Read**: Owner ✅
- **Create**: Owner ✅ (Cloud Functions)
- **Update**: ❌ DENEGADO (audit logs son inmutables)
- **Delete**: Owner ✅ (solo para cleanup/GDPR)

**Campos Requeridos** (create):
- `action`: String (pattern: `^(workspace|token|sync|alert|dns)\\..*$`)
- `actorUid`: String (UID del usuario)
- `actorEmail`: String (email del usuario)
- `status`: Enum ['success', 'failed', 'partial']
- `createdAt`: Timestamp

**Campos Opcionales**:
- `workspaceId`: String (si la acción está relacionada con un workspace)
- `meta`: Map (metadatos adicionales)
- `error`: String (mensaje de error si status = 'failed')

**Validaciones Especiales**:
- `action`: Debe seguir el patrón `<category>.<action>` (ej: `workspace.create`, `sync.manual`)
- **NO SE PERMITEN UPDATES**: Los audit logs son inmutables para mantener integridad

**Ejemplos de Actions**:
- `workspace.create`, `workspace.update`, `workspace.delete`
- `token.test`, `token.save`
- `sync.manual`, `sync.scheduled`
- `alert.generate`
- `dns.update`

---

### 7. `sync_runs`

**Permisos**:
- **Read**: Owner ✅
- **Create**: Owner ✅ (Cloud Functions)
- **Update**: Owner ✅ + Inmutabilidad + Transiciones válidas
- **Delete**: Owner ✅

**Campos Requeridos** (create):
- `workspaceId`: String
- `startAt`: Timestamp (inicio de sincronización)
- `status`: Enum ['running', 'completed', 'failed', 'partial']

**Campos Inmutables** (update):
- `workspaceId`
- `startAt`

**Validaciones Especiales**:
- `status`: En updates, solo puede cambiar a 'completed', 'failed', o 'partial'
- No se permite volver a 'running' desde un estado final

**Campos Opcionales**:
- `endAt`: Timestamp
- `domainsProcessed`: Number
- `subscriptionsProcessed`: Number
- `errors`: Array
- `type`: String ('single', 'batch')
- `trigger`: String ('manual', 'scheduled')

---

### 8. `dns_snapshots` (Future)

**Permisos**:
- **Read**: Owner ✅
- **Create**: Owner ✅
- **Update**: Owner ✅ + Inmutabilidad
- **Delete**: Owner ✅

**Campos Requeridos** (create):
- `workspaceId`: String
- `domainId`: String
- `recordType`: Enum ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA']
- `createdAt`: Timestamp

**Campos Inmutables** (update):
- `workspaceId`
- `domainId`
- `createdAt`

---

### 9. `dns_validations` (Future)

**Permisos**:
- **Read**: Owner ✅
- **Create**: Owner ✅
- **Update**: Owner ✅ + Inmutabilidad
- **Delete**: Owner ✅

**Campos Requeridos** (create):
- `workspaceId`: String
- `domainId`: String
- `status`: Enum ['pending', 'valid', 'invalid', 'error']
- `createdAt`: Timestamp

**Campos Inmutables** (update):
- `workspaceId`
- `domainId`
- `createdAt`

---

## Validaciones de Datos

### Tipos Soportados

| Tipo       | Función Helper            | Validación                         |
|------------|---------------------------|------------------------------------|
| String     | `isValidString(field)`    | No vacío, tipo string              |
| String Opt | `isValidOptionalString()` | Si existe, no vacío                |
| Boolean    | `isValidBoolean(field)`   | Tipo boolean                       |
| Number     | `isValidNumber(field)`    | Tipo number                        |
| Timestamp  | `isValidTimestamp(field)` | Tipo timestamp                     |

### Enums Validados

**Workspace Status**:
```javascript
status in ['ACTIVE', 'REQUIRES_ATTENTION', 'INACTIVE']
```

**Entity Type** (alerts):
```javascript
entityType in ['domain', 'subscription']
```

**Alert Channel**:
```javascript
channel in ['EMAIL', 'SLACK', 'WEBHOOK', 'LOG_ONLY']
```

**Audit Status**:
```javascript
status in ['success', 'failed', 'partial']
```

**Sync Run Status**:
```javascript
status in ['running', 'completed', 'failed', 'partial']
```

**DNS Record Type**:
```javascript
recordType in ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA']
```

**DNS Validation Status**:
```javascript
status in ['pending', 'valid', 'invalid', 'error']
```

---

## Campos Inmutables

### Por Colección

| Colección       | Campos Inmutables                             |
|-----------------|-----------------------------------------------|
| workspaces      | `createdAt`, `id`                             |
| domains         | `workspaceId`, `domainName`                   |
| subscriptions   | `workspaceId`, `subscriptionId`               |
| alert_rules     | `workspaceId`, `createdAt`                    |
| alert_logs      | `workspaceId`, `entityType`, `entityId`, `daysBefore`, `createdAt` |
| audit_logs      | **TODOS** (no se permiten updates)            |
| sync_runs       | `workspaceId`, `startAt`                      |
| dns_snapshots   | `workspaceId`, `domainId`, `createdAt`        |
| dns_validations | `workspaceId`, `domainId`, `createdAt`        |

### Rationale

- **`createdAt`**: Marca temporal de creación, debe ser inmutable
- **`workspaceId`**: Previene mover documentos entre workspaces
- **`id` fields**: Identificadores únicos no deben cambiar
- **`audit_logs`**: Inmutabilidad total para integridad de auditoría

---

## Testing

### Testing Local con Emulator

```bash
# Iniciar emuladores
firebase emulators:start

# Las reglas se cargan desde firestore.rules automáticamente
```

### Casos de Prueba Recomendados

#### 1. Test Autenticación

```javascript
// ✅ Owner autenticado puede leer workspaces
test('Authenticated owner can read workspaces', async () => {
  const db = getFirestore(ownerAuth);
  await assertSucceeds(
    getDoc(doc(db, 'workspaces', 'test-id'))
  );
});

// ❌ Usuario no autenticado no puede leer
test('Unauthenticated user cannot read', async () => {
  const db = getFirestore(null);
  await assertFails(
    getDoc(doc(db, 'workspaces', 'test-id'))
  );
});
```

#### 2. Test Validación de Datos

```javascript
// ❌ No puede crear workspace sin campos requeridos
test('Cannot create workspace without required fields', async () => {
  const db = getFirestore(ownerAuth);
  await assertFails(
    setDoc(doc(db, 'workspaces', 'new-id'), {
      name: 'Test'
      // Falta status, createdAt, disabled
    })
  );
});

// ✅ Puede crear workspace con todos los campos
test('Can create workspace with valid data', async () => {
  const db = getFirestore(ownerAuth);
  await assertSucceeds(
    setDoc(doc(db, 'workspaces', 'new-id'), {
      name: 'Test Workspace',
      status: 'ACTIVE',
      createdAt: serverTimestamp(),
      disabled: false
    })
  );
});
```

#### 3. Test Campos Inmutables

```javascript
// ❌ No puede cambiar workspaceId en domains
test('Cannot modify workspaceId in domain', async () => {
  const db = getFirestore(ownerAuth);
  await assertFails(
    updateDoc(doc(db, 'domains', 'domain-id'), {
      workspaceId: 'different-workspace-id'
    })
  );
});
```

#### 4. Test Audit Logs Inmutables

```javascript
// ❌ No puede actualizar audit logs
test('Cannot update audit logs', async () => {
  const db = getFirestore(ownerAuth);
  await assertFails(
    updateDoc(doc(db, 'audit_logs', 'log-id'), {
      status: 'success'
    })
  );
});
```

---

## Despliegue

### 1. Validar Reglas Localmente

```bash
# Usar emulador
firebase emulators:start

# Ejecutar tests (si tienes)
npm run test:rules
```

### 2. Desplegar a Producción

```bash
# Solo reglas de Firestore
firebase deploy --only firestore:rules

# Con mensaje descriptivo
firebase deploy --only firestore:rules -m "Issue #21: Comprehensive security rules with validation"
```

### 3. Verificar Despliegue

```bash
# Ver reglas en Firebase Console
# https://console.firebase.google.com/project/[PROJECT_ID]/firestore/rules
```

### 4. Monitorear Errores

Después del despliegue, monitorear logs en Firebase Console:

```
Firebase Console > Firestore > Rules > Playground
```

Probar queries comunes:
- Read workspaces as owner
- Create domain as owner
- Update audit log (should fail)
- Read as unauthenticated (should fail)

---

## Mejores Prácticas

### ✅ DO

1. **Siempre validar datos de entrada** en creates/updates
2. **Proteger campos inmutables** con `immutableFieldsValid()`
3. **Usar enums** para campos con valores limitados
4. **Documentar validaciones especiales** en comentarios
5. **Probar reglas** con Firebase Emulator antes de desplegar
6. **Usar funciones helper** para reutilizar lógica

### ❌ DON'T

1. **No confiar en datos del cliente** - siempre validar en server-side
2. **No usar `allow read, write`** genérico - separar operaciones
3. **No hardcodear valores** mágicos - usar constantes/enums
4. **No permitir modificar campos de auditoría** (createdAt, IDs)
5. **No exponer información sensible** en mensajes de error
6. **No olvidar la regla de deny-all** al final

---

## Troubleshooting

### Error: "PERMISSION_DENIED: Missing or insufficient permissions"

**Causa**: Usuario no autenticado o no es el owner

**Solución**:
1. Verificar que `request.auth.uid` coincide con el UID hardcoded
2. Revisar que el token de autenticación no haya expirado
3. Verificar en Firebase Console > Authentication que el usuario existe

### Error: "INVALID_ARGUMENT: Document does not match required schema"

**Causa**: Datos enviados no cumplen validaciones

**Solución**:
1. Revisar los campos requeridos para esa colección
2. Validar tipos de datos (string, number, timestamp, boolean)
3. Verificar valores de enums
4. Comprobar que campos opcionales no estén vacíos

### Error: "FAILED_PRECONDITION: Cannot modify immutable field"

**Causa**: Intentando modificar un campo inmutable

**Solución**:
1. Revisar lista de campos inmutables de la colección
2. Remover esos campos del objeto de update
3. Si es necesario cambiarlos, eliminar y recrear el documento

---

## Changelog

### 2026-01-09 - v1.0.0 (Issue #21)
- ✅ Implementación completa de security rules
- ✅ Validación granular por colección
- ✅ Funciones helper reutilizables
- ✅ Protección de campos inmutables
- ✅ Validación de tipos y enums
- ✅ Audit logs inmutables
- ✅ Reglas para colecciones futuras (DNS)
- ✅ Documentación exhaustiva

---

## Referencias

- [Firestore Security Rules Reference](https://firebase.google.com/docs/firestore/security/get-started)
- [Security Rules Unit Testing](https://firebase.google.com/docs/rules/unit-tests)
- [Common Security Rules Patterns](https://firebase.google.com/docs/firestore/security/rules-conditions)
