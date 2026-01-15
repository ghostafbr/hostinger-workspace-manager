import { describe, it, expect } from 'vitest';
import { Timestamp } from 'firebase/firestore';
import { AuditLogModel } from './audit-log.model';
import { AuditAction } from '../enums/audit-action.enum';
import { AuditStatus } from '../enums/audit-status.enum';

describe('AuditLogModel', () => {
  const now = Timestamp.now();

  it('determina estados y etiquetas', () => {
    const a = new AuditLogModel({
      id: '1',
      action: 'workspace.create' as AuditAction,
      workspaceId: 'w',
      actorUid: 'u',
      actorEmail: 'a@x.com',
      createdAt: now,
      status: AuditStatus.SUCCESS,
    });

    expect(a.isSuccess()).toBe(true);
    expect(a.getSeverity()).toBe('success');
    expect(a.getActionLabel()).toContain('Crear');
    expect(a.getActionIcon()).toContain('pi');
    expect(a.isWorkspaceAction()).toBe(true);
    // status label and partial
    expect(a.getStatusLabel()).toBe('Éxito');
    const p = new AuditLogModel({ ...a, status: AuditStatus.PARTIAL, id: 'p' });
    expect(p.isPartial()).toBe(true);

    // unknown action defaults
    const u = new AuditLogModel({ ...a, action: 'unknown.action' as any, id: 'u' });
    expect(u.getActionLabel()).toBe('unknown.action');
    expect(u.getActionIcon()).toBe('pi pi-file');
  });
});
