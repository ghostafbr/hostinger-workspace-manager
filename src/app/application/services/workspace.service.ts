import { Injectable, inject, signal } from '@angular/core';
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
  orderBy,
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
        orderBy('createdAt', 'desc'),
      );

      const querySnapshot = await getDocs(q);
      const workspaces = querySnapshot.docs.map((doc) => {
        const data = doc.data() as Record<string, unknown>;
        return Workspace.fromFirestore(doc.id, data);
      });

      this.workspaces.set(workspaces);
      return workspaces;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch workspaces';
      this.error.set(errorMessage);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Get workspace by ID
   */
  async getWorkspaceById(id: string): Promise<Workspace | null> {
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
   * Clear error
   */
  clearError(): void {
    this.error.set(null);
  }
}
