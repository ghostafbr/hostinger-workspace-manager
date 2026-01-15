import { describe, it, expect } from 'vitest';
import { Timestamp } from 'firebase/firestore';
import { AlertLogModel } from './alert-log.model';
import { EntityType } from '../enums/entity-type.enum';

describe('AlertLogModel', () => {
  const now = Timestamp.now();

  it('clasifica severidad y etiquetas', () => {
    const a = new AlertLogModel({
      id: '1',
      workspaceId: 'w',
      entityType: EntityType.DOMAIN,
      entityId: 'd1',
      entityName: 'example.com',
      daysBefore: 2,
      expiresAt: now,
      createdAt: now,
      processed: false,
    });

    expect(a.isCritical()).toBe(true);
    expect(a.isWarning()).toBe(false);
    expect(a.getSeverity()).toBe('danger');
    expect(a.getDaysBeforeLabel()).toContain('día');
    expect(a.getEntityTypeLabel()).toBe('Dominio');

    // also test info branch
    const b = new AlertLogModel({ ...a, daysBefore: 40, id: '2' });
    expect(b.isInfo()).toBe(true);
    expect(b.getSeverity()).toBe('success');
  });
});
