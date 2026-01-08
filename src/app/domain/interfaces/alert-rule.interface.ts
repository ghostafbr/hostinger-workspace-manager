import { EntityType } from '../enums/entity-type.enum';
import { AlertChannel } from '../enums/alert-channel.enum';

/**
 * Alert Rule Entity Interface
 *
 * Defines when and how alerts should be triggered
 */
export interface AlertRule {
  /** Unique identifier */
  id: string;

  /** Associated workspace ID (null = global rule) */
  workspaceId?: string;

  /** Type of entity this rule applies to */
  entityType: EntityType;

  /** Array of days before expiration to trigger alerts (e.g., [45, 30, 15, 7, 3, 1]) */
  daysBefore: number[];

  /** Notification channel to use */
  channel: AlertChannel;

  /** Whether this rule is enabled */
  enabled: boolean;
}
