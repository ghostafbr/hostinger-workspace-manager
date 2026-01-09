/**
 * Audit Status Enum
 *
 * Represents the outcome of an audited action
 */
export enum AuditStatus {
  /** Action completed successfully */
  success = 'success',

  /** Action failed completely */
  failed = 'failed',

  /** Action completed partially with some errors */
  partial = 'partial',
}
