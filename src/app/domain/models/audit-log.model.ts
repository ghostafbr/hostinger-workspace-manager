import { Timestamp } from 'firebase/firestore';
import { AuditLog } from '../interfaces/audit-log.interface';
import { AuditAction } from '../enums/audit-action.enum';
import { AuditStatus } from '../enums/audit-status.enum';

/**
 * Audit Log Model
 *
 * Domain model for audit logs with business logic
 */
export class AuditLogModel implements AuditLog {
  id: string;
  action: AuditAction;
  workspaceId?: string;
  actorUid: string;
  actorEmail?: string;
  createdAt: Timestamp;
  status: AuditStatus;
  meta?: Record<string, unknown>;
  errorMessage?: string;

  constructor(data: AuditLog) {
    this.id = data.id;
    this.action = data.action;
    this.workspaceId = data.workspaceId;
    this.actorUid = data.actorUid;
    this.actorEmail = data.actorEmail;
    this.createdAt = data.createdAt;
    this.status = data.status;
    this.meta = data.meta;
    this.errorMessage = data.errorMessage;
  }

  /**
   * Check if this audit log represents a successful action
   */
  isSuccess(): boolean {
    return this.status === AuditStatus.success;
  }

  /**
   * Check if this audit log represents a failed action
   */
  isFailure(): boolean {
    return this.status === AuditStatus.failed;
  }

  /**
   * Check if this audit log represents a partially successful action
   */
  isPartial(): boolean {
    return this.status === AuditStatus.partial;
  }

  /**
   * Get severity level for UI
   */
  getSeverity(): 'success' | 'info' | 'warn' | 'danger' {
    switch (this.status) {
      case AuditStatus.success:
        return 'success';
      case AuditStatus.failed:
        return 'danger';
      case AuditStatus.partial:
        return 'warn';
      default:
        return 'info';
    }
  }

  /**
   * Get display label for action
   */
  getActionLabel(): string {
    const labels: Record<string, string> = {
      'workspace.create': 'Crear Workspace',
      'workspace.update': 'Actualizar Workspace',
      'workspace.disable': 'Deshabilitar Workspace',
      'workspace.delete': 'Eliminar Workspace',
      'token.save': 'Guardar Token',
      'token.test': 'Probar Conexión',
      'sync.manual': 'Sincronización Manual',
      'sync.scheduled': 'Sincronización Programada',
      'alert.generate': 'Generar Alertas',
      'dns.view': 'Ver DNS',
      'dns.validate': 'Validar DNS',
      'dns.snapshot': 'Snapshot DNS',
      'dns.rollback': 'Rollback DNS',
    };
    return labels[this.action] || this.action;
  }

  /**
   * Get display label for status
   */
  getStatusLabel(): string {
    const labels: Record<string, string> = {
      success: 'Éxito',
      failure: 'Fallo',
      partial: 'Parcial',
    };
    return labels[this.status] || this.status;
  }

  /**
   * Get icon for action type
   */
  getActionIcon(): string {
    if (this.action.startsWith('workspace.')) return 'pi pi-briefcase';
    if (this.action.startsWith('token.')) return 'pi pi-key';
    if (this.action.startsWith('sync.')) return 'pi pi-sync';
    if (this.action.startsWith('alert.')) return 'pi pi-bell';
    if (this.action.startsWith('dns.')) return 'pi pi-globe';
    return 'pi pi-file';
  }

  /**
   * Check if this is a workspace-related action
   */
  isWorkspaceAction(): boolean {
    return this.action.startsWith('workspace.');
  }

  /**
   * Check if this is a sync-related action
   */
  isSyncAction(): boolean {
    return this.action.startsWith('sync.');
  }
}
