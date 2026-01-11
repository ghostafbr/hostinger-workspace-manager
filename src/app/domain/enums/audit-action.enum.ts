/**
 * Audit Action Enum
 *
 * Represents the type of action performed in the system for audit logging
 */
export enum AuditAction {
  // Workspace actions
  WORKSPACE_CREATE = 'workspace.create',
  WORKSPACE_UPDATE = 'workspace.update',
  WORKSPACE_DISABLE = 'workspace.disable',
  WORKSPACE_DELETE = 'workspace.delete',

  // Token actions
  TOKEN_SAVE = 'token.save',
  TOKEN_TEST = 'token.test',

  // Sync actions
  SYNC_MANUAL = 'sync.manual',
  SYNC_SCHEDULED = 'sync.scheduled',

  // Alert actions
  ALERT_GENERATE = 'alert.generate',

  // DNS actions (future)
  DNS_VIEW = 'dns.view',
  DNS_VALIDATE = 'dns.validate',
  DNS_SNAPSHOT = 'dns.snapshot',
  DNS_ROLLBACK = 'dns.rollback',

  // Auto-renew actions (future)
  AUTO_RENEW_TOGGLE = 'auto_renew.toggle',
}
