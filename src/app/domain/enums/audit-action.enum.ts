/**
 * Audit Action Enum
 *
 * Represents the type of action performed in the system for audit logging
 */
export enum AuditAction {
  // Workspace actions
  workspaceCreate = 'workspace.create',
  workspaceUpdate = 'workspace.update',
  workspaceDisable = 'workspace.disable',
  workspaceDelete = 'workspace.delete',

  // Token actions
  tokenSave = 'token.save',
  tokenTest = 'token.test',

  // Sync actions
  syncManual = 'sync.manual',
  syncScheduled = 'sync.scheduled',

  // Alert actions
  alertGenerate = 'alert.generate',

  // DNS actions (future)
  dnsView = 'dns.view',
  dnsValidate = 'dns.validate',
  dnsSnapshot = 'dns.snapshot',
  dnsRollback = 'dns.rollback',

  // Auto-renew actions (future)
  autoRenewToggle = 'auto_renew.toggle',
}
