import { Timestamp } from 'firebase/firestore';
import { DnsRecordType } from '../enums/dns-record-type.enum';

/**
 * DNS Record Interface
 *
 * Represents a DNS record for a domain
 */
export interface DnsRecord {
  /** Unique identifier */
  id: string;

  /** Associated workspace ID */
  workspaceId: string;

  /** Domain name this record belongs to */
  domainName: string;

  /** Type of DNS record */
  recordType: DnsRecordType;

  /** Record name (subdomain or @) */
  name: string;

  /** Record value (IP, hostname, etc.) */
  value: string;

  /** Time To Live in seconds */
  ttl: number;

  /** Priority (for MX records) */
  priority?: number;

  /** When this record was last synced */
  syncedAt: Timestamp;
}
