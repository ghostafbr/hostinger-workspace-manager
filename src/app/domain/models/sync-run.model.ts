import { Timestamp } from 'firebase/firestore';
import { SyncRun as SyncRunInterface, SyncError } from '../interfaces/sync-run.interface';
import { SyncRunStatus } from '../enums/sync-run-status.enum';

/**
 * Sync Run Entity Model
 *
 * Domain model for a synchronization operation with business logic
 */
export class SyncRun implements SyncRunInterface {
  id: string;
  workspaceId: string;
  startAt: Timestamp;
  endAt?: Timestamp;
  status: SyncRunStatus;
  domainsProcessed: number;
  subscriptionsProcessed: number;
  errors: SyncError[];

  constructor(data: SyncRunInterface) {
    this.id = data.id;
    this.workspaceId = data.workspaceId;
    this.startAt = data.startAt;
    this.endAt = data.endAt;
    this.status = data.status;
    this.domainsProcessed = data.domainsProcessed;
    this.subscriptionsProcessed = data.subscriptionsProcessed;
    this.errors = data.errors;
  }

  /**
   * Checks if the sync is still running
   */
  isRunning(): boolean {
    return this.status === SyncRunStatus.RUNNING;
  }

  /**
   * Checks if the sync completed successfully
   */
  isSuccess(): boolean {
    return this.status === SyncRunStatus.SUCCESS;
  }

  /**
   * Checks if the sync failed
   */
  isFailed(): boolean {
    return this.status === SyncRunStatus.FAILED;
  }

  /**
   * Checks if the sync had partial success
   */
  isPartialSuccess(): boolean {
    return this.status === SyncRunStatus.PARTIAL_SUCCESS;
  }

  /**
   * Checks if the sync has errors
   */
  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  /**
   * Gets the total number of items processed
   */
  getTotalProcessed(): number {
    return this.domainsProcessed + this.subscriptionsProcessed;
  }

  /**
   * Gets the duration of the sync in milliseconds
   */
  getDurationMs(): number | null {
    if (!this.endAt) return null;
    return this.endAt.toMillis() - this.startAt.toMillis();
  }

  /**
   * Gets the duration of the sync in seconds
   */
  getDurationSeconds(): number | null {
    const durationMs = this.getDurationMs();
    return durationMs ? Math.round(durationMs / 1000) : null;
  }

  /**
   * Converts the entity to a plain object for Firestore
   */
  toFirestore(): Omit<SyncRunInterface, 'id'> {
    return {
      workspaceId: this.workspaceId,
      startAt: this.startAt,
      endAt: this.endAt,
      status: this.status,
      domainsProcessed: this.domainsProcessed,
      subscriptionsProcessed: this.subscriptionsProcessed,
      errors: this.errors,
    };
  }

  /**
   * Creates a SyncRun entity from Firestore data
   */
  static fromFirestore(id: string, data: Record<string, unknown>): SyncRun {
    return new SyncRun({
      id,
      workspaceId: data['workspaceId'] as string,
      startAt: data['startAt'] as Timestamp,
      endAt: data['endAt'] as Timestamp | undefined,
      status: data['status'] as SyncRunStatus,
      domainsProcessed: (data['domainsProcessed'] as number) || 0,
      subscriptionsProcessed: (data['subscriptionsProcessed'] as number) || 0,
      errors: (data['errors'] as SyncError[]) || [],
    });
  }
}
