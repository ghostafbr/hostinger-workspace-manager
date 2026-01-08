/**
 * Sync Run Status Enum
 *
 * Represents the status of a synchronization operation
 */
export enum SyncRunStatus {
  /** Synchronization is currently in progress */
  RUNNING = 'running',

  /** Synchronization completed successfully */
  SUCCESS = 'success',

  /** Synchronization completed with some errors */
  PARTIAL_SUCCESS = 'partial_success',

  /** Synchronization failed completely */
  FAILED = 'failed',
}
