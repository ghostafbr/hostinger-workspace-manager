import { describe, it, expect } from 'vitest';
import { AlertRuleModel } from './alert-rule.model';
import { EntityType } from '../enums/entity-type.enum';
import { AlertChannel } from '../enums/alert-channel.enum';

describe('AlertRuleModel', () => {
  it('valida reglas y disparadores', () => {
    const r = new AlertRuleModel({
      id: '1',
      workspaceId: undefined,
      entityType: EntityType.DOMAIN,
      daysBefore: [7, 3, 1],
      channel: AlertChannel.LOG_ONLY,
      enabled: true,
    });

    expect(r.isGlobal()).toBe(true);
    expect(r.appliesToWorkspace('any')).toBe(true);
    expect(r.shouldTrigger(3)).toBe(true);
    expect(r.getSortedDaysBefore()[0]).toBe(7);

    const def = AlertRuleModel.createDefault('w', EntityType.DOMAIN);
    expect(def.workspaceId).toBe('w');
    expect(def.getEntityTypeLabel()).toBe('Dominios');
    // non-global and disabled rule cases
    const local = new AlertRuleModel({ ...r, workspaceId: 'w1', id: 'local' });
    expect(local.isGlobal()).toBe(false);
    expect(local.appliesToWorkspace('w1')).toBe(true);

    const disabled = new AlertRuleModel({ ...r, enabled: false, id: 'd' });
    expect(disabled.shouldTrigger(3)).toBe(false);
  });
});
