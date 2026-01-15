import { describe, it, expect } from 'vitest';
import { Timestamp } from 'firebase/firestore';
import { DnsSnapshot } from './dns-snapshot.model';
import { DnsRecord } from './dns-record.model';
import { DnsRecordType } from '../enums/dns-record-type.enum';

describe('DnsSnapshot', () => {
  const now = Timestamp.now();

  it('compara snapshots y calcula métricas', () => {
    const r1 = new DnsRecord({
      id: '1',
      workspaceId: 'w',
      domainName: 'ex.com',
      recordType: DnsRecordType.A,
      name: '@',
      value: '1.2.3.4',
      ttl: 60,
      syncedAt: now,
    });

    const r2 = new DnsRecord({
      id: '2',
      workspaceId: 'w',
      domainName: 'ex.com',
      recordType: DnsRecordType.MX,
      name: 'm',
      value: 'mx.ex.com',
      ttl: 400,
      syncedAt: now,
    });

    const snap = new DnsSnapshot({
      id: 's1',
      workspaceId: 'w',
      domainName: 'ex.com',
      records: [r1, r2],
      createdAt: now,
    });

    expect(snap.getTotalRecords()).toBe(2);
    expect(snap.getRecordsByType(DnsRecordType.A)).toHaveLength(1);
    expect(typeof snap.getAgeInHours()).toBe('number');

    // recent vs old
    const oldSnap = new DnsSnapshot({ ...snap, createdAt: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)) });
    expect(oldSnap.isRecent()).toBe(false);

    const r1Modified = new DnsRecord({ ...r1, value: '9.9.9.9' });
    const compare = snap.compareWith([r1Modified]);
    expect(compare.modified.length).toBeGreaterThanOrEqual(1);
  });
});
