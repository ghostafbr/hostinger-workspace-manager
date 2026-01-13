import { EmailProvider } from '../enums/email-provider.enum';
import { PaymentOptions } from './payment-options.interface';

/**
 * Email Configuration Interface
 *
 * Defines the structure for workspace email settings in Firestore
 */
export interface EmailConfigInterface {
  /** Firestore document ID */
  id?: string;

  /** Workspace ID this config belongs to */
  workspaceId: string;

  /** Whether email notifications are enabled */
  enabled: boolean;

  /** Primary recipient email address */
  recipientEmail: string;

  /** Additional CC recipients (optional) */
  ccEmails?: string[];

  /** Email provider type */
  providerType: EmailProvider;

  /** Email provider settings */
  provider: {
    /** SendGrid API key (encrypted) - required for SendGrid */
    apiKey?: string;

    /** SMTP settings - required for SMTP */
    smtp?: {
      /** SMTP host (e.g., smtp.hostinger.com) */
      host: string;

      /** SMTP port (465 for SSL, 587 for TLS) */
      port: number;

      /** Use secure connection (SSL/TLS) */
      secure: boolean;

      /** SMTP username (usually full email) */
      username: string;

      /** SMTP password (encrypted) */
      password: string;
    };

    /** Sender email address */
    fromEmail: string;

    /** Sender name */
    fromName: string;
  };

  /** Rate limiting settings */
  rateLimit?: {
    /** Maximum emails per hour */
    maxPerHour: number;

    /** Maximum emails per day */
    maxPerDay: number;
  };

  /** Retry settings for failed emails */
  retry?: {
    /** Maximum retry attempts */
    maxAttempts: number;

    /** Delay between retries in minutes */
    delayMinutes: number;
  };

  /** Payment options for renewal emails */
  paymentOptions?: PaymentOptions;

  /** Firestore timestamps */
  createdAt: unknown; // Timestamp from @angular/fire/firestore
  updatedAt?: unknown; // Timestamp from @angular/fire/firestore
}
