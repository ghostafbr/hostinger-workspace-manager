import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdvancedSearchComponent } from './advanced-search';
import { FilterService } from '@app/application/services/filter.service';
import { ExportService } from '@app/application/services/export.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('AdvancedSearchComponent', () => {
  let component: AdvancedSearchComponent;
  let fixture: ComponentFixture<AdvancedSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedSearchComponent, NoopAnimationsModule],
      providers: [
        {
          provide: FilterService,
          useValue: {
            savedFilters: vi.fn().mockReturnValue([]),
            loadSavedFilters: vi.fn(),
            saveFilter: vi.fn(),
          },
        },
        { provide: ExportService, useValue: { exportToCSV: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdvancedSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle filters visibility', () => {
    const initial = component.isExpanded();
    component.toggleFilters();
    expect(component.isExpanded()).toBe(!initial);
  });
});
