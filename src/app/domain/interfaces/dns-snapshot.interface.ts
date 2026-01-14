import { Timestamp } from 'firebase/firestore';
import { DnsRecord } from './dns-record.interface';

/**
 * DNS Snapshot Interface
 *
 * Represents a point-in-time snapshot of DNS configuration for a domain
 */
export interface DnsSnapshot {
  /** Unique identifier */
  id: string;

  /** Associated workspace ID */
  workspaceId: string;

  /** Domain name this snapshot belongs to */
  domainName: string;

  /** DNS records at snapshot time */
  records: DnsRecord[];

  /** When this snapshot was created */
  createdAt: Timestamp;

  /** Optional description/note */
  note?: string;
}
