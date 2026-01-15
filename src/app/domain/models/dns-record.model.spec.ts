import { describe, it, expect } from 'vitest';
import { Timestamp } from 'firebase/firestore';
import { DnsRecord } from './dns-record.model';
import { DnsRecordType } from '../enums/dns-record-type.enum';

describe('DnsRecord', () => {
  const now = Timestamp.now();

  it('maneja FQDN, tipos y TTL', () => {
    const r1 = new DnsRecord({
      id: '1',
      workspaceId: 'w',
      domainName: 'example.com',
      recordType: DnsRecordType.A,
      name: '@',
      value: '1.2.3.4',
      ttl: 60,
      syncedAt: now,
    });

    const r2 = new DnsRecord({
      id: '2',
      workspaceId: 'w',
      domainName: 'example.com',
      recordType: DnsRecordType.MX,
      name: 'mail',
      value: 'mail.example.com',
      ttl: 4000,
      priority: 10,
      syncedAt: now,
    });

    expect(r1.getFQDN()).toBe('example.com');
    expect(r2.getFQDN()).toBe('mail.example.com');
    expect(r1.isAddressRecord()).toBe(true);
    expect(r2.isMXRecord()).toBe(true);
    expect(r1.hasLowTTL()).toBe(true);
    // test various TTL formats
    const rShort = new DnsRecord({ ...r1, ttl: 30 });
    const rMin = new DnsRecord({ ...r1, ttl: 3000 });
    const rHour = new DnsRecord({ ...r1, ttl: 90000 });
    expect(rShort.getFormattedTTL()).toContain('s');
    expect(rMin.getFormattedTTL()).toContain('m');
    expect(rHour.getFormattedTTL()).toMatch(/h|d/);
    expect(r1.isEqualTo(r1)).toBe(true);
    expect(r1.hasDifference(r2)).toBe(true);

    // equality with priority and ttl differences
    const rA = new DnsRecord({ ...r1, priority: undefined, ttl: 60 });
    const rB = new DnsRecord({ ...r1, priority: 1, ttl: 120 });
    expect(rA.isEqualTo(rB)).toBe(false);
    expect(rA.hasDifference(rB)).toBe(true);
  });
});
