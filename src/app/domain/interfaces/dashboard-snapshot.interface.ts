import { Timestamp } from 'firebase/firestore';

/**
 * Dashboard Snapshot Interface
 *
 * Stores historical dashboard statistics for comparisons
 */
export interface DashboardSnapshot {
  /** Unique identifier */
  id: string;

  /** User ID who owns this snapshot */
  userId: string;

  /** Snapshot timestamp */
  snapshotAt: Timestamp;

  /** Total workspaces at snapshot time */
  totalWorkspaces: number;

  /** Active workspaces */
  activeWorkspaces: number;

  /** Total domains */
  totalDomains: number;

  /** Total subscriptions */
  totalSubscriptions: number;

  /** Domains expiring in different periods */
  domainsExpiring7Days: number;
  domainsExpiring15Days: number;
  domainsExpiring30Days: number;
  domainsExpiring60Days: number;

  /** Subscriptions expiring in different periods */
  subscriptionsExpiring7Days: number;
  subscriptionsExpiring15Days: number;
  subscriptionsExpiring30Days: number;
  subscriptionsExpiring60Days: number;

  /** Number of workspaces with errors */
  workspacesInError: number;
}
