# Nuevas Funcionalidades Implementadas

## 📋 Resumen

Se han implementado las siguientes funcionalidades opcionales para mejorar la gestión de dominios y automatización de alertas:

## ✅ Funcionalidades Completadas

### 1. UI para Gestión de Dominios

**Ubicación**: `src/app/presentation/pages/domains/`

**Características**:
- ✅ Ver todos los dominios sincronizados del workspace
- ✅ Editar `contactEmail` y precios (`hostingRenewalPrice`, `domainRenewalPrice`)
- ✅ Ver estado de dominios con semáforo (crítico/advertencia/activo/expirado)
- ✅ Filtrar por nombre y días hasta expiración
- ✅ Ver qué dominios tienen alertas activas

**Componentes Creados**:
- `domain-edit-dialog.component.ts` - Diálogo para editar información del dominio
- `domain-stats-widget.component.ts` - Widget de estadísticas (total, expirados, críticos, etc.)
- Actualización de `domains-table.component` - Botones de edición y tooltips

**Servicios**:
- `DomainService` mejorado con métodos:
  - `getDomainById()` - Obtener dominio individual
  - `updateDomain()` - Actualizar email y precios
  - `getDomainStatistics()` - Estadísticas para dashboard
  - `getDomainsGroupedByMonth()` - Agrupación por mes para gráficas

### 2. Dashboard de Monitoreo

**Ubicación**: Ya existía en `src/app/presentation/pages/dashboard/`

**Características Agregadas**:
- ✅ Widget de estadísticas de dominios
- ✅ Datos agrupados por fecha de vencimiento (lista para gráficas)
- ✅ Métricas: total, expirados, críticos, advertencia, activos, valor total

**Uso**:
```typescript
// En dashboard.page.ts
const stats = await this.domainService.getDomainStatistics(workspaceId);
const grouped = await this.domainService.getDomainsGroupedByMonth(workspaceId);
```

### 3. Programación de runGenerateAlerts (Scheduler)

**Ubicación**: `functions/src/generateAlertsScheduled.ts`

**Características**:
- ✅ Función programada que se ejecuta automáticamente cada día a las 8:00 AM (hora Colombia)
- ✅ Procesa dominios y crea alertas según umbrales configurados
- ✅ No requiere intervención manual

**Configuración**:
```typescript
schedule: '0 8 * * *',  // Cada día a las 8 AM
timeZone: 'America/Bogota',
memory: '512MiB',
maxInstances: 1
```

**Despliegue**:
```bash
cd functions
firebase deploy --only functions:generateAlertsScheduled
```

### 4. Recordatorios Escalonados

**Ubicación**: `functions/src/generateAlertsScheduled.ts`

**Niveles de Recordatorio**:
- ✅ **30 días antes**: Informativo (`severity: 'info'`)
- ✅ **15 días antes**: Recordatorio (`severity: 'warning'`)
- ✅ **7 días antes**: Urgente (`severity: 'urgent'`)
- ✅ **3 días antes**: Crítico (`severity: 'critical'`)

**Tipos de Alerta Creados**:
- `domain_expiring_30`
- `domain_expiring_15`
- `domain_expiring_7`
- `domain_expiring_3`

**Prevención de Duplicados**:
- Verifica alertas existentes antes de crear nuevas
- Solo crea alerta si no existe una pendiente del mismo tipo para el mismo dominio

### 5. Webhook de Confirmación de Pago (Wompi)

**Ubicación**: `functions/src/wompiWebhook.ts`

**Características**:
- ✅ Recibe webhooks de Wompi cuando un pago es aprobado
- ✅ Valida firma de integridad del webhook
- ✅ Marca dominios como renovados automáticamente
- ✅ Cancela alertas pendientes relacionadas al dominio pagado
- ✅ Envía email de confirmación al cliente
- ✅ Registra pago en colección `payments`

**Endpoint**: `https://[PROJECT_ID].cloudfunctions.net/wompiWebhook`

**Configuración en Wompi**:
1. Ir a dashboard de Wompi
2. Configurar URL del webhook: `https://wompiwebhook-[hash]-uc.a.run.app`
3. Seleccionar evento: `transaction.updated`
4. Agregar `WOMPI_INTEGRITY_KEY` a `.env` en functions:

```env
WOMPI_INTEGRITY_KEY=tu_integrity_key_aqui
```

**Validación de Firma**:
```typescript
// Formato: timestamp.signature
// Payload: timestamp.evento_json
// Algoritmo: HMAC-SHA256
```

**Flujo de Pago**:
1. Usuario hace clic en link de pago Wompi (generado en email)
2. Wompi procesa el pago
3. Wompi envía webhook con `status: APPROVED`
4. Cloud Function valida webhook
5. Busca dominio por `reference` (formato: `dominio-timestamp`)
6. Crea registro en `payments` collection
7. Cancela alertas pendientes del dominio
8. Envía email de confirmación

**Colección `payments`**:
```typescript
{
  domainId: string,
  domainName: string,
  workspaceId: string,
  transactionId: string,
  reference: string,
  status: 'APPROVED',
  amount: number,  // En COP
  customerEmail: string,
  paymentMethod: string,
  paidAt: Timestamp,
  createdAt: Timestamp
}
```

## 🔧 Configuración Requerida

### Variables de Entorno

Agregar en `functions/.env`:

