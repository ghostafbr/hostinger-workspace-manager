/**
 * Email Template Data Interface
 *
 * Generic interface for email template data
 */
export interface EmailTemplateDataInterface {
  /** Workspace name */
  workspaceName: string;

  /** Entity name (domain or subscription) */
  entityName: string;

  /** Days until expiration */
  daysRemaining: number;

  /** Expiration date formatted */
  expirationDate: string;

  /** Dashboard link */
  dashboardUrl: string;

  /** Optional additional data */
  [key: string]: unknown;
}

/**
 * Send Email Request Interface
 */
export interface SendEmailRequestInterface {
  /** Workspace ID */
  workspaceId: string;

  /** Recipient email */
  to: string;

  /** CC recipients (optional) */
  cc?: string[];

  /** Email subject */
  subject: string;

  /** HTML content */
  htmlContent: string;

  /** Plain text fallback */
  textContent: string;

  /** Template type for logging */
  templateType: 'domain_expiring' | 'subscription_expiring' | 'health_alert' | 'custom';

  /** Alert log ID (if applicable) */
  alertLogId?: string;
}

/**
 * Send Email Response Interface
 */
export interface SendEmailResponseInterface {
  /** Success flag */
  success: boolean;

  /** SendGrid message ID */
  messageId?: string;

  /** Error message */
  error?: string;

  /** Email log document ID */
  emailLogId?: string;
}
