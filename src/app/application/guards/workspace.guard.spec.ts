import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { workspaceGuard } from './workspace.guard';
import { WorkspaceContextService } from '../services/workspace-context.service';
import { WorkspaceService } from '../services/workspace.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError, firstValueFrom } from 'rxjs';
import { Workspace } from '@app/domain';

describe('workspaceGuard', () => {
  let workspaceContext: WorkspaceContextService;
  let workspaceService: WorkspaceService;
  let router: Router;
  let route: ActivatedRouteSnapshot;

  beforeEach(() => {
    const workspaceContextMock = {
      getCurrentWorkspace: vi.fn(),
      selectWorkspace: vi.fn(),
    };

    const workspaceServiceMock = {
      getWorkspaceById: vi.fn(),
    };

    const routerMock = {
      navigate: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: WorkspaceContextService, useValue: workspaceContextMock },
        { provide: WorkspaceService, useValue: workspaceServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    workspaceContext = TestBed.inject(WorkspaceContextService);
    workspaceService = TestBed.inject(WorkspaceService);
    router = TestBed.inject(Router);

    route = {
      paramMap: {
        get: vi.fn(),
      },
    } as any;
  });

  it('should deny access and redirect when no workspaceId in route', async () => {
    vi.mocked(route.paramMap.get).mockReturnValue(null);

    const result = await TestBed.runInInjectionContext(() =>
      workspaceGuard(route, {} as any)
    );

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/workspaces']);
  });

  it('should allow access when workspace is already in context with matching ID', async () => {
    const workspaceId = 'workspace-123';
    const workspace = { id: workspaceId, name: 'Test Workspace' } as Workspace;

    vi.mocked(route.paramMap.get).mockReturnValue(workspaceId);
    vi.mocked(workspaceContext.getCurrentWorkspace).mockReturnValue(workspace);

    const result = await TestBed.runInInjectionContext(() =>
      workspaceGuard(route, {} as any)
    );

    expect(result).toBe(true);
    expect(workspaceService.getWorkspaceById).not.toHaveBeenCalled();
  });

  it('should load workspace and update context when valid workspace found', async () => {
    const workspaceId = 'workspace-456';
    const workspace = { id: workspaceId, name: 'New Workspace' } as Workspace;

    vi.mocked(route.paramMap.get).mockReturnValue(workspaceId);
    vi.mocked(workspaceContext.getCurrentWorkspace).mockReturnValue(null);
    vi.mocked(workspaceService.getWorkspaceById).mockReturnValue(of(workspace));

    const result = await TestBed.runInInjectionContext(async () => {
      const result$ = workspaceGuard(route, {} as any);

      if (typeof result$ === 'object' && 'subscribe' in result$) {
        return await firstValueFrom(result$);
      }
      return result$;
    });

    expect(result).toBe(true);
    expect(workspaceContext.selectWorkspace).toHaveBeenCalledWith(workspace);
  });

  it('should redirect when workspace not found', async () => {
    const workspaceId = 'nonexistent-workspace';

    vi.mocked(route.paramMap.get).mockReturnValue(workspaceId);
    vi.mocked(workspaceContext.getCurrentWorkspace).mockReturnValue(null);
    vi.mocked(workspaceService.getWorkspaceById).mockReturnValue(of(null));

    const result = await TestBed.runInInjectionContext(async () => {
      const result$ = workspaceGuard(route, {} as any);

      if (typeof result$ === 'object' && 'subscribe' in result$) {
        return await firstValueFrom(result$);
      }
      return result$;
    });

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/workspaces']);
  });

  it('should handle errors and redirect', async () => {
    const workspaceId = 'error-workspace';
    const error = new Error('Database error');

    vi.mocked(route.paramMap.get).mockReturnValue(workspaceId);
    vi.mocked(workspaceContext.getCurrentWorkspace).mockReturnValue(null);
    vi.mocked(workspaceService.getWorkspaceById).mockReturnValue(throwError(() => error));

    const result = await TestBed.runInInjectionContext(async () => {
      const result$ = workspaceGuard(route, {} as any);

      if (typeof result$ === 'object' && 'subscribe' in result$) {
        return await firstValueFrom(result$);
      }
      return result$;
    });

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/workspaces']);
  });
});
