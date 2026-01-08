import { Injectable, inject, signal } from '@angular/core';
import { Observable, from } from 'rxjs';
import {
  Firestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { FirebaseAdapter } from '@app/infrastructure/adapters/firebase.adapter';
import { Workspace, WorkspaceStatus, type IWorkspace } from '@app/domain';
import { AuthService } from './auth.service';
import { EncryptionService } from './encryption.service';

/**
 * Workspace Service
 *
 * Handles CRUD operations for Workspaces in Firestore.
 */
@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  private readonly firestore: Firestore = FirebaseAdapter.getFirestore();
  private readonly authService = inject(AuthService);
  private readonly encryptionService = inject(EncryptionService);
  private readonly collectionName = 'workspaces';

  // Signals for reactive state
  readonly workspaces = signal<Workspace[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  /**
   * Get all workspaces for current user
   */
  async getAllWorkspaces(): Promise<Workspace[]> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const userId = this.authService.getCurrentUserUid();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const workspacesRef = collection(this.firestore, this.collectionName);
      const q = query(
        workspacesRef,
        where('userId', '==', userId),
      );

      const querySnapshot = await getDocs(q);
      const workspaces = querySnapshot.docs.map((doc) => {
        const data = doc.data() as Record<string, unknown>;
        return Workspace.fromFirestore(doc.id, data);
      });

      // Sort in memory to avoid needing composite index
      workspaces.sort((a, b) => {
        const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return bTime - aTime; // desc order
      });

      this.workspaces.set(workspaces);
      return workspaces;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch workspaces';
      this.error.set(errorMessage);
      console.error('Error loading workspaces:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Get workspace by ID (async version)
   */
  async getWorkspaceByIdAsync(id: string): Promise<Workspace | null> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const docRef = doc(this.firestore, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data() as Record<string, unknown>;
      return Workspace.fromFirestore(docSnap.id, data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch workspace';
      this.error.set(errorMessage);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Get workspace by ID (Observable version for guards/resolvers)
   */
  getWorkspaceById(id: string): Observable<Workspace | null> {
    return from(this.getWorkspaceByIdAsync(id));
  }

  /**
   * Create new workspace
   */
  async createWorkspace(
    data: Omit<IWorkspace, 'id' | 'createdAt' | 'updatedAt'> & { token?: string },
  ): Promise<Workspace> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const userId = this.authService.getCurrentUserUid();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const now = Timestamp.now();

      // Encrypt token if provided
      const encryptedToken = data.token
        ? this.encryptionService.encrypt(data.token)
        : undefined;

      const workspaceData = {
        name: data.name,
        description: data.description,
        encryptedToken,
        userId,
        createdAt: now,
        updatedAt: now,
        status: data.status || WorkspaceStatus.ACTIVE,
      };

      const workspacesRef = collection(this.firestore, this.collectionName);
      const docRef = await addDoc(workspacesRef, workspaceData);

      const newWorkspace = Workspace.fromFirestore(
        docRef.id,
        workspaceData,
      );

      // Update local state
      this.workspaces.update((workspaces) => [newWorkspace, ...workspaces]);

      return newWorkspace;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create workspace';
      this.error.set(errorMessage);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Update existing workspace
   */
  async updateWorkspace(
    id: string,
    data: Partial<Omit<IWorkspace, 'id' | 'createdAt' | 'updatedAt'>> & { token?: string },
  ): Promise<void> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const docRef = doc(this.firestore, this.collectionName, id);

      // Encrypt token if provided
      const updateData: Record<string, unknown> = {
        updatedAt: Timestamp.now(),
      };

      if (data.name !== undefined) updateData['name'] = data.name;
      if (data.description !== undefined) updateData['description'] = data.description;
      if (data.status !== undefined) updateData['status'] = data.status;

      if (data.token) {
        updateData['encryptedToken'] = this.encryptionService.encrypt(data.token);
      }

      await updateDoc(docRef, updateData);

      // Update local state
      this.workspaces.update((workspaces) =>
        workspaces.map((ws) => {
          if (ws.id === id) {
            const mergedData = { ...ws.toFirestore(), ...updateData };
            return Workspace.fromFirestore(id, mergedData);
          }
          return ws;
        }),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update workspace';
      this.error.set(errorMessage);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Disable workspace (soft disable)
   */
  async disableWorkspace(id: string): Promise<void> {
    await this.updateWorkspace(id, {
      status: WorkspaceStatus.DISABLED,
    });
  }

  /**
   * Delete workspace (hard delete)
   */
  async deleteWorkspace(id: string): Promise<void> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const docRef = doc(this.firestore, this.collectionName, id);
      await deleteDoc(docRef);

      // Update local state
      this.workspaces.update((workspaces) =>
        workspaces.filter((ws) => ws.id !== id),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete workspace';
      this.error.set(errorMessage);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Get active workspaces count
   */
  getActiveWorkspacesCount(): number {
    return this.workspaces().filter((ws) => ws.status === WorkspaceStatus.ACTIVE).length;
  }

  /**
   * Test connection to Hostinger API
   * Updates lastTestAt and status based on result
   */
  async testConnection(id: string): Promise<void> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const workspace = await this.getWorkspaceByIdAsync(id);
      if (!workspace) {
        throw new Error('Workspace not found');
      }

      // TODO: Implement actual Hostinger API test
      // For now, simulate a test
      const isValid = true; // Simulate success

      const docRef = doc(this.firestore, this.collectionName, id);
      const updateData = {
        lastTestAt: Timestamp.now(),
        status: isValid ? WorkspaceStatus.ACTIVE : WorkspaceStatus.INVALID_TOKEN,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(docRef, updateData as Record<string, unknown>);

      // Update local state
      this.workspaces.update((workspaces) =>
        workspaces.map((ws) => {
          if (ws.id === id) {
            return Workspace.fromFirestore(id, {
              ...ws,
              ...updateData,
            });
          }
          return ws;
        }),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to test connection';
      this.error.set(errorMessage);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Synchronize workspace now
   * Updates lastSyncAt and fetches data from Hostinger API
   */
  async syncNow(id: string): Promise<void> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const workspace = await this.getWorkspaceByIdAsync(id);
      if (!workspace) {
        throw new Error('Workspace not found');
      }

      // TODO: Implement actual Hostinger API sync
      // For now, just update timestamp
      const docRef = doc(this.firestore, this.collectionName, id);
      const updateData = {
        lastSyncAt: Timestamp.now(),
        lastSyncStatus: 'success',
        updatedAt: Timestamp.now(),
      };

      await updateDoc(docRef, updateData as Record<string, unknown>);

      // Update local state
      this.workspaces.update((workspaces) =>
        workspaces.map((ws) => {
          if (ws.id === id) {
            return Workspace.fromFirestore(id, {
              ...ws,
              ...updateData,
            });
          }
          return ws;
        }),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to sync workspace';
      this.error.set(errorMessage);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.error.set(null);
  }

  /**
   * Get the most recent sync timestamp across all workspaces
   */
  getLastGlobalSync(): Date | null {
    const workspaces = this.workspaces();
    if (workspaces.length === 0) return null;

    let latestSync: Date | null = null;

    for (const workspace of workspaces) {
      if (workspace.lastSyncAt) {
        // Convert Firestore Timestamp to Date
        const syncDate = workspace.lastSyncAt instanceof Date
          ? workspace.lastSyncAt
          : workspace.lastSyncAt.toDate();

        if (!latestSync || syncDate > latestSync) {
          latestSync = syncDate;
        }
      }
    }

    return latestSync;
  }
}
