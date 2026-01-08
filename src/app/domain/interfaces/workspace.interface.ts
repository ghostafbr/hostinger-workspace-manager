import { Timestamp } from 'firebase/firestore';
import { WorkspaceStatus } from '../enums/workspace-status.enum';

/**
 * Workspace Entity Interface
 *
 * Represents a Hostinger workspace (portfolio) in the system.
 * Each workspace contains domains, subscriptions, and associated data.
 */
export interface Workspace {
  /** Unique identifier */
  id: string;

  /** Workspace name (required) */
  name: string;

  /** Optional description */
  description?: string;

  /** Current operational status */
  status: WorkspaceStatus;

  /** When the workspace was created */
  createdAt: Timestamp;

  /** When the workspace was last updated */
  updatedAt: Timestamp;

  /** Timestamp of the last token test */
  lastTestAt?: Timestamp;

  /** Timestamp of the last successful synchronization */
  lastSyncAt?: Timestamp;

  /** Status message from the last sync */
  lastSyncStatus?: string;

  /** Last error message (if any) */
  lastError?: string;

  /** When the last error occurred */
  lastErrorAt?: Timestamp;
}
