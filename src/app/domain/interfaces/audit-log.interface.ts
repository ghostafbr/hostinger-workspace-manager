import { Timestamp } from 'firebase/firestore';
import { AuditAction } from '../enums/audit-action.enum';
import { AuditStatus } from '../enums/audit-status.enum';

/**
 * Audit Log Entity Interface
 *
 * Represents an audited action in the system
 */
export interface AuditLog {
  /** Unique identifier */
  id: string;

  /** Type of action performed */
  action: AuditAction;

  /** Associated workspace ID (if applicable) */
  workspaceId?: string;

  /** Firebase Auth UID of the user who performed the action */
  actorUid: string;

  /** Email of the user who performed the action */
  actorEmail?: string;

  /** When the action was performed */
  createdAt: Timestamp;

  /** Outcome of the action */
  status: AuditStatus;

  /** Additional metadata (must not contain sensitive information) */
  meta?: Record<string, unknown>;

  /** Error message if the action failed */
  errorMessage?: string;
}
