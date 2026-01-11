import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, firstValueFrom } from 'rxjs';
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
import { Auth } from 'firebase/auth';
import { FirebaseAdapter } from '@app/infrastructure/adapters/firebase.adapter';
import { Workspace, WorkspaceStatus, type IWorkspace } from '@app/domain';
import { AuthService } from './auth.service';
import { EncryptionService } from './encryption.service';
import { HostingerApiService } from '@app/infrastructure/adapters/hostinger-api.service';

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
  private readonly auth: Auth = FirebaseAdapter.getAuth();
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly encryptionService = inject(EncryptionService);
  private readonly hostingerApi = inject(HostingerApiService);
  private readonly collectionName = 'workspaces';
  private readonly cloudFunctionUrl =
    'https://us-central1-hostinger-workspace-manager.cloudfunctions.net/syncWorkspace';
  private readonly syncAllUrl =
    'https://us-central1-hostinger-workspace-manager.cloudfunctions.net/syncAllWorkspaces';

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
      const q = query(workspacesRef, where('userId', '==', userId));

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
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch workspaces';
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch workspace';
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
      const encryptedToken = data.token ? this.encryptionService.encrypt(data.token) : undefined;

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

      const newWorkspace = Workspace.fromFirestore(docRef.id, workspaceData);

      // Update local state
      this.workspaces.update((workspaces) => [newWorkspace, ...workspaces]);

      return newWorkspace;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create workspace';
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to update workspace';
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
      this.workspaces.update((workspaces) => workspaces.filter((ws) => ws.id !== id));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete workspace';
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
   * Synchronize workspace now
   * Calls Cloud Function to sync domains and subscriptions from Hostinger API
   */
  async syncNow(id: string): Promise<void> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const workspace = await this.getWorkspaceByIdAsync(id);
      if (!workspace) {
        throw new Error('Workspace not found');
      }

      console.log('🔄 Calling syncWorkspace function...', {
        workspaceId: id,
        cloudFunctionUrl: this.cloudFunctionUrl,
      });

      // Get current user's ID token
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const idToken = await currentUser.getIdToken();

      // Call HTTP Cloud Function with Authorization header
      const response = await firstValueFrom(
        this.http.post<{
          success: boolean;
          syncRunId?: string;
          domainsProcessed?: number;
          subscriptionsProcessed?: number;
          error?: string;
        }>(
          this.cloudFunctionUrl,
          { workspaceId: id },
          {
            headers: new HttpHeaders({
              Authorization: `Bearer ${idToken}`,
              'Content-Type': 'application/json',
            }),
          },
        ),
      );

      console.log('✅ Function response:', response);

      if (!response.success) {
        throw new Error(response.error || 'Sync failed');
      }

      // Refresh workspace from Firestore to get updated lastSyncAt
      await this.getAllWorkspaces();
    } catch (error) {
      console.error('❌ Sync error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync workspace';
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
   * Sync All Workspaces (Manual Trigger)
   *
   * Executes batch synchronization for all active workspaces.
   * This is a temporary testing method - production uses scheduled Cloud Function.
   *
   * @returns Summary with counts of success/failure/skipped workspaces
   */
  async syncAllWorkspaces(): Promise<{
    success: boolean;
    totalWorkspaces: number;
    successCount: number;
    failureCount: number;
    skippedCount: number;
    disabledCount: number;
  }> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      console.log('🔄 Starting batch sync for all workspaces...');

      // Get current user's ID token
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const idToken = await currentUser.getIdToken();

      // Call syncAllWorkspaces HTTP endpoint
      const response = await firstValueFrom(
        this.http.post<{
          success: boolean;
          totalWorkspaces: number;
          successCount: number;
          failureCount: number;
          skippedCount: number;
          disabledCount: number;
          details: {
            workspaceId: string;
            status: 'success' | 'failed' | 'skipped' | 'disabled';
            domainsProcessed?: number;
            subscriptionsProcessed?: number;
            error?: string;
          }[];
        }>(
          this.syncAllUrl,
          {},
          {
            headers: new HttpHeaders({
              Authorization: `Bearer ${idToken}`,
              'Content-Type': 'application/json',
            }),
          },
        ),
      );

      console.log('✅ Batch sync response:', response);

      if (!response.success) {
        throw new Error('Batch sync failed');
      }

      // Refresh workspaces to show updated sync times
      await this.getAllWorkspaces();

      return {
        success: response.success,
        totalWorkspaces: response.totalWorkspaces,
        successCount: response.successCount,
        failureCount: response.failureCount,
        skippedCount: response.skippedCount,
        disabledCount: response.disabledCount,
      };
    } catch (error) {
      console.error('❌ Batch sync error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync all workspaces';
      this.error.set(errorMessage);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
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
        const syncDate =
          workspace.lastSyncAt instanceof Date
            ? workspace.lastSyncAt
            : workspace.lastSyncAt.toDate();

        if (!latestSync || syncDate > latestSync) {
          latestSync = syncDate;
        }
      }
    }

    return latestSync;
  }

  /**
   * Test connection to Hostinger API
   * Decrypts token and validates it against Hostinger API
   */
  async testConnection(workspaceId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      // Get workspace
      const workspace = await this.getWorkspaceByIdAsync(workspaceId);
      if (!workspace) {
        return { success: false, error: 'Workspace no encontrado' };
      }

      if (!workspace.encryptedToken) {
        return { success: false, error: 'No hay token configurado' };
      }

      // Decrypt token (only exists in memory during this request)
      const decryptedToken = this.encryptionService.decrypt(workspace.encryptedToken);

      if (!decryptedToken) {
        return { success: false, error: 'Error al descifrar el token' };
      }

      // Test connection with Hostinger API
      const result = await this.hostingerApi.testConnection(decryptedToken);

      // Update workspace status based on result
      const updateData: Partial<IWorkspace> = {
        lastTestedAt: new Date(),
      };

      if (result.success) {
        updateData.status = WorkspaceStatus.ACTIVE;
        updateData.lastTestError = undefined;
      } else {
        updateData.status = WorkspaceStatus.INVALID_TOKEN;
        updateData.lastTestError = result.error;
      }

      await this.updateWorkspace(workspaceId, updateData);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al probar conexión';
      this.error.set(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      this.isLoading.set(false);
    }
  }
}
