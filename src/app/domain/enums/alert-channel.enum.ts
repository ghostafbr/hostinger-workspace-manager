/**
 * Alert Channel Enum
 *
 * Represents the notification channel for alerts
 */
export enum AlertChannel {
  /** Alert is only logged, no external notification */
  logOnly = 'LOG_ONLY',

  /** Alert is sent via email */
  email = 'EMAIL',

  /** Alert is sent via WhatsApp */
  whatsapp = 'WHATSAPP',

  /** Alert is sent via push notification */
  push = 'PUSH',
}
