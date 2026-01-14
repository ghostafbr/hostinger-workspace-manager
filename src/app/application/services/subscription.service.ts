import { Injectable, signal } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { FirebaseAdapter } from '@app/infrastructure/adapters/firebase.adapter';

// Domain
import { Subscription as ISubscription } from '@app/domain/interfaces/subscription.interface';

/**
 * Subscription Filters Interface
 */
export interface SubscriptionFilters {
  workspaceId: string;
  searchText?: string;
  autoRenewOnly?: boolean;
  pageSize?: number;
  lastDoc?: QueryDocumentSnapshot<DocumentData>;
}

/**
 * Subscription Service
 *
 * Handles subscription data retrieval and filtering from Firestore
 */
@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private readonly firestore: Firestore = FirebaseAdapter.getFirestore();

  readonly subscriptions = signal<ISubscription[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  /**
   * Get subscriptions with optional filters and pagination
   */
  async getSubscriptions(filters: SubscriptionFilters): Promise<ISubscription[]> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const pageSize = filters.pageSize || 20;

      // Base query
      let subscriptionsQuery = query(
        collection(this.firestore, 'subscriptions'),
        where('workspaceId', '==', filters.workspaceId),
        orderBy('expiresAt', 'asc'),
        limit(pageSize),
      );

      // Add pagination
      if (filters.lastDoc) {
        subscriptionsQuery = query(subscriptionsQuery, startAfter(filters.lastDoc));
      }

      const snapshot = await getDocs(subscriptionsQuery);

      let subscriptions = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        ...(doc.data() as ISubscription),
        id: doc.id,
      }));

      // Client-side text search (Firestore no soporta búsqueda de texto completo)
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        subscriptions = subscriptions.filter((s: ISubscription) =>
          s.productName?.toLowerCase().includes(searchLower),
        );
      }

      // Client-side autoRenew filter
      if (filters.autoRenewOnly) {
        subscriptions = subscriptions.filter((s: ISubscription) => s.autoRenew === true);
      }

      this.subscriptions.set(subscriptions);
      return subscriptions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.error.set(errorMessage);
      console.error('Error fetching subscriptions:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Get all subscriptions for a workspace (no pagination)
   */
  async getAllSubscriptions(workspaceId: string): Promise<ISubscription[]> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const subscriptionsQuery = query(
        collection(this.firestore, 'subscriptions'),
        where('workspaceId', '==', workspaceId),
        orderBy('expiresAt', 'asc'),
      );

      const snapshot = await getDocs(subscriptionsQuery);

      const subscriptions = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        ...(doc.data() as ISubscription),
        id: doc.id,
      }));

      return subscriptions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.error.set(errorMessage);
      console.error('[SubscriptionService] Error fetching all subscriptions:', error);

      // Check if it's an index error
      if (error instanceof Error && error.message.includes('index')) {
        console.error('[SubscriptionService] ⚠️ Firestore index required. Check Firebase Console.');
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
   * Calculate days until next billing
   */
  getDaysUntilNextBilling(nextBillingAt: Date | unknown): number | null {
    const date = this.toDate(nextBillingAt);
    if (!date) return null;

    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Get status severity for PrimeNG tags
   */
  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('active') || statusLower.includes('activ')) return 'success';
    if (statusLower.includes('pending') || statusLower.includes('pendiente')) return 'warn';
    if (statusLower.includes('suspended') || statusLower.includes('suspendid')) return 'danger';
    if (statusLower.includes('cancelled') || statusLower.includes('cancelad')) return 'secondary';
    return 'info';
  }

  /**
   * Convert unknown type to Date
   */
  private toDate(value: unknown): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
      return value.toDate();
    }
    return null;
  }
}
