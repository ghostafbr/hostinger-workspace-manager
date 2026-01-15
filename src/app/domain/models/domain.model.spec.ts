import { describe, it, expect } from 'vitest';
import { Timestamp } from 'firebase/firestore';
import { Domain } from './domain.model';

describe('Domain', () => {
  const now = Timestamp.now();
  const expiresLater = Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 5));

  it('calcula días, precios y severidad', () => {
    const d = new Domain({
      id: '1',
      workspaceId: 'w',
      domainName: 'example.com',
      expiresAt: expiresLater,
      createdAt: now,
      nameservers: ['ns1', 'ns2'],
      domainLock: true,
      privacyProtection: false,
      contactEmail: undefined,
      renewalPrice: undefined,
      hostingRenewalPrice: 5,
      domainRenewalPrice: 10,
      raw: {},
      syncedAt: now,
    });

    expect(d.getDaysToExpire()).toBeGreaterThan(0);
    expect(d.getTotalRenewalPrice()).toBe(15);
    expect(d.getSeverityLevel()).toMatch(/critical|warning|info|expired/);
    // expired case
    const past = new Domain({
      id: '2',
      workspaceId: 'w',
      domainName: 'old.com',
      expiresAt: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24)),
      createdAt: now,
      nameservers: [],
      domainLock: false,
      privacyProtection: false,
      raw: {},
      syncedAt: now,
    });
    expect(past.isExpired()).toBe(true);
    // pricing direct renewalPrice
    const withRenewal = new Domain({
      id: '3',
      workspaceId: 'w',
      domainName: 'direct.com',
      expiresAt: expiresLater,
      createdAt: now,
      nameservers: [],
      domainLock: false,
      privacyProtection: false,
      renewalPrice: 42,
      hostingRenewalPrice: 5,
      domainRenewalPrice: 6,
      raw: {},
      syncedAt: now,
    });
    expect(withRenewal.getTotalRenewalPrice()).toBe(42);
    // critical and warning cases
    const critical = new Domain({
      id: '4',
      workspaceId: 'w',
      domainName: 'crit.com',
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 3)),
      createdAt: now,
      nameservers: [],
      domainLock: false,
      privacyProtection: false,
      raw: {},
      syncedAt: now,
    });
    expect(critical.isCritical()).toBe(true);

    const warning = new Domain({
      id: '5',
      workspaceId: 'w',
      domainName: 'warn.com',
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 20)),
      createdAt: now,
      nameservers: [],
      domainLock: false,
      privacyProtection: false,
      raw: {},
      syncedAt: now,
    });
    expect(warning.isExpiringSoon()).toBe(true);
    expect(warning.getSeverityLevel()).toBe('warning');

    // fromFirestore defaults and missing optional fields
    const from = Domain.fromFirestore('f1', {
      workspaceId: 'w',
      domainName: 'from.com',
      expiresAt: Timestamp.fromDate(new Date()),
      createdAt: Timestamp.fromDate(new Date()),
      syncedAt: Timestamp.fromDate(new Date()),
    });
    expect(from.id).toBe('f1');
  });
});
