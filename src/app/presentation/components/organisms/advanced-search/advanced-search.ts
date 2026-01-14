import { Component, output, signal, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { Select } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { FilterService } from '@app/application';
import { WorkspaceStatus, type FilterCriteria, type ISavedFilter } from '@app/domain';

/**
 * Advanced Search Component
 *
 * Multi-criteria search with save/load filters
 */
@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    MultiSelectModule,
    ButtonModule,
    DatePicker,
    CheckboxModule,
    Select,
    TooltipModule,
  ],
  templateUrl: './advanced-search.html',
  styleUrl: './advanced-search.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvancedSearchComponent implements OnInit {
  private readonly filterService = inject(FilterService);

  searchApplied = output<FilterCriteria>();
  searchCleared = output<void>();

  // Filter criteria
  name = signal<string>('');
  selectedStatuses = signal<WorkspaceStatus[]>([]);
  tagsInput = signal<string>('');
  tags = signal<string[]>([]);
  selectedPriorities = signal<number[]>([]);
  favoritesOnly = signal<boolean>(false);
  hasErrors = signal<boolean | undefined>(undefined);
  lastSyncAfter = signal<Date | undefined>(undefined);
  lastSyncBefore = signal<Date | undefined>(undefined);

  // UI state
  saveFilterName = signal<string>('');
  showSaveDialog = signal<boolean>(false);

  // Saved filters
  savedFilters = this.filterService.savedFilters;

  // Options
  readonly statusOptions = [
    { label: 'Activo', value: WorkspaceStatus.ACTIVE },
    { label: 'Error', value: WorkspaceStatus.ERROR },
    { label: 'Deshabilitado', value: WorkspaceStatus.DISABLED },
    { label: 'Token Inválido', value: WorkspaceStatus.INVALID_TOKEN },
    { label: 'Rate Limited', value: WorkspaceStatus.RATE_LIMITED },
  ];

  readonly priorityOptions = [
    { label: '⭐ 1 - Muy Baja', value: 1 },
    { label: '⭐⭐ 2 - Baja', value: 2 },
    { label: '⭐⭐⭐ 3 - Media', value: 3 },
    { label: '⭐⭐⭐⭐ 4 - Alta', value: 4 },
    { label: '⭐⭐⭐⭐⭐ 5 - Crítica', value: 5 },
  ];

  readonly errorOptions = [
    { label: 'Todos', value: undefined },
    { label: 'Solo con errores', value: true },
    { label: 'Sin errores', value: false },
  ];

  async ngOnInit(): Promise<void> {
    await this.filterService.loadSavedFilters();
  }

  /**
   * Apply current search criteria
   */
  applySearch(): void {
    const criteria: FilterCriteria = {
      name: this.name() || undefined,
      status: this.selectedStatuses().length > 0 ? this.selectedStatuses() : undefined,
      tags: this.tags().length > 0 ? this.tags() : undefined,
      priority: this.selectedPriorities().length > 0 ? this.selectedPriorities() : undefined,
      favoritesOnly: this.favoritesOnly(),
      hasErrors: this.hasErrors(),
      lastSyncAfter: this.lastSyncAfter(),
      lastSyncBefore: this.lastSyncBefore(),
    };

    this.filterService.setCurrentFilter(criteria);
    this.searchApplied.emit(criteria);
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.name.set('');
    this.selectedStatuses.set([]);
    this.tags.set([]);
    this.selectedPriorities.set([]);
    this.favoritesOnly.set(false);
    this.hasErrors.set(undefined);
    this.lastSyncAfter.set(undefined);
    this.lastSyncBefore.set(undefined);

    this.filterService.clearFilter();
    this.searchCleared.emit();
  }

  /**
   * Load a saved filter
   */
  loadSavedFilter(filter: ISavedFilter): void {
    const c = filter.criteria;
    this.name.set(c.name || '');
    this.selectedStatuses.set(c.status || []);
    this.tags.set(c.tags || []);
    this.selectedPriorities.set(c.priority || []);
    this.favoritesOnly.set(c.favoritesOnly || false);
    this.hasErrors.set(c.hasErrors);
    this.lastSyncAfter.set(c.lastSyncAfter);
    this.lastSyncBefore.set(c.lastSyncBefore);

    this.applySearch();
  }

  /**
   * Save current criteria as filter
   */
  async saveCurrentFilter(): Promise<void> {
    const name = this.saveFilterName();
    if (!name) return;

    try {
      const criteria: FilterCriteria = {
        name: this.name() || undefined,
        status: this.selectedStatuses().length > 0 ? this.selectedStatuses() : undefined,
        tags: this.tags().length > 0 ? this.tags() : undefined,
        priority: this.selectedPriorities().length > 0 ? this.selectedPriorities() : undefined,
        favoritesOnly: this.favoritesOnly(),
        hasErrors: this.hasErrors(),
        lastSyncAfter: this.lastSyncAfter(),
        lastSyncBefore: this.lastSyncBefore(),
      };

      await this.filterService.saveFilter(name, criteria);
      this.saveFilterName.set('');
      this.showSaveDialog.set(false);
    } catch (error) {
      console.error('Error saving filter:', error);
    }
  }

  /**
   * Delete a saved filter
   */
  async deleteSavedFilter(filterId: string): Promise<void> {
    try {
      await this.filterService.deleteFilter(filterId);
    } catch (error) {
      console.error('Error deleting filter:', error);
    }
  }

  /**
   * Check if any filter is active
   */
  hasActiveFilters(): boolean {
    return (
      !!this.name() ||
      this.selectedStatuses().length > 0 ||
      this.tags().length > 0 ||
      this.selectedPriorities().length > 0 ||
      this.favoritesOnly() ||
      this.hasErrors() !== undefined ||
      !!this.lastSyncAfter() ||
      !!this.lastSyncBefore()
    );
  }

  /**
   * Parse tags from input
   */
  parseTags(): void {
    const input = this.tagsInput();
    if (!input) {
      this.tags.set([]);
      return;
    }
    const parsed = input
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    this.tags.set(parsed);
  }
}
