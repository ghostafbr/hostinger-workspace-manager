import { ComponentFixture, TestBed } from '@angular/core/testing';
import DashboardPage from './dashboard.page'; // Default export
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { WorkspaceService } from '../../../application/services/workspace.service';
import { DashboardService } from '../../../application/services/dashboard.service';
import { AuthService } from '../../../application/services/auth.service';
import { ExportService } from '../../../application/services/export.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import {
  NO_ERRORS_SCHEMA,
  signal,
  Component,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarModule } from 'primeng/toolbar';

describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;

  const mockWorkspaceService = {
    getWorkspaces: vi.fn(),
    getWorkspacesStats: vi.fn(),
  };
  const mockAuthService = {
    currentUserSig: signal({ displayName: 'Test User' }),
  };
  const mockExportService = {
    exportToCsv: vi.fn(),
  };
  const mockRouter = {
    navigate: vi.fn(),
  };
  const mockConfirmationService = {
    confirm: vi.fn(),
  };
  const mockMessageService = {
    add: vi.fn(),
  };

  const mockDashboardService = {
    stats: signal(null),
    isLoading: signal(false),
    error: signal(null),
    getExpirationTrends: vi.fn(() => []),
    getUpcomingEvents: vi.fn(async () => []),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPage], // DashboardPage imports Real AdvancedSearchComponent
      providers: [
        { provide: DashboardService, useValue: mockDashboardService },
        provideNoopAnimations(),
        { provide: WorkspaceService, useValue: mockWorkspaceService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ExportService, useValue: mockExportService },
        { provide: Router, useValue: mockRouter },
        { provide: ConfirmationService, useValue: mockConfirmationService },
        { provide: MessageService, useValue: mockMessageService },
        { provide: ActivatedRoute, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })

      .compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
