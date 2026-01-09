import { Injectable, inject, signal } from '@angular/core';
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

      const constraints: QueryConstraint[] = [
        where('workspaceId', '==', filters.workspaceId),
      ];

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
        orderBy('expiresAt', 'asc')
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
}
