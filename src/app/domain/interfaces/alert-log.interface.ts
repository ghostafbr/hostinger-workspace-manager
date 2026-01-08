import { Timestamp } from 'firebase/firestore';
import { EntityType } from '../enums/entity-type.enum';

/**
 * Alert Log Entity Interface
 *
 * Represents a triggered alert for an entity
 */
export interface AlertLog {
  /** Unique identifier */
  id: string;

  /** Associated workspace ID */
  workspaceId: string;

  /** Type of entity (domain or subscription) */
  entityType: EntityType;

  /** ID of the entity that triggered the alert */
  entityId: string;

  /** Name of the entity for display purposes */
  entityName: string;

  /** Number of days before expiration when this alert was triggered */
  daysBefore: number;

  /** When the entity expires */
  expiresAt: Timestamp;

  /** When this alert was created */
  createdAt: Timestamp;

  /** Whether this alert has been processed (sent, logged, etc.) */
  processed: boolean;
}
