import { Timestamp } from 'firebase/firestore';
import { DnsRecord as DnsRecordInterface } from '../interfaces/dns-record.interface';
import { DnsRecordType } from '../enums/dns-record-type.enum';

/**
 * DNS Record Model
 *
 * Business logic for DNS records
 */
export class DnsRecord implements DnsRecordInterface {
  id: string;
  workspaceId: string;
  domainName: string;
  recordType: DnsRecordType;
  name: string;
  value: string;
  ttl: number;
  priority?: number;
  syncedAt: Timestamp;

  constructor(data: DnsRecordInterface) {
    this.id = data.id;
    this.workspaceId = data.workspaceId;
    this.domainName = data.domainName;
    this.recordType = data.recordType;
    this.name = data.name;
    this.value = data.value;
    this.ttl = data.ttl;
    this.priority = data.priority;
    this.syncedAt = data.syncedAt;
  }

  /**
   * Get full qualified domain name (FQDN)
   */
  getFQDN(): string {
    if (this.name === '@') {
      return this.domainName;
    }
    return `${this.name}.${this.domainName}`;
  }

  /**
   * Check if record is an MX record
   */
  isMXRecord(): boolean {
    return this.recordType === DnsRecordType.MX;
  }

  /**
   * Check if record is an A or AAAA record
   */
  isAddressRecord(): boolean {
    return this.recordType === DnsRecordType.A || this.recordType === DnsRecordType.AAAA;
  }

  /**
   * Check if TTL is low (less than 5 minutes)
   */
  hasLowTTL(): boolean {
    return this.ttl < 300;
  }

  /**
   * Format TTL for display
   */
  getFormattedTTL(): string {
    if (this.ttl < 60) {
      return `${this.ttl}s`;
    }
    if (this.ttl < 3600) {
      return `${Math.floor(this.ttl / 60)}m`;
    }
    if (this.ttl < 86400) {
      return `${Math.floor(this.ttl / 3600)}h`;
    }
    return `${Math.floor(this.ttl / 86400)}d`;
  }

  /**
   * Check if this record is equal to another (same type, name, value)
   */
  isEqualTo(other: DnsRecord): boolean {
    return (
      this.recordType === other.recordType &&
      this.name === other.name &&
      this.value === other.value &&
      this.priority === other.priority
    );
  }

  /**
   * Check if this record differs from another
   */
  hasDifference(other: DnsRecord): boolean {
    return !this.isEqualTo(other) || this.ttl !== other.ttl;
  }
}
