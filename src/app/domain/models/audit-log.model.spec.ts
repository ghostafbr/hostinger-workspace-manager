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
    expect(a.getActionIcon()).toContain('fa');
    expect(a.isWorkspaceAction()).toBe(true);
    // status label and partial
    expect(a.getStatusLabel()).toBe('Éxito');
    const p = new AuditLogModel({ ...a, status: AuditStatus.PARTIAL, id: 'p' });
    expect(p.isPartial()).toBe(true);

    // unknown action defaults
    const u = new AuditLogModel({ ...a, action: 'unknown.action' as any, id: 'u' });
    expect(u.getActionLabel()).toBe('unknown.action');
    expect(u.getActionIcon()).toBe('fa fa-file-text');
    // other action prefixes
    const t = new AuditLogModel({ ...a, action: 'token.save' as AuditAction, id: 't' });
    expect(t.getActionIcon()).toBe('fa fa-key');

    const s = new AuditLogModel({ ...a, action: 'sync.manual' as AuditAction, id: 's' });
    expect(s.getActionIcon()).toBe('fa fa-refresh');

    const al = new AuditLogModel({ ...a, action: 'alert.generate' as AuditAction, id: 'al' });
    expect(al.getActionIcon()).toBe('fa fa-bell');

    const d = new AuditLogModel({ ...a, status: AuditStatus.FAILED, id: 'd' });
    expect(d.isFailure()).toBe(true);
    expect(d.getSeverity()).toBe('danger');
    const syncA = new AuditLogModel({ ...a, action: 'sync.scheduled' as AuditAction, id: 'ss' });
    expect(syncA.isSyncAction()).toBe(true);
  });
});
