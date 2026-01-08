import { Timestamp } from 'firebase/firestore';
import { Subscription as SubscriptionInterface } from '../interfaces/subscription.interface';

/**
 * Subscription Entity Model
 *
 * Domain model for a Hostinger subscription with business logic
 */
export class Subscription implements SubscriptionInterface {
  id: string;
  workspaceId: string;
  subscriptionId: string;
  productName: string;
  expiresAt: Timestamp;
  nextBillingAt?: Timestamp;
  autoRenew: boolean;
  status: string;
  raw: Record<string, unknown>;
  syncedAt: Timestamp;

  constructor(data: SubscriptionInterface) {
    this.id = data.id;
    this.workspaceId = data.workspaceId;
    this.subscriptionId = data.subscriptionId;
    this.productName = data.productName;
    this.expiresAt = data.expiresAt;
    this.nextBillingAt = data.nextBillingAt;
    this.autoRenew = data.autoRenew;
    this.status = data.status;
    this.raw = data.raw;
    this.syncedAt = data.syncedAt;
  }

  /**
   * Calculates the number of days until expiration
   */
  getDaysToExpire(): number {
    const now = Timestamp.now();
    const diffMs = this.expiresAt.toMillis() - now.toMillis();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Checks if the subscription is expired
   */
  isExpired(): boolean {
    return this.getDaysToExpire() <= 0;
  }

  /**
   * Checks if the subscription is expiring soon (within 30 days)
   */
  isExpiringSoon(): boolean {
    const days = this.getDaysToExpire();
    return days > 0 && days <= 30;
  }

  /**
   * Checks if the subscription is critical (within 7 days)
   */
  isCritical(): boolean {
    const days = this.getDaysToExpire();
    return days > 0 && days <= 7;
  }

  /**
   * Gets a severity level based on days to expire
   */
  getSeverityLevel(): 'critical' | 'warning' | 'info' | 'expired' {
    const days = this.getDaysToExpire();
    if (days <= 0) return 'expired';
    if (days <= 7) return 'critical';
    if (days <= 30) return 'warning';
    return 'info';
  }

  /**
   * Checks if the subscription will auto-renew
   */
  willAutoRenew(): boolean {
    return this.autoRenew && !this.isExpired();
  }

  /**
   * Converts the entity to a plain object for Firestore
   */
  toFirestore(): Omit<SubscriptionInterface, 'id'> {
    return {
      workspaceId: this.workspaceId,
      subscriptionId: this.subscriptionId,
      productName: this.productName,
      expiresAt: this.expiresAt,
      nextBillingAt: this.nextBillingAt,
      autoRenew: this.autoRenew,
      status: this.status,
      raw: this.raw,
      syncedAt: this.syncedAt,
    };
  }

  /**
   * Creates a Subscription entity from Firestore data
   */
  static fromFirestore(id: string, data: Record<string, unknown>): Subscription {
    return new Subscription({
      id,
      workspaceId: data['workspaceId'] as string,
      subscriptionId: data['subscriptionId'] as string,
      productName: data['productName'] as string,
      expiresAt: data['expiresAt'] as Timestamp,
      nextBillingAt: data['nextBillingAt'] as Timestamp | undefined,
      autoRenew: (data['autoRenew'] as boolean) || false,
      status: data['status'] as string,
      raw: (data['raw'] as Record<string, unknown>) || {},
      syncedAt: data['syncedAt'] as Timestamp,
    });
  }
}
