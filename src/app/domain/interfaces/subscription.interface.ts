import { Timestamp } from 'firebase/firestore';

/**
 * Subscription Entity Interface
 *
 * Represents a Hostinger subscription/service
 */
export interface Subscription {
  /** Unique identifier */
  id: string;

  /** Associated workspace ID */
  workspaceId: string;

  /** Hostinger subscription ID (unique per workspace) */
  subscriptionId: string;

  /** Name of the product/service */
  productName: string;

  /** When the subscription expires */
  expiresAt: Timestamp;

  /** Next billing date (if applicable) */
  nextBillingAt?: Timestamp;

  /** Whether auto-renewal is enabled */
  autoRenew: boolean;

  /** Subscription status */
  status: string;

  /** Raw API response for debugging */
  raw: Record<string, unknown>;

  /** When this record was last synced from Hostinger */
  syncedAt: Timestamp;
}
