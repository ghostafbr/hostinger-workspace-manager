import { Component, output, inject, ChangeDetectionStrategy, OnInit, DestroyRef, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePicker } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { Select } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { FilterService } from '@app/application';
import { WorkspaceStatus, type FilterCriteria, type ISavedFilter } from '@app/domain';

/**
 * Advanced Search Component
 *
 * Minimalist "Search Capsule" with expandable drawer for advanced filters.
 */
@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  searchApplied = output<FilterCriteria>();
  searchCleared = output<void>();

  searchForm: FormGroup;

  // UI state
  isExpanded = signal<boolean>(false);
  showSaveDialog = false;
  saveFilterControl = this.fb.control('', [Validators.required, Validators.minLength(3)]);

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
    { label: 'Todos', value: null },
    { label: 'Solo con errores', value: true },
    { label: 'Sin errores', value: false },
  ];

  constructor() {
    this.searchForm = this.fb.group({
      name: [''],
      status: [[]],
      priority: [[]],
      hasErrors: [null],
      tagsInput: [''],
      tags: [[]],
      favoritesOnly: [false],
      lastSyncAfter: [null],
      lastSyncBefore: [null],
    }, { validators: this.dateRangeValidator });
  }

  async ngOnInit(): Promise<void> {
    await this.filterService.loadSavedFilters();
    
    // Track form value changes
    this.searchForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => this.formValue.set(val));

    // Initialize signal with current value
    this.formValue.set(this.searchForm.value);

    // Auto-parse tags
    this.searchForm.get('tagsInput')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
         this.parseTags(value);
      });
  }

  // Signal to track form value changes for computed active count
  private readonly formValue = signal<any>({});

  /**
   * Computed count of active advanced filters (excluding name and favorites which are visible)
   */
  readonly activeAdvancedFiltersCount = computed(() => {
      const val = this.formValue();
      let count = 0;
      if (val.status?.length) count++;
      if (val.priority?.length) count++;
      if (val.tags?.length) count++;
      if (val.hasErrors !== null) count++;
      if (val.lastSyncAfter || val.lastSyncBefore) count++;
      return count;
  });

  toggleFilters(): void {
    this.isExpanded.update(v => !v);
  }

  /**
   * Date Range Validator
   */
  private dateRangeValidator(group: FormGroup): { [key: string]: any } | null {
    const start = group.get('lastSyncAfter')?.value;
    const end = group.get('lastSyncBefore')?.value;

    if (start && end && new Date(start) > new Date(end)) {
      return { dateRangeInvalid: true };
    }
    return null;
  }

  /**
   * Apply current search criteria
   */
  applySearch(): void {
    if (this.searchForm.invalid) {
         this.searchForm.markAllAsTouched();
         // If errors are in the drawer, expand it
         if (this.searchForm.errors?.['dateRangeInvalid']) {
             this.isExpanded.set(true);
         }
         return;
    }

    const val = this.searchForm.value;

    const criteria: FilterCriteria = {
      name: val.name || undefined,
      status: val.status?.length > 0 ? val.status : undefined,
      tags: val.tags?.length > 0 ? val.tags : undefined,
      priority: val.priority?.length > 0 ? val.priority : undefined,
      favoritesOnly: val.favoritesOnly,
      hasErrors: val.hasErrors !== null ? val.hasErrors : undefined,
      lastSyncAfter: val.lastSyncAfter || undefined,
      lastSyncBefore: val.lastSyncBefore || undefined,
    };

    this.filterService.setCurrentFilter(criteria);
    this.searchApplied.emit(criteria);
  }

  activeFavoriteToggle(): void {
      const current = this.searchForm.get('favoritesOnly')?.value;
      this.searchForm.patchValue({ favoritesOnly: !current });
      this.applySearch(); // Auto-apply for single toggles for better UX
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchForm.reset({
      name: '',
      status: [],
      priority: [],
      hasErrors: null,
      tagsInput: '',
      tags: [],
      favoritesOnly: false,
      lastSyncAfter: null,
      lastSyncBefore: null,
    });

    this.filterService.clearFilter();
    this.searchCleared.emit();
  }

  /**
   * Load a saved filter
   */
  loadSavedFilter(filter: ISavedFilter): void {
    const c = filter.criteria;
    
    this.searchForm.patchValue({
        name: c.name || '',
        status: c.status || [],
        priority: c.priority || [],
        hasErrors: c.hasErrors !== undefined ? c.hasErrors : null,
        tags: c.tags || [],
        tagsInput: c.tags ? c.tags.join(', ') : '',
        favoritesOnly: c.favoritesOnly || false,
        lastSyncAfter: c.lastSyncAfter ? new Date(c.lastSyncAfter) : null,
        lastSyncBefore: c.lastSyncBefore? new Date(c.lastSyncBefore) : null
    });

    // If advanced filters are present, expand drawer? 
    // Maybe better to keep it compact unless user wants to see details.
    // Let's autoset favorites only toggle which is visible.
    
    this.applySearch();
  }

  /**
   * Save current criteria as filter
   */
  async saveCurrentFilter(): Promise<void> {
    if (this.saveFilterControl.invalid) {
      this.saveFilterControl.markAsTouched();
      return;
    }

    try {
      this.applySearch(); // Ensure criteria is fresh/valid
      const val = this.searchForm.value;
      const name = this.saveFilterControl.value!;
      
      const criteria: FilterCriteria = {
          name: val.name || undefined,
          status: val.status?.length > 0 ? val.status : undefined,
          tags: val.tags?.length > 0 ? val.tags : undefined,
          priority: val.priority?.length > 0 ? val.priority : undefined,
          favoritesOnly: val.favoritesOnly,
          hasErrors: val.hasErrors !== null ? val.hasErrors : undefined,
          lastSyncAfter: val.lastSyncAfter || undefined,
          lastSyncBefore: val.lastSyncBefore || undefined,
      };

      await this.filterService.saveFilter(name, criteria);
      this.saveFilterControl.reset();
      this.showSaveDialog = false;
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
      const val = this.searchForm.value;
      return !!val.name || 
             (val.status && val.status.length > 0) || 
             (val.priority && val.priority.length > 0) ||
             (val.tags && val.tags.length > 0) ||
             !!val.favoritesOnly ||
             val.hasErrors !== null ||
             !!val.lastSyncAfter ||
             !!val.lastSyncBefore;
  }

  /**
   * Parse tags from input
   */
  private parseTags(input: string | null): void {
    if (!input) {
      this.searchForm.get('tags')?.setValue([]);
      return;
    }
    const parsed = input
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
      this.searchForm.get('tags')?.setValue(parsed);
  }
}
