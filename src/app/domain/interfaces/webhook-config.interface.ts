/**
 * Webhook Configuration Interface
 *
 * Defines webhook notification settings for workspaces.
 * Used for sending health alerts to external systems.
 */
export interface WebhookConfig {
  /** Whether webhooks are enabled for this workspace */
  enabled: boolean;

  /** Webhook URL endpoint */
  url: string;

  /** Platform type (for message formatting) */
  platform: 'slack' | 'discord' | 'teams' | 'custom';

  /** Events that trigger webhook notifications */
  events: WebhookEvent[];

  /** Additional headers to include in requests */
  headers?: Record<string, string>;

  /** Secret token for signature verification (optional) */
  secret?: string;

  /** Minimum severity to trigger notification */
  minSeverity?: 'warning' | 'critical';

  /** Whether to send test notifications */
  enableTestNotifications?: boolean;
}

/**
 * Webhook Event Types
 */
export type WebhookEvent =
  | 'health.critical' // Health score below 50
  | 'health.warning' // Health score 50-79
  | 'rateLimit.critical' // Rate limit > 90%
  | 'rateLimit.warning' // Rate limit > 80%
  | 'sync.failure' // Sync failed
  | 'sync.consecutiveFailures' // 3+ consecutive failures
  | 'circuitBreaker.open'; // Circuit breaker opened

/**
 * Webhook Payload Interface
 *
 * Structure of the data sent to webhook endpoints.
 */
export interface WebhookPayload {
  /** Event type that triggered the webhook */
  event: WebhookEvent;

  /** Alert severity */
  severity: 'warning' | 'critical';

  /** Alert title */
  title: string;

  /** Alert message */
  message: string;

  /** Workspace information */
  workspace: {
    id: string;
    name: string;
  };

  /** Timestamp when event occurred */
  timestamp: string;

  /** Additional metadata */
  metadata?: {
    healthScore?: number;
    rateLimitPercentage?: number;
    consecutiveFailures?: number;
    errorMessage?: string;
  };
}
