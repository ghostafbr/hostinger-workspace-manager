/**
 * Email Log Interface
 *
 * Tracks sent emails for auditing and retry logic
 */
export interface EmailLogInterface {
  /** Firestore document ID */
  id?: string;

  /** Workspace ID */
  workspaceId: string;

  /** Alert log ID (if triggered by alert) */
  alertLogId?: string;

  /** Email recipient */
  recipientEmail: string;

  /** Email subject */
  subject: string;

  /** Email template used */
  templateType: 'domain_expiring' | 'subscription_expiring' | 'health_alert' | 'custom';

  /** Email status */
  status: 'pending' | 'sent' | 'failed' | 'retrying';

  /** SendGrid message ID (if sent) */
  messageId?: string;

  /** Error message (if failed) */
  errorMessage?: string;

  /** Retry attempt count */
  retryCount: number;

  /** Maximum retry attempts allowed */
  maxRetries: number;

  /** Next retry timestamp (if retrying) */
  nextRetryAt?: unknown; // Timestamp from @angular/fire/firestore

  /** Firestore timestamps */
  sentAt?: unknown; // Timestamp from @angular/fire/firestore
  createdAt: unknown; // Timestamp from @angular/fire/firestore
  updatedAt?: unknown; // Timestamp from @angular/fire/firestore
}
