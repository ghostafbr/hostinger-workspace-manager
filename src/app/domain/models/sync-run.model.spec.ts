import { describe, it, expect } from 'vitest';
import { Timestamp } from 'firebase/firestore';
import { SyncRun } from './sync-run.model';
import { SyncRunStatus } from '../enums/sync-run-status.enum';

describe('SyncRun', () => {
  const now = Timestamp.fromDate(new Date());
  const later = Timestamp.fromDate(new Date(Date.now() + 5000));

  it('calcula duración y totales correctamente', () => {
    const s = new SyncRun({
      id: '1',
      workspaceId: 'w',
      startAt: now,
      endAt: later,
      status: SyncRunStatus.SUCCESS,
      domainsProcessed: 3,
      subscriptionsProcessed: 2,
      errors: [],
    });

    expect(s.getTotalProcessed()).toBe(5);
    expect(s.getDurationMs()).toBeGreaterThanOrEqual(0);
    expect(s.getDurationSeconds()).toBeGreaterThanOrEqual(0);
    expect(s.isSuccess()).toBe(true);
    expect(s.hasErrors()).toBe(false);
  });

  it('serializa a Firestore y desde Firestore', () => {
    const s = new SyncRun({
      id: '2',
      workspaceId: 'w2',
      startAt: now,
      status: SyncRunStatus.RUNNING,
      domainsProcessed: 0,
      subscriptionsProcessed: 0,
      errors: [],
    });
    const obj = s.toFirestore();
    expect(obj.workspaceId).toBe('w2');

    const from = SyncRun.fromFirestore('2', {
      ...obj,
      startAt: now,
      status: SyncRunStatus.RUNNING,
    });
    expect(from.id).toBe('2');
    // case: running without endAt -> duration null
    const running = new SyncRun({
      ...s,
      id: 'run',
      endAt: undefined,
      status: SyncRunStatus.RUNNING,
    });
    expect(running.getDurationMs()).toBeNull();
    expect(running.getDurationSeconds()).toBeNull();

    // hasErrors true
    const er = new SyncRun({ ...s, id: 'e', errors: [{ message: 'err', code: 'E' }] as any });
    expect(er.hasErrors()).toBe(true);

    // fromFirestore missing optional fields should default
    const from2 = SyncRun.fromFirestore('3', {
      workspaceId: 'w3',
      startAt: now,
      status: SyncRunStatus.FAILED,
    });
    expect(from2.domainsProcessed).toBe(0);
    expect(from2.errors.length).toBe(0);
  });
});
