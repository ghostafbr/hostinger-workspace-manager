import { describe, it, expect } from 'vitest';
import { Timestamp } from 'firebase/firestore';
import { Subscription } from './subscription.model';

describe('Subscription', () => {
  const now = Timestamp.now();
  const expiresLater = Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 10));

  it('calcula días y severidad', () => {
    const s = new Subscription({
      id: '1',
      workspaceId: 'w',
      subscriptionId: 'sub_1',
      productName: 'prod',
      expiresAt: expiresLater,
      nextBillingAt: undefined,
      autoRenew: true,
      status: 'active',
      raw: {},
      syncedAt: now,
    });

    expect(s.getDaysToExpire()).toBeGreaterThan(0);
    expect(s.isExpired()).toBe(false);
    expect(['critical', 'warning', 'info', 'expired']).toContain(s.getSeverityLevel());
    expect(s.willAutoRenew()).toBe(true);
  });

  it('serializa y deserializa', () => {
    const s = new Subscription({
      id: '2',
      workspaceId: 'w2',
      subscriptionId: 'sub_2',
      productName: 'p',
      expiresAt: expiresLater,
      nextBillingAt: undefined,
      autoRenew: false,
      status: 'inactive',
      raw: {},
      syncedAt: now,
    });
    const obj = s.toFirestore();
    expect(obj.subscriptionId).toBe('sub_2');
    const from = (Subscription as any).fromFirestore('2', { ...obj, expiresAt: expiresLater, syncedAt: now });
    expect(from.id).toBe('2');
  });

  it('marca como crítico y próxima expiración', () => {
    const soon = new Subscription({
      id: '3',
      workspaceId: 'w',
      subscriptionId: 's3',
      productName: 'p',
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 3)),
      nextBillingAt: undefined,
      autoRenew: false,
      status: 'active',
      raw: {},
      syncedAt: now,
    });

    expect(soon.isExpiringSoon()).toBe(true);
    expect(soon.isCritical()).toBe(true);
  });

  it('maneja estado expirado e info', () => {
    const past = new Subscription({
      id: '4',
      workspaceId: 'w',
      subscriptionId: 's4',
      productName: 'p',
      expiresAt: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24)),
      nextBillingAt: undefined,
      autoRenew: true,
      status: 'expired',
      raw: {},
      syncedAt: now,
    });
    expect(past.isExpired()).toBe(true);
    expect(past.willAutoRenew()).toBe(false);

    const far = new Subscription({
      id: '5',
      workspaceId: 'w',
      subscriptionId: 's5',
      productName: 'p',
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 200)),
      nextBillingAt: undefined,
      autoRenew: false,
      status: 'active',
      raw: {},
      syncedAt: now,
    });
    expect(far.getSeverityLevel()).toBe('info');
  });
});
