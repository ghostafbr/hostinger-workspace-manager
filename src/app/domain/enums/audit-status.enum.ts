/**
 * Audit Status Enum
 *
 * Represents the outcome of an audited action
 */
export enum AuditStatus {
  /** Action completed successfully */
  SUCCESS = 'success',

  /** Action failed completely */
  FAILED = 'failed',

  /** Action completed partially with some errors */
  PARTIAL = 'partial',
}
