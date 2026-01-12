/**
 * Enum for workspace health status
 */
export enum HealthStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

/**
 * Enum for circuit breaker status
 */
export enum CircuitBreakerStatus {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half-open',
}
