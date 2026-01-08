import { Timestamp } from 'firebase/firestore';
import { Workspace as WorkspaceInterface } from '../interfaces/workspace.interface';
import { WorkspaceStatus } from '../enums/workspace-status.enum';

/**
 * Workspace Entity Model
 *
 * Domain model for a Hostinger workspace with business logic
 */
export class Workspace implements WorkspaceInterface {
  id: string;
  name: string;
  description?: string;
  encryptedToken?: string;
  status: WorkspaceStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastTestAt?: Timestamp;
  lastSyncAt?: Timestamp;
  lastSyncStatus?: string;
  lastError?: string;
  lastErrorAt?: Timestamp;

  constructor(data: WorkspaceInterface) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.encryptedToken = data.encryptedToken;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.lastTestAt = data.lastTestAt;
    this.lastSyncAt = data.lastSyncAt;
    this.lastSyncStatus = data.lastSyncStatus;
    this.lastError = data.lastError;
    this.lastErrorAt = data.lastErrorAt;
  }

  /**
   * Checks if the workspace is in a healthy state
   */
  isHealthy(): boolean {
    return this.status === WorkspaceStatus.ACTIVE;
  }

  /**
   * Checks if the workspace has a token issue
   */
  hasTokenIssue(): boolean {
    return this.status === WorkspaceStatus.INVALID_TOKEN;
  }

  /**
   * Checks if the workspace is rate limited
   */
  isRateLimited(): boolean {
    return this.status === WorkspaceStatus.RATE_LIMITED;
  }

  /**
   * Checks if the workspace is disabled
   */
  isDisabled(): boolean {
    return this.status === WorkspaceStatus.DISABLED;
  }

  /**
   * Checks if the workspace can be synced
   */
  canSync(): boolean {
    return !this.isDisabled() && !this.hasTokenIssue();
  }

  /**
   * Gets a human-readable status message
   */
  getStatusMessage(): string {
    switch (this.status) {
      case WorkspaceStatus.ACTIVE:
        return 'Active';
      case WorkspaceStatus.INVALID_TOKEN:
        return 'Invalid Token';
      case WorkspaceStatus.RATE_LIMITED:
        return 'Rate Limited';
      case WorkspaceStatus.ERROR:
        return 'Error';
      case WorkspaceStatus.DISABLED:
        return 'Disabled';
      default:
        return 'Unknown';
    }
  }

  /**
   * Converts the entity to a plain object for Firestore
   */
  toFirestore(): Omit<WorkspaceInterface, 'id'> {
    return {
      name: this.name,
      description: this.description,
      encryptedToken: this.encryptedToken,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastTestAt: this.lastTestAt,
      lastSyncAt: this.lastSyncAt,
      lastSyncStatus: this.lastSyncStatus,
      lastError: this.lastError,
      lastErrorAt: this.lastErrorAt,
    };
  }

  /**
   * Creates a Workspace entity from Firestore data
   */
  static fromFirestore(id: string, data: Record<string, unknown>): Workspace {
    return new Workspace({
      id,
      name: data['name'] as string,
      description: data['description'] as string | undefined,
      encryptedToken: data['encryptedToken'] as string | undefined,
      status: data['status'] as WorkspaceStatus,
      createdAt: data['createdAt'] as Timestamp,
      updatedAt: data['updatedAt'] as Timestamp,
      lastTestAt: data['lastTestAt'] as Timestamp | undefined,
      lastSyncAt: data['lastSyncAt'] as Timestamp | undefined,
      lastSyncStatus: data['lastSyncStatus'] as string | undefined,
      lastError: data['lastError'] as string | undefined,
      lastErrorAt: data['lastErrorAt'] as Timestamp | undefined,
    });
  }
}
