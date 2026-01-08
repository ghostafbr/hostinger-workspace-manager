import { Timestamp } from 'firebase/firestore';
import { SyncRunStatus } from '../enums/sync-run-status.enum';

/**
 * Sync Error Interface
 *
 * Represents an error that occurred during synchronization
 */
export interface SyncError {
  /** Error message */
  message: string;

  /** When the error occurred */
  timestamp: Timestamp;
}

/**
 * Sync Run Entity Interface
 *
 * Represents a synchronization operation execution
 */
export interface SyncRun {
  /** Unique identifier */
  id: string;

  /** Associated workspace ID */
  workspaceId: string;

  /** When the sync started */
  startAt: Timestamp;

  /** When the sync ended (if completed) */
  endAt?: Timestamp;

  /** Current status of the sync */
  status: SyncRunStatus;

  /** Number of domains processed */
  domainsProcessed: number;

  /** Number of subscriptions processed */
  subscriptionsProcessed: number;

  /** Errors encountered during sync */
  errors: SyncError[];
}
