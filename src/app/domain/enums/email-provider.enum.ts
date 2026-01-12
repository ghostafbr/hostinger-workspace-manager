/**
 * Email Provider Enum
 *
 * Supported email sending providers
 */
export enum EmailProvider {
  /** SendGrid API (requires API key) */
  SENDGRID = 'sendgrid',

  /** SMTP (e.g., Hostinger, Gmail, etc.) */
  SMTP = 'smtp',
}
