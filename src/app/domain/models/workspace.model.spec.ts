import { describe, it, expect } from 'vitest';
import { Workspace } from './workspace.model';
import { WorkspaceStatus } from '../enums/workspace-status.enum';

describe('Workspace model', () => {
  const base = {
    id: 'w1',
    name: 'My WS',
    userId: 'u1',
    status: WorkspaceStatus.ACTIVE,
    createdAt: new Date() as unknown,
    updatedAt: new Date() as unknown,
  } as const;

  it('constructs and exposes properties', () => {
    const ws = new Workspace({ ...base });
    expect(ws.id).toBe('w1');
    expect(ws.name).toBe('My WS');
    expect(ws.isHealthy()).toBe(true);
  });

  it('checks various status helpers', () => {
    expect(new Workspace({ ...base, status: WorkspaceStatus.ACTIVE }).isHealthy()).toBe(true);
    expect(new Workspace({ ...base, status: WorkspaceStatus.INVALID_TOKEN }).hasTokenIssue()).toBe(true);
    expect(new Workspace({ ...base, status: WorkspaceStatus.RATE_LIMITED }).isRateLimited()).toBe(true);
    expect(new Workspace({ ...base, status: WorkspaceStatus.DISABLED }).isDisabled()).toBe(true);
    expect(new Workspace({ ...base, status: WorkspaceStatus.DISABLED }).canSync()).toBe(false);
    expect(new Workspace({ ...base, status: WorkspaceStatus.INVALID_TOKEN }).canSync()).toBe(false);
    expect(new Workspace({ ...base, status: WorkspaceStatus.ACTIVE }).canSync()).toBe(true);
  });

  it('returns human readable status messages', () => {
    expect(new Workspace({ ...base, status: WorkspaceStatus.ACTIVE }).getStatusMessage()).toBe('Active');
    expect(new Workspace({ ...base, status: WorkspaceStatus.INVALID_TOKEN }).getStatusMessage()).toBe('Invalid Token');
    expect(new Workspace({ ...base, status: WorkspaceStatus.RATE_LIMITED }).getStatusMessage()).toBe('Rate Limited');
    expect(new Workspace({ ...base, status: WorkspaceStatus.ERROR }).getStatusMessage()).toBe('Error');
    expect(new Workspace({ ...base, status: WorkspaceStatus.DISABLED }).getStatusMessage()).toBe('Disabled');
  });

  it('serializes to firestore and can be created from firestore data', () => {
    const ws = new Workspace({ ...base, tags: ['a'], priority: 2, isFavorite: true });
    const obj = ws.toFirestore();
    expect(obj.name).toBe('My WS');
    expect(obj.tags).toEqual(['a']);

    const from = Workspace.fromFirestore('w2', {
      name: 'from',
      userId: 'u2',
      status: WorkspaceStatus.ERROR,
      createdAt: new Date() as unknown,
      updatedAt: new Date() as unknown,
    });
    expect(from.id).toBe('w2');
    expect(from.status).toBe(WorkspaceStatus.ERROR);
  });
});
