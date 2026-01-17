import { InjectionToken } from '@angular/core';
import { IDomain, ISubscription } from '../index';

export interface IDashboardRepository {
  getWorkspacesByUserId(userId: string): Promise<any[]>; // Returns Workspace[]
  getDomainsByWorkspaceIds(workspaceIds: string[]): Promise<IDomain[]>;
  getSubscriptionsByWorkspaceIds(workspaceIds: string[]): Promise<ISubscription[]>;
}

export const DASHBOARD_REPOSITORY = new InjectionToken<IDashboardRepository>(
  'DASHBOARD_REPOSITORY',
);
