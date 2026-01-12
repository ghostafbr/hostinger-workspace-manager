import { Timestamp } from 'firebase/firestore';
import { WorkspaceStatus } from '../enums/workspace-status.enum';

/**
 * Saved Filter Interface
 *
 * Represents a user-saved filter configuration for workspace filtering
 */
export interface SavedFilter {
  /** Unique identifier */
  id: string;

  /** User ID who owns this filter */
  userId: string;

  /** Filter name */
  name: string;

  /** Optional description */
  description?: string;

  /** Filter criteria */
  criteria: FilterCriteria;

  /** Whether this is the default filter to apply */
  isDefault?: boolean;

  /** When the filter was created */
  createdAt: Timestamp;

  /** When the filter was last updated */
  updatedAt: Timestamp;
}

/**
 * Filter Criteria
 *
 * Defines the filter conditions for workspaces
 */
export interface FilterCriteria {
  /** Filter by workspace name (partial match) */
  name?: string;

  /** Filter by status */
  status?: WorkspaceStatus[];

  /** Filter by tags */
  tags?: string[];

  /** Filter by priority */
  priority?: number[];

  /** Show only favorites */
  favoritesOnly?: boolean;

  /** Filter by domains expiring in X days */
  domainsExpiringInDays?: number;

  /** Filter by subscriptions expiring in X days */
  subscriptionsExpiringInDays?: number;

  /** Filter by last sync date range */
  lastSyncAfter?: Date;
  lastSyncBefore?: Date;

  /** Filter by error state */
  hasErrors?: boolean;
}
