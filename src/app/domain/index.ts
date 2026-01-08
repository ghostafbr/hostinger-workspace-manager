/**
 * Domain Layer Barrel Exports
 *
 * This file serves as the public API for the domain layer.
 * All domain entities, interfaces, models, and enums are exported from here.
 *
 * Naming Convention:
 * - Interfaces: Exported with 'I' prefix (e.g., IWorkspace)
 * - Models (classes): Exported with original name (e.g., Workspace)
 * - Enums: Exported with original name
 */

// Enums
export * from './enums/workspace-status.enum';
export * from './enums/sync-run-status.enum';
export * from './enums/alert-channel.enum';
export * from './enums/entity-type.enum';
export * from './enums/audit-action.enum';
export * from './enums/audit-status.enum';
export * from './enums/dns-record-type.enum';

// Interfaces (exported with 'I' prefix to avoid naming conflicts with models)
export type { Workspace as IWorkspace } from './interfaces/workspace.interface';
export type { Domain as IDomain } from './interfaces/domain.interface';
export type { Subscription as ISubscription } from './interfaces/subscription.interface';
export type { SyncRun as ISyncRun, SyncError } from './interfaces/sync-run.interface';
export type { AlertRule as IAlertRule } from './interfaces/alert-rule.interface';
export type { AlertLog as IAlertLog } from './interfaces/alert-log.interface';
export type { AuditLog as IAuditLog } from './interfaces/audit-log.interface';
export type { DnsRecord as IDnsRecord } from './interfaces/dns-record.interface';

// Models (classes with business logic)
export { Workspace } from './models/workspace.model';
export { Domain } from './models/domain.model';
export { Subscription } from './models/subscription.model';
export { SyncRun } from './models/sync-run.model';
