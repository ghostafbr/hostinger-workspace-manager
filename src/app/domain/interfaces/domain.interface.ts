import { Timestamp } from 'firebase/firestore';

/**
 * Domain Entity Interface
 *
 * Represents a domain from Hostinger portfolio
 */
export interface Domain {
  /** Unique identifier */
  id: string;

  /** Associated workspace ID */
  workspaceId: string;

  /** Domain name (unique per workspace) */
  domainName: string;

  /** When the domain expires */
  expiresAt: Timestamp;

  /** When the domain was created */
  createdAt: Timestamp;

  /** Domain nameservers */
  nameservers: string[];

  /** Whether domain lock is enabled */
  domainLock: boolean;

  /** Whether privacy protection is enabled */
  privacyProtection: boolean;

  /** Raw API response for debugging */
  raw: Record<string, unknown>;

  /** When this record was last synced from Hostinger */
  syncedAt: Timestamp;
}
