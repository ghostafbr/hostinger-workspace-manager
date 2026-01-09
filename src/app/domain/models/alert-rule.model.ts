import { AlertRule } from '../interfaces/alert-rule.interface';
import { EntityType } from '../enums/entity-type.enum';
import { AlertChannel } from '../enums/alert-channel.enum';

/**
 * Alert Rule Model
 *
 * Domain model for alert rules with business logic
 */
export class AlertRuleModel implements AlertRule {
  id: string;
  workspaceId?: string;
  entityType: EntityType;
  daysBefore: number[];
  channel: AlertChannel;
  enabled: boolean;

  constructor(data: AlertRule) {
    this.id = data.id;
    this.workspaceId = data.workspaceId;
    this.entityType = data.entityType;
    this.daysBefore = data.daysBefore;
    this.channel = data.channel;
    this.enabled = data.enabled;
  }

  /**
   * Check if this rule is global (applies to all workspaces)
   */
  isGlobal(): boolean {
    return !this.workspaceId;
  }

  /**
   * Check if this rule applies to a specific workspace
   */
  appliesToWorkspace(workspaceId: string): boolean {
    return this.isGlobal() || this.workspaceId === workspaceId;
  }

  /**
   * Check if should trigger alert for given days remaining
   */
  shouldTrigger(daysRemaining: number): boolean {
    return this.enabled && this.daysBefore.includes(daysRemaining);
  }

  /**
   * Get sorted days before (descending)
   */
  getSortedDaysBefore(): number[] {
    return [...this.daysBefore].sort((a, b) => b - a);
  }

  /**
   * Get display label for entity type
   */
  getEntityTypeLabel(): string {
    return this.entityType === EntityType.DOMAIN ? 'Dominios' : 'Suscripciones';
  }

  /**
   * Get default rule for workspace
   */
  static createDefault(workspaceId: string, entityType: EntityType): AlertRuleModel {
    return new AlertRuleModel({
      id: `default_${workspaceId}_${entityType}`,
      workspaceId,
      entityType,
      daysBefore: [45, 30, 15, 7, 3, 1],
      channel: AlertChannel.logOnly,
      enabled: true,
    });
  }
}
