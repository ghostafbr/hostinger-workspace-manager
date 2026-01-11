/**
 * Alert Channel Enum
 *
 * Represents the notification channel for alerts
 */
export enum AlertChannel {
  /** Alert is only logged, no external notification */
  LOG_ONLY = 'LOG_ONLY',

  /** Alert is sent via email */
  EMAIL = 'EMAIL',

  /** Alert is sent via WhatsApp */
  WHATSAPP = 'WHATSAPP',

  /** Alert is sent via push notification */
  PUSH = 'PUSH',
}
