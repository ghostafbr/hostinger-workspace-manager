/**
 * Audit Log Utility for Cloud Functions
 *
 * Provides centralized audit logging for all Cloud Functions.
 * Creates audit_logs documents with standardized structure.
 */

import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

/**
 * Audit action types
 */
export enum AuditAction {
  // Workspace actions
  CREATE_WORKSPACE = 'workspace.create',
  UPDATE_WORKSPACE = 'workspace.update',
  DELETE_WORKSPACE = 'workspace.delete',

  // Token actions
  TEST_CONNECTION = 'token.test',
  SAVE_TOKEN = 'token.save',

  // Sync actions
  SYNC_MANUAL = 'sync.manual',
  SYNC_SCHEDULED = 'sync.scheduled',

  // Alert actions
  GENERATE_ALERTS = 'alert.generate',

  // DNS actions
  UPDATE_DNS = 'dns.update',
}

/**
 * Audit status types
 */
export enum AuditStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PARTIAL = 'partial',
}

/**
 * Audit log data interface
 */
export interface AuditLogData {
  action: AuditAction;
  workspaceId?: string;
  actorUid: string;
  status: AuditStatus;
  meta?: Record<string, unknown>;
  error?: string;
}

/**
 * Creates an audit log entry in Firestore
 *
 * @param data - Audit log data
 * @returns Promise resolving to the created document ID
 */
export async function createAuditLog(data: AuditLogData): Promise<string> {
  const firestore = getFirestore();
  const auth = getAuth();

  try {
    // Get actor email from UID
    let actorEmail = 'system';
    try {
      const userRecord = await auth.getUser(data.actorUid);
      actorEmail = userRecord.email || 'unknown';
    } catch (error) {
      console.warn(`Failed to get user email for UID ${data.actorUid}:`, error);
    }

    // Create audit log document
    const auditLog = {
      action: data.action,
      workspaceId: data.workspaceId || null,
      actorUid: data.actorUid,
      actorEmail,
      status: data.status,
      meta: data.meta || {},
      error: data.error || null,
      createdAt: new Date(),
    };

    const docRef = await firestore.collection('audit_logs').add(auditLog);

    console.log(`Audit log created: ${docRef.id} - ${data.action} (${data.status})`);

    return docRef.id;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    throw error;
  }
}

/**
 * Creates a success audit log
 *
 * @param action - Audit action
 * @param actorUid - User UID
 * @param workspaceId - Optional workspace ID
 * @param meta - Optional metadata
 * @returns Promise resolving to the created document ID
 */
export async function logSuccess(
  action: AuditAction,
  actorUid: string,
  workspaceId?: string,
  meta?: Record<string, unknown>
): Promise<string> {
  return createAuditLog({
    action,
    workspaceId,
    actorUid,
    status: AuditStatus.SUCCESS,
    meta,
  });
}

/**
 * Creates a failure audit log
 *
 * @param action - Audit action
 * @param actorUid - User UID
 * @param error - Error message
 * @param workspaceId - Optional workspace ID
 * @param meta - Optional metadata
 * @returns Promise resolving to the created document ID
 */
export async function logFailure(
  action: AuditAction,
  actorUid: string,
  error: string,
  workspaceId?: string,
  meta?: Record<string, unknown>
): Promise<string> {
  return createAuditLog({
    action,
    workspaceId,
    actorUid,
    status: AuditStatus.FAILURE,
    error,
    meta,
  });
}

/**
 * Creates a partial success audit log
 *
 * @param action - Audit action
 * @param actorUid - User UID
 * @param workspaceId - Optional workspace ID
 * @param meta - Optional metadata (should include error details)
 * @returns Promise resolving to the created document ID
 */
export async function logPartial(
  action: AuditAction,
  actorUid: string,
  workspaceId?: string,
  meta?: Record<string, unknown>
): Promise<string> {
  return createAuditLog({
    action,
    workspaceId,
    actorUid,
    status: AuditStatus.PARTIAL,
    meta,
  });
}
