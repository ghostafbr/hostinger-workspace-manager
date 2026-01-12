import { Injectable, inject, signal } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { FirebaseAdapter } from '@app/infrastructure/adapters/firebase.adapter';
import { AuthService } from './auth.service';
import type { ISavedFilter, FilterCriteria, IWorkspace } from '@app/domain';
import { WorkspaceStatus } from '@app/domain';

/**
 * Filter Service
 *
 * Manages saved filters for workspaces and provides filtering logic
 */
@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private readonly firestore: Firestore = FirebaseAdapter.getFirestore();
  private readonly authService = inject(AuthService);

  readonly savedFilters = signal<ISavedFilter[]>([]);
  readonly currentFilter = signal<FilterCriteria | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  /**
   * Load saved filters for current user
   */
  async loadSavedFilters(): Promise<ISavedFilter[]> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const userId = this.authService.getCurrentUserUid();
      if (!userId) throw new Error('User not authenticated');

      const q = query(collection(this.firestore, 'savedFilters'), where('userId', '==', userId));
      const snapshot = await getDocs(q);

      const filters: ISavedFilter[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ISavedFilter, 'id'>),
      }));

      this.savedFilters.set(filters);
      return filters;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load filters';
      this.error.set(message);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Save a new filter
   */
  async saveFilter(
    name: string,
    criteria: FilterCriteria,
    description?: string,
    isDefault = false,
  ): Promise<string> {
    try {
      const userId = this.authService.getCurrentUserUid();
      if (!userId) throw new Error('User not authenticated');

      // If this is default, unset other defaults
      if (isDefault) {
        await this.clearDefaultFilters(userId);
      }

      const filterData: Omit<ISavedFilter, 'id'> = {
        userId,
        name,
        description,
        criteria,
        isDefault,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      const docRef = await addDoc(collection(this.firestore, 'savedFilters'), filterData);

      // Reload filters
      await this.loadSavedFilters();

      return docRef.id;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save filter';
      this.error.set(message);
      throw error;
    }
  }

  /**
   * Update an existing filter
   */
  async updateFilter(
    filterId: string,
    updates: Partial<Omit<ISavedFilter, 'id' | 'userId' | 'createdAt'>>,
  ): Promise<void> {
    try {
      // If updating to default, clear other defaults
      if (updates.isDefault) {
        const userId = this.authService.getCurrentUserUid();
        if (userId) {
          await this.clearDefaultFilters(userId, filterId);
        }
      }

      await updateDoc(doc(this.firestore, 'savedFilters', filterId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      // Reload filters
      await this.loadSavedFilters();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update filter';
      this.error.set(message);
      throw error;
    }
  }

  /**
   * Delete a filter
   */
  async deleteFilter(filterId: string): Promise<void> {
    try {
      await deleteDoc(doc(this.firestore, 'savedFilters', filterId));

      // Reload filters
      await this.loadSavedFilters();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete filter';
      this.error.set(message);
      throw error;
    }
  }

  /**
   * Apply filter criteria to workspaces
   */
  applyFilter(workspaces: IWorkspace[], criteria: FilterCriteria): IWorkspace[] {
    let filtered = [...workspaces];

    // Filter by name
    if (criteria.name) {
      const searchTerm = criteria.name.toLowerCase();
      filtered = filtered.filter((w) => w.name.toLowerCase().includes(searchTerm));
    }

    // Filter by status
    if (criteria.status && criteria.status.length > 0) {
      filtered = filtered.filter((w) => criteria.status!.includes(w.status));
    }

    // Filter by tags
    if (criteria.tags && criteria.tags.length > 0) {
      filtered = filtered.filter((w) =>
        criteria.tags!.some((tag) => w.tags?.includes(tag)),
      );
    }

    // Filter by priority
    if (criteria.priority && criteria.priority.length > 0) {
      filtered = filtered.filter((w) => w.priority && criteria.priority!.includes(w.priority));
    }

    // Filter favorites
    if (criteria.favoritesOnly) {
      filtered = filtered.filter((w) => w.isFavorite);
    }

    // Filter by errors
    if (criteria.hasErrors !== undefined) {
      filtered = filtered.filter((w) => {
        const hasError = w.status !== WorkspaceStatus.ACTIVE;
        return criteria.hasErrors ? hasError : !hasError;
      });
    }

    // Filter by last sync date
    if (criteria.lastSyncAfter || criteria.lastSyncBefore) {
      filtered = filtered.filter((w) => {
        if (!w.lastSyncAt) return false;
        const syncDate = w.lastSyncAt instanceof Timestamp ? w.lastSyncAt.toDate() : w.lastSyncAt;
        if (criteria.lastSyncAfter && syncDate < criteria.lastSyncAfter) return false;
        if (criteria.lastSyncBefore && syncDate > criteria.lastSyncBefore) return false;
        return true;
      });
    }

    return filtered;
  }

  /**
   * Clear default flag from all filters except the one specified
   */
  private async clearDefaultFilters(userId: string, exceptFilterId?: string): Promise<void> {
    const q = query(
      collection(this.firestore, 'savedFilters'),
      where('userId', '==', userId),
      where('isDefault', '==', true),
    );

    const snapshot = await getDocs(q);

    const updates = snapshot.docs
      .filter((doc) => doc.id !== exceptFilterId)
      .map((doc) =>
        updateDoc(doc.ref, {
          isDefault: false,
          updatedAt: serverTimestamp(),
        }),
      );

    await Promise.all(updates);
  }

  /**
   * Set current active filter
   */
  setCurrentFilter(criteria: FilterCriteria | null): void {
    this.currentFilter.set(criteria);
  }

  /**
   * Clear current filter
   */
  clearFilter(): void {
    this.currentFilter.set(null);
  }
}
