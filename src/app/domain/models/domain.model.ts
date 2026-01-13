import { Timestamp } from 'firebase/firestore';
import { Domain as DomainInterface } from '../interfaces/domain.interface';

/**
 * Domain Entity Model
 *
 * Domain model for a Hostinger domain with business logic
 */
export class Domain implements DomainInterface {
  id: string;
  workspaceId: string;
  domainName: string;
  expiresAt: Timestamp;
  createdAt: Timestamp;
  nameservers: string[];
  domainLock: boolean;
  privacyProtection: boolean;
  contactEmail?: string;
  renewalPrice?: number;
  hostingRenewalPrice?: number;
  domainRenewalPrice?: number;
  raw: Record<string, unknown>;
  syncedAt: Timestamp;

  constructor(data: DomainInterface) {
    this.id = data.id;
    this.workspaceId = data.workspaceId;
    this.domainName = data.domainName;
    this.expiresAt = data.expiresAt;
    this.createdAt = data.createdAt;
    this.nameservers = data.nameservers;
    this.domainLock = data.domainLock;
    this.privacyProtection = data.privacyProtection;
    this.contactEmail = data.contactEmail;
    this.renewalPrice = data.renewalPrice;
    this.hostingRenewalPrice = data.hostingRenewalPrice;
    this.domainRenewalPrice = data.domainRenewalPrice;
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
   * Checks if the domain is expired
   */
  isExpired(): boolean {
    return this.getDaysToExpire() <= 0;
  }

  /**
   * Checks if the domain is expiring soon (within 30 days)
   */
  isExpiringSoon(): boolean {
    const days = this.getDaysToExpire();
    return days > 0 && days <= 30;
  }

  /**
   * Checks if the domain is critical (within 7 days)
   */
  isCritical(): boolean {
    const days = this.getDaysToExpire();
    return days > 0 && days <= 7;
  }

  /**
   * Gets the total renewal price
   */
  getTotalRenewalPrice(): number {
    if (this.renewalPrice) return this.renewalPrice;
    return (this.hostingRenewalPrice || 0) + (this.domainRenewalPrice || 0);
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
   * Converts the entity to a plain object for Firestore
   */
  toFirestore(): Omit<DomainInterface, 'id'> {
    return {
      workspaceId: this.workspaceId,
      domainName: this.domainName,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
      nameservers: this.nameservers,
      domainLock: this.domainLock,
      privacyProtection: this.privacyProtection,
      contactEmail: this.contactEmail,
      renewalPrice: this.renewalPrice,
      hostingRenewalPrice: this.hostingRenewalPrice,
      domainRenewalPrice: this.domainRenewalPrice,
      raw: this.raw,
      syncedAt: this.syncedAt,
    };
  }

  /**
   * Creates a Domain entity from Firestore data
   */
  static fromFirestore(id: string, data: Record<string, unknown>): Domain {
    return new Domain({
      id,
      workspaceId: data['workspaceId'] as string,
      domainName: data['domainName'] as string,
      expiresAt: data['expiresAt'] as Timestamp,
      createdAt: data['createdAt'] as Timestamp,
      nameservers: (data['nameservers'] as string[]) || [],
      domainLock: (data['domainLock'] as boolean) || false,
      privacyProtection: (data['privacyProtection'] as boolean) || false,
      contactEmail: data['contactEmail'] as string | undefined,
      renewalPrice: data['renewalPrice'] as number | undefined,
      hostingRenewalPrice: data['hostingRenewalPrice'] as number | undefined,
      domainRenewalPrice: data['domainRenewalPrice'] as number | undefined,
      raw: (data['raw'] as Record<string, unknown>) || {},
      syncedAt: data['syncedAt'] as Timestamp,
    });
  }
}
