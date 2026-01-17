import { InjectionToken } from '@angular/core';
import { AlertLogModel } from '../models/alert-log.model';
import { EntityType } from '../enums/entity-type.enum';

export interface AlertFilters {
  entityType?: EntityType;
  daysBefore?: number;
  processed?: boolean;
}

export interface IAlertRepository {
  getAlertsByWorkspace(workspaceId: string, filters?: AlertFilters): Promise<AlertLogModel[]>;
  getAlertsByEntity(
    workspaceId: string,
    entityId: string,
    entityType: EntityType,
  ): Promise<AlertLogModel[]>;
  getCriticalAlerts(workspaceId: string, daysThreshold: number): Promise<AlertLogModel[]>;
}

export const ALERT_REPOSITORY = new InjectionToken<IAlertRepository>('ALERT_REPOSITORY');
