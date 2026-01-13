import { Injectable, signal } from '@angular/core';
import {
  Firestore,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
  DocumentSnapshot,
  DocumentData,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { FirebaseAdapter } from '@app/infrastructure/adapters/firebase.adapter';
import { IDomain } from '@app/domain';

/**
 * Domain Filter Options
 */
export interface DomainFilters {
  workspaceId: string;
  searchText?: string;
  daysToExpire?: number; // Filter by < X days
  pageSize?: number;
  lastDoc?: DocumentSnapshot<DocumentData>;
}

/**
 * Paginated Domain Result
 */
export interface DomainPage {
  domains: IDomain[];
  lastDoc: DocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

/**
 * Domain Service
 *
 * Handles domain queries with filtering, search, and pagination
 */
@Injectable({ providedIn: 'root' })
export class DomainService {
  private readonly firestore: Firestore = FirebaseAdapter.getFirestore();

  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  /**
   * Get domains with filters and pagination
   */
  async getDomains(filters: DomainFilters): Promise<DomainPage> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const constraints: QueryConstraint[] = [where('workspaceId', '==', filters.workspaceId)];

      // Date filter: domains expiring in < X days
      if (filters.daysToExpire !== undefined) {
        const threshold = new Date();
        threshold.setDate(threshold.getDate() + filters.daysToExpire);
        constraints.push(where('expiresAt', '<=', threshold));
      }

      // Order by expiration date (ascending - soonest first)
      constraints.push(orderBy('expiresAt', 'asc'));

      // Pagination
      const pageSize = filters.pageSize || 20;
      constraints.push(limit(pageSize + 1)); // +1 to check hasMore

      if (filters.lastDoc) {
        constraints.push(startAfter(filters.lastDoc));
      }

      const domainsQuery = query(collection(this.firestore, 'domains'), ...constraints);
      const snapshot = await getDocs(domainsQuery);

      let domains = snapshot.docs.map((doc) => ({
        ...(doc.data() as IDomain),
        id: doc.id,
      }));

      // Client-side text search (Firestore no soporta búsqueda de texto completo)
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        domains = domains.filter((d) => d.domainName?.toLowerCase().includes(searchLower));
      }

      // Check if there are more results
      const hasMore = domains.length > pageSize;
      if (hasMore) {
        domains = domains.slice(0, pageSize); // Remove extra item
      }

      const lastDoc = domains.length > 0 ? snapshot.docs[domains.length - 1] : null;

      return {
        domains,
        lastDoc,
        hasMore,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.error.set(errorMessage);
      console.error('Error fetching domains:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Get all domains for a workspace (no pagination)
   */
  async getAllDomains(workspaceId: string): Promise<IDomain[]> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      console.log('[DomainService] Fetching all domains for workspaceId:', workspaceId);

      const domainsQuery = query(
        collection(this.firestore, 'domains'),
        where('workspaceId', '==', workspaceId),
        orderBy('expiresAt', 'asc'),
      );

      const snapshot = await getDocs(domainsQuery);

      console.log('[DomainService] Fetched', snapshot.size, 'domains');

      const domains = snapshot.docs.map((doc) => ({
        ...(doc.data() as IDomain),
        id: doc.id,
      }));

      console.log('[DomainService] Mapped domains:', domains);

      return domains;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.error.set(errorMessage);
      console.error('[DomainService] Error fetching all domains:', error);

      // Check if it's an index error
      if (error instanceof Error && error.message.includes('index')) {
        console.error('[DomainService] ⚠️ Firestore index required. Check Firebase Console.');
      }

      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Calculate days until expiration
   */
  getDaysUntilExpiration(expiresAt: Date | unknown): number | null {
    const date = this.toDate(expiresAt);
    if (!date) return null;

    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Get expiration status (for semaphore)
   */
  getExpirationStatus(expiresAt: Date | unknown): 'critical' | 'warning' | 'ok' | 'expired' {
    const days = this.getDaysUntilExpiration(expiresAt);
    if (days === null) return 'ok';
    if (days < 0) return 'expired';
    if (days <= 7) return 'critical';
    if (days <= 30) return 'warning';
    return 'ok';
  }

  /**
   * Convert Firestore timestamp to Date
   */
  private toDate(timestamp: unknown): Date | null {
    if (!timestamp) return null;
    if (timestamp instanceof Date) return timestamp;
    if (typeof timestamp === 'object' && 'toDate' in timestamp) {
      return (timestamp as { toDate: () => Date }).toDate();
    }
    if (typeof timestamp === 'object' && 'seconds' in timestamp) {
      return new Date((timestamp as { seconds: number }).seconds * 1000);
    }
    return null;
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.error.set(null);
  }

  /**
   * Get a single domain by ID
   */
  async getDomainById(domainId: string): Promise<IDomain | null> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const domainRef = doc(this.firestore, 'domains', domainId);
      const domainDoc = await getDoc(domainRef);

      if (!domainDoc.exists()) {
        return null;
      }

      return {
        ...(domainDoc.data() as IDomain),
        id: domainDoc.id,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch domain';
      this.error.set(errorMessage);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Update domain contact email and pricing
   */
  async updateDomain(
    domainId: string,
    updates: {
      contactEmail?: string;
      renewalPrice?: number;
      hostingRenewalPrice?: number;
      domainRenewalPrice?: number;
    }
  ): Promise<void> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const domainRef = doc(this.firestore, 'domains', domainId);
      await updateDoc(domainRef, updates);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update domain';
      this.error.set(errorMessage);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Get domain statistics for dashboard
   */
  async getDomainStatistics(workspaceId: string): Promise<{
    total: number;
    expired: number;
    critical: number;
    warning: number;
    active: number;
    totalValue: number;
  }> {
    try {
      const allDomains = await this.getAllDomains(workspaceId);

      const stats = {
        total: allDomains.length,
        expired: 0,
        critical: 0,
        warning: 0,
        active: 0,
        totalValue: 0,
      };

      allDomains.forEach(domain => {
        const status = this.getExpirationStatus(domain.expiresAt);
        switch (status) {
          case 'expired':
            stats.expired++;
            break;
          case 'critical':
            stats.critical++;
            break;
          case 'warning':
            stats.warning++;
            break;
          case 'ok':
            stats.active++;
            break;
        }

        const renewalPrice = domain.renewalPrice ||
          (domain.hostingRenewalPrice || 0) + (domain.domainRenewalPrice || 0);
        stats.totalValue += renewalPrice;
      });

      return stats;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get domains grouped by expiration month for charts
   */
  async getDomainsGroupedByMonth(workspaceId: string): Promise<
    Array<{ month: string; count: number; domains: IDomain[] }>
  > {
    try {
      const allDomains = await this.getAllDomains(workspaceId);
      const groups = new Map<string, IDomain[]>();

      allDomains.forEach(domain => {
        const date = this.toDate(domain.expiresAt);
        if (!date) return;

        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!groups.has(monthKey)) {
          groups.set(monthKey, []);
        }
        groups.get(monthKey)!.push(domain);
      });

      return Array.from(groups.entries())
        .map(([month, domains]) => ({
          month,
          count: domains.length,
          domains,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));
    } catch (error) {
      throw error;
    }
  }
}
