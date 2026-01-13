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

  /** Contact email for domain notifications */
  contactEmail?: string;

  /** Renewal price in COP (Colombian Pesos) - DEPRECATED: Use hostingRenewalPrice + domainRenewalPrice */
  renewalPrice?: number;

  /** Hosting renewal price in COP (Colombian Pesos) */
  hostingRenewalPrice?: number;

  /** Domain renewal price in COP (Colombian Pesos) */
  domainRenewalPrice?: number;

  /** Raw API response for debugging */
  raw: Record<string, unknown>;

  /** When this record was last synced from Hostinger */
  syncedAt: Timestamp;
}