```env
# Wompi Integration
WOMPI_INTEGRITY_KEY=tu_integrity_key_de_wompi
```

### Índices de Firestore

Los siguientes índices ya están agregados en `firestore.indexes.json`:

```json
// Pagos por workspace
{
  "collectionGroup": "payments",
  "fields": [
    { "fieldPath": "workspaceId", "order": "ASCENDING" },
    { "fieldPath": "paidAt", "order": "DESCENDING" }
  ]
}

// Pagos por dominio
{
  "collectionGroup": "payments",
  "fields": [
    { "fieldPath": "domainId", "order": "ASCENDING" },
    { "fieldPath": "paidAt", "order": "DESCENDING" }
  ]
}

// Alertas por entidad
{
  "collectionGroup": "alerts",
  "fields": [
    { "fieldPath": "metadata.entityId", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" }
  ]
}
```

**Desplegar índices**:
```bash
firebase deploy --only firestore:indexes
```

### Reglas de Seguridad

Las reglas para `payments` ya están agregadas en `firestore.rules`:

```javascript
match /payments/{paymentId} {
  allow read: if isOwner();
  allow create: if false;  // Solo Cloud Functions (Admin SDK)
  allow update: if false;  // Inmutable
  allow delete: if isOwner();
}
```

**Desplegar reglas**:
```bash
firebase deploy --only firestore:rules
```

## 📦 Despliegue

### 1. Desplegar Reglas e Índices

```bash
# Desde la raíz del proyecto
firebase deploy --only firestore:rules,firestore:indexes
```

### 2. Desplegar Cloud Functions

```bash
# Desde la raíz del proyecto
cd functions

# Build TypeScript
npm run build

# Desplegar nuevas funciones
firebase deploy --only functions:generateAlertsScheduled,functions:wompiWebhook

# O desplegar todo
firebase deploy --only functions
```

### 3. Verificar Funciones Desplegadas

```bash
firebase functions:list
```

Deberías ver:
- ✅ `generateAlertsScheduled` - Tipo: Scheduled
- ✅ `wompiWebhook` - Tipo: HTTP

## 🧪 Pruebas

### Probar Generación de Alertas Programadas

```bash
# Invocar manualmente
firebase functions:shell
generateAlertsScheduled()
```

O esperar al siguiente día a las 8:00 AM.

### Probar Webhook de Wompi

Usar herramienta como Postman o curl:

```bash
curl -X POST https://wompiwebhook-[hash]-uc.a.run.app \
  -H "Content-Type: application/json" \
  -H "x-event-checksum: timestamp.signature" \
  -d '{
    "event": "transaction.updated",
    "data": {
      "transaction": {
        "id": "test-123",
        "reference": "ejemplo-com-1234567890",
        "status": "APPROVED",
        "amount_in_cents": 150000,
        "customer_email": "test@ejemplo.com"
      }
    }
  }'
```

## 📊 Monitoreo

### Ver Logs de Cloud Functions

```bash
# Alertas programadas
firebase functions:log --only generateAlertsScheduled

# Webhook
firebase functions:log --only wompiWebhook
```

### Verificar Alertas Creadas

```bash
# En Firebase Console
# Firestore > alerts > filtrar por type: domain_expiring_*
```

### Verificar Pagos Registrados

```bash
# En Firebase Console
# Firestore > payments
```

## 🎯 Próximos Pasos (Opcional)

- [ ] Agregar gráficas en dashboard (Chart.js o PrimeNG Charts)
- [ ] Notificaciones push para alertas críticas
- [ ] Exportar reportes de pagos a Excel/PDF
- [ ] Integración con otros proveedores de pago (Bancolombia, Nequi)
- [ ] Panel de administración de webhooks
- [ ] Métricas de tasa de conversión de pagos

## 📝 Notas Importantes

1. **Scheduler**: La función `generateAlertsScheduled` se ejecuta automáticamente. No es necesario llamarla manualmente.

2. **Webhook**: Debe configurarse en el dashboard de Wompi para que los pagos se procesen automáticamente.

3. **Emails**: Los emails de confirmación de pago usan la misma cola que los emails de alerta (`emailLogs` collection).

4. **Seguridad**: El webhook valida la firma HMAC-SHA256 de Wompi para prevenir solicitudes fraudulentas.

5. **Idempotencia**: Las alertas verifican duplicados antes de crearse. Los pagos se registran una sola vez.

## 🐛 Troubleshooting

### Alertas no se crean automáticamente
- Verificar que `generateAlertsScheduled` esté desplegada
- Ver logs: `firebase functions:log --only generateAlertsScheduled`
- Verificar índices de Firestore están creados

### Webhook no recibe pagos
- Verificar URL configurada en Wompi dashboard
- Verificar `WOMPI_INTEGRITY_KEY` en `.env`
- Ver logs: `firebase functions:log --only wompiWebhook`
- Probar con herramienta de testing (Postman)

### Emails de confirmación no se envían
- Verificar que dominio tenga `contactEmail` configurado
- Verificar `emailConfigs` collection tiene configuración para el workspace
- Ver logs de `sendEmail` function

## 📚 Documentación Adicional

- [Wompi Webhooks](https://docs.wompi.co/docs/es/eventos)
- [Firebase Cloud Scheduler](https://firebase.google.com/docs/functions/schedule-functions)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/rules-structure)
