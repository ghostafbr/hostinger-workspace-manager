# Logs y Auditoría - Sincronización de Workspaces

## Índice
- [Colección sync_runs](#colección-sync_runs)
- [Logs en Cloud Functions](#logs-en-cloud-functions)
- [Circuit Breaker](#circuit-breaker)
- [Monitoreo](#monitoreo)

---

## Colección `sync_runs`

Cada ejecución de sincronización (individual o batch) se registra en Firestore.

### Tipos de Sync Runs

#### 1. Sync Individual (Manual/Scheduled)
```typescript
{
  workspaceId: string;           // ID del workspace sincronizado
  trigger: 'manual' | 'scheduled'; // Origen de la sincronización
  startAt: Timestamp;            // Inicio de ejecución
  endAt?: Timestamp;             // Fin de ejecución
  status: 'running' | 'completed' | 'failed'; // Estado
  domainsProcessed: number;      // Cantidad de dominios sincronizados
  subscriptionsProcessed: number; // Cantidad de suscripciones sincronizadas
  errors: string[];              // Lista de errores (si los hay)
}
```

#### 2. Sync Batch (Todos los workspaces)
```typescript
{
  type: 'batch';                 // Tipo de sincronización
  trigger: 'manual' | 'scheduled'; // Origen
  startAt: Timestamp;
  endAt?: Timestamp;
  status: 'running' | 'completed' | 'failed';
  totalWorkspaces: number;       // Total de workspaces procesados
  successCount: number;          // Cantidad de éxitos
  failureCount: number;          // Cantidad de fallos
  skippedCount: number;          // Workspaces saltados (circuit breaker)
  disabledCount: number;         // Workspaces deshabilitados por errores
  error?: string;                // Error global (si hay)
}
```

### Consultas Útiles

**Sync runs por workspace:**
```javascript
db.collection('sync_runs')
  .where('workspaceId', '==', 'workspace_id')
  .orderBy('startAt', 'desc')
  .limit(10);
```

**Sync runs batch recientes:**
```javascript
db.collection('sync_runs')
  .where('type', '==', 'batch')
  .orderBy('startAt', 'desc')
  .limit(5);
```

**Sync runs con errores:**
```javascript
db.collection('sync_runs')
  .where('status', '==', 'failed')
  .orderBy('startAt', 'desc');
```

---

## Logs en Cloud Functions

Los logs se pueden ver en:
- **Firebase Console**: Functions → Logs
- **Google Cloud Console**: [Cloud Logging](https://console.cloud.google.com/logs)

### Estructura de Logs

#### Inicio de Sync Batch
```
🕐 Starting scheduled sync for all workspaces
{
  timestamp: "2026-01-08T08:00:00.000Z",
  trigger: "scheduled"
}
```

#### Procesamiento de Workspace
```
🔄 Processing workspace: ws_abc123
```

#### Circuit Breaker Activado
```
⚠️ Circuit breaker triggered for workspace ws_abc123
{
  consecutiveErrors: 3
}
```

#### Workspace Saltado
```
⏭️ Skipping workspace ws_abc123 (circuit breaker)
{
  consecutiveErrors: 3
}
```

#### Rate Limiting
```
⏳ Waiting 2000ms before next workspace...
```

#### Resumen Final
```
✅ Scheduled sync completed
{
  totalWorkspaces: 10,
  successCount: 8,
  failureCount: 1,
  skippedCount: 1,
  disabledCount: 1
}
```

---

## Circuit Breaker

### Funcionamiento

El circuit breaker protege contra workspaces con errores persistentes:

1. **Contador de errores**: Cada fallo incrementa `consecutiveErrors` en el workspace
2. **Umbral**: Si `consecutiveErrors >= 3`, se activa el circuit breaker
3. **Acción**: El workspace se marca como `REQUIRES_ATTENTION`
4. **Prevención**: Los próximos syncs saltan este workspace automáticamente

### Campos en Workspace

```typescript
{
  consecutiveErrors: number;      // Contador de errores consecutivos
  status: 'ACTIVE' | 'REQUIRES_ATTENTION'; // Estado del workspace
  disabledReason?: string;        // Razón de deshabilitación
  lastError?: string;             // Último error registrado
  lastSyncStatus: 'success' | 'failed'; // Estado del último sync
}
```

### Reset del Circuit Breaker

El contador se resetea automáticamente cuando hay un sync exitoso:

```typescript
{
  consecutiveErrors: 0,  // Se pone a 0 en caso de éxito
  lastSyncStatus: 'success',
  lastError: null
}
```

### Recuperación Manual

Para reactivar un workspace deshabilitado:

1. Corregir el problema (ej: renovar API token)
2. Actualizar el workspace:
```javascript
await db.collection('workspaces').doc(workspaceId).update({
  status: 'ACTIVE',
  consecutiveErrors: 0,
  disabledReason: null,
  lastError: null
});
```

---

## Monitoreo

### Métricas Clave

**1. Tasa de Éxito**
```
success_rate = successCount / totalWorkspaces
```

**2. Workspaces con Problemas**
```javascript
db.collection('workspaces')
  .where('status', '==', 'REQUIRES_ATTENTION')
  .get();
```

**3. Workspaces con Errores Recientes**
```javascript
db.collection('workspaces')
  .where('lastSyncStatus', '==', 'failed')
  .where('status', '==', 'ACTIVE')
  .get();
```

**4. Historial de Batch Syncs**
```javascript
db.collection('sync_runs')
  .where('type', '==', 'batch')
  .orderBy('startAt', 'desc')
  .limit(30); // Últimos 30 días
```

### Alertas Recomendadas

1. **Tasa de éxito < 80%**
   - Revisar logs de Cloud Functions
   - Verificar estado de Hostinger API

2. **Más de 3 workspaces en REQUIRES_ATTENTION**
   - Investigar patrón común
   - Revisar tokens API

3. **Sync batch tardando > 5 minutos**
   - Optimizar rate limiting
   - Considerar paralelización

### Dashboard en Firebase Console

Puedes crear consultas guardadas en Firestore para monitoreo:

**Últimos Syncs:**
```
Collection: sync_runs
Order by: startAt DESC
Limit: 20
```

**Workspaces Problemáticos:**
```
Collection: workspaces
Where: status == 'REQUIRES_ATTENTION'
```

---

## Ejecución Manual de Batch Sync

Además del cron job diario, puedes ejecutar manualmente:

### Via HTTP (desde la UI)

```typescript
// Llamar desde Angular service
const response = await this.http.post(
  'https://us-central1-hostinger-workspace-manager.cloudfunctions.net/syncAllWorkspaces',
  {},
  {
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    }
  }
);
```

### Via Firebase CLI

```bash
# Trigger manual desde terminal
firebase functions:shell

# Luego ejecutar:
syncAllWorkspacesScheduled({ scheduleTime: new Date().toISOString() })
```

---

## Troubleshooting

### Problema: Workspace deshabilitado incorrectamente

**Solución:**
```javascript
// Resetear workspace
await db.collection('workspaces').doc(workspaceId).update({
  status: 'ACTIVE',
  consecutiveErrors: 0,
  disabledReason: null
});
```

### Problema: Sync batch tardando mucho

**Causas posibles:**
- Muchos workspaces activos
- Rate limiting muy conservador (2s por workspace)

**Solución:**
```typescript
// Ajustar en syncAllWorkspaces.ts
const RATE_LIMIT_DELAY_MS = 1000; // Reducir a 1 segundo
```

### Problema: Errores de API de Hostinger

**Verificar:**
1. Status de Hostinger API: https://developers.hostinger.com
2. Tokens válidos en workspaces
3. Límites de rate de Hostinger API

---

## Configuración del Cron Job

El job está configurado en `syncAllWorkspaces.ts`:

```typescript
export const syncAllWorkspacesScheduled = onSchedule(
  {
    schedule: '0 3 * * *',      // Cron: todos los días a las 03:00
    timeZone: 'America/Bogota', // Zona horaria Colombia
    region: 'us-central1',      // Región de Cloud Function
  },
  async (event) => {
    // Lógica de sincronización...
  }
);
```

### Modificar Horario

Para cambiar el horario, edita el campo `schedule`:

```typescript
schedule: '0 3 * * *',  // 03:00 AM diario
schedule: '0 */6 * * *', // Cada 6 horas
schedule: '0 2 * * 1',  // 02:00 AM solo Lunes
```

Formato Cron: `minuto hora día mes día_semana`

---

## Resumen de Criterios de Aceptación

✅ **Criterio 1**: Workspaces activos se sincronizan a las 03:00 AM
- Implementado: `syncAllWorkspacesScheduled` con cron `0 3 * * *`

✅ **Criterio 2**: Circuit breaker para workspaces con 3+ errores
- Implementado: `MAX_CONSECUTIVE_ERRORS = 3`
- Acción: Status cambia a `REQUIRES_ATTENTION`

✅ **Criterio 3**: Registros en `sync_runs` por workspace
- Implementado: Cada sync crea documento con start/end, conteos, estado

✅ **Criterio 4**: Rate limiting con backoff
- Implementado: Delay de 2s entre workspaces
- Error global se loguea y se registra en `sync_runs`
