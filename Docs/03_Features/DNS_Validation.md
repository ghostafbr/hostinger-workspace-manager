# Sincronización y Validación DNS

## Visión General
El sistema incluye funcionalidades completas para la validación del estado de los registros DNS de los dominios gestionados. Esto permite detectar configuraciones erróneas que afecten la entregabilidad de correos (SPF, DKIM, DMARC) o la disponibilidad del sitio.

## Características Implementadas (Issue #18)

### 1. Validación de DNS
**Componente**: `DnsValidationComponent`
- Análisis en tiempo real de registros DNS.
- Verificación de registros críticos:
  - **MX**: Presencia y prioridad correcta.
  - **SPF**: Sintaxis válida y política definida.
  - **DMARC**: Existencia y política.
  - **A/AAAA**: Resolución correcta de IPs.
- Alertas visuales basadas en severidad (Critical, Warning, Success).

### 2. Arquitectura Backend
**Cloud Functions**:
- `validateDns` (Callable): Función principal para clientes autenticados.
- `validateDnsHttp` (HTTPS): Endpoint para validaciones externas/ci.
- **Utils**: Lógica de validación encapsulada en `dnsValidationUtils.ts`.

### 3. Integración UI
- Pestaña dedicada "Validación" en la vista de detalles del dominio.
- Panel de estado general (Salud del dominio).
- Lista detallada de chequeos con descripción de problemas y sugerencias.

## Detalles Técnicos

### Modelos de Datos
```typescript
interface DnsValidationResult {
  domain: string;
  isValid: boolean;
  score: number; // 0-100
  checks: DnsCheckResult[];
  timestamp: Date;
}

interface DnsCheckResult {
  type: 'MX' | 'SPF' | 'DMARC' | 'A';
  status: 'valid' | 'warning' | 'critical';
  message: string;
}
```

### Seguridad
- Las funciones requieren autenticación Firebase (`onCall`).
- La versión HTTP valida tokens mediante `admin.auth().verifyIdToken`.
- CORS habilitado explícitamente para peticiones desde el frontend.

## Uso
1. Navegar a **Detalles de Workspace** -> **DNS**.
2. Seleccionar la pestaña **Validación**.
3. El sistema cargará automáticamente el estado actual.
4. Usar el botón **Revalidar** para forzar un nuevo análisis en tiempo real.
