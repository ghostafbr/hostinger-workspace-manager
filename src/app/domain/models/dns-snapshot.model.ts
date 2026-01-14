import { Timestamp } from 'firebase/firestore';
import { DnsSnapshot as DnsSnapshotInterface } from '../interfaces/dns-snapshot.interface';
import { DnsRecord } from './dns-record.model';

/**
 * DNS Snapshot Model
 *
 * Business logic for DNS snapshots
 */
export class DnsSnapshot implements DnsSnapshotInterface {
  id: string;
  workspaceId: string;
  domainName: string;
  records: DnsRecord[];
  createdAt: Timestamp;
  note?: string;

  constructor(data: DnsSnapshotInterface) {
    this.id = data.id;
    this.workspaceId = data.workspaceId;
    this.domainName = data.domainName;
    this.records = data.records.map((r) => new DnsRecord(r));
    this.createdAt = data.createdAt;
    this.note = data.note;
  }

  /**
   * Get total number of records
   */
  getTotalRecords(): number {
    return this.records.length;
  }

  /**
   * Get records by type
   */
  getRecordsByType(type: string): DnsRecord[] {
    return this.records.filter((r) => r.recordType === type);
  }

  /**
   * Check if snapshot is recent (less than 24 hours old)
   */
  isRecent(): boolean {
    const now = Date.now();
    const snapshotTime = this.createdAt.toMillis();
    const hoursDiff = (now - snapshotTime) / (1000 * 60 * 60);
    return hoursDiff < 24;
  }

  /**
   * Get age in hours
   */
  getAgeInHours(): number {
    const now = Date.now();
    const snapshotTime = this.createdAt.toMillis();
    return Math.floor((now - snapshotTime) / (1000 * 60 * 60));
  }

  /**
   * Compare with current DNS records
   */
  compareWith(currentRecords: DnsRecord[]): {
    added: DnsRecord[];
    removed: DnsRecord[];
    modified: DnsRecord[];
  } {
    const added: DnsRecord[] = [];
    const removed: DnsRecord[] = [];
    const modified: DnsRecord[] = [];

    // Find added and modified records
    for (const current of currentRecords) {
      const snapshot = this.records.find(
        (r) => r.recordType === current.recordType && r.name === current.name,
      );

      if (!snapshot) {
        added.push(current);
      } else if (snapshot.hasDifference(current)) {
        modified.push(current);
      }
    }

    // Find removed records
    for (const snapshot of this.records) {
      const current = currentRecords.find(
        (r) => r.recordType === snapshot.recordType && r.name === snapshot.name,
      );

      if (!current) {
        removed.push(snapshot);
      }
    }

    return { added, removed, modified };
  }
}
