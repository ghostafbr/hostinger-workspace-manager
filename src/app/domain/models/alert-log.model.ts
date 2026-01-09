import { Timestamp } from 'firebase/firestore';
import { AlertLog } from '../interfaces/alert-log.interface';
import { EntityType } from '../enums/entity-type.enum';

/**
 * Alert Log Model
 *
 * Domain model for alert logs with business logic
 */
export class AlertLogModel implements AlertLog {
  id: string;
  workspaceId: string;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  daysBefore: number;
  expiresAt: Timestamp;
  createdAt: Timestamp;
  processed: boolean;

  constructor(data: AlertLog) {
    this.id = data.id;
    this.workspaceId = data.workspaceId;
    this.entityType = data.entityType;
    this.entityId = data.entityId;
    this.entityName = data.entityName;
    this.daysBefore = data.daysBefore;
    this.expiresAt = data.expiresAt;
    this.createdAt = data.createdAt;
    this.processed = data.processed;
  }

  /**
   * Check if alert is critical (≤ 7 days)
   */
  isCritical(): boolean {
    return this.daysBefore <= 7;
  }

  /**
   * Check if alert is a warning (8-30 days)
   */
  isWarning(): boolean {
    return this.daysBefore > 7 && this.daysBefore <= 30;
  }

  /**
   * Check if alert is informational (> 30 days)
   */
  isInfo(): boolean {
    return this.daysBefore > 30;
  }

  /**
   * Get severity level for UI
   */
  getSeverity(): 'success' | 'info' | 'warn' | 'danger' {
    if (this.daysBefore <= 3) return 'danger';
    if (this.daysBefore <= 7) return 'warn';
    if (this.daysBefore <= 30) return 'info';
    return 'success';
  }

  /**
   * Format days before for display
   */
  getDaysBeforeLabel(): string {
    if (this.daysBefore === 1) return '1 día';
    return `${this.daysBefore} días`;
  }

  /**
   * Get display label for entity type
   */
  getEntityTypeLabel(): string {
    return this.entityType === EntityType.DOMAIN ? 'Dominio' : 'Suscripción';
  }
}
