import {
  Component,
  output,
  inject,
  ChangeDetectionStrategy,
  OnInit,
  DestroyRef,
  computed,
  signal,
} from '@angular/core';
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
  template: `
<div class="advanced-search-card">
  <!-- Header -->
  <div class="card-header">
    <div class="title-cluster">
      <div class="icon-indicator">
        <i class="pi pi-search"></i>
      </div>
      <h2>Búsqueda Avanzada</h2>
      @if (activeAdvancedFiltersCount() > 0) {
        <span class="count-badge">{{ activeAdvancedFiltersCount() }}</span>
      }
    </div>

    <div class="header-actions">
      @if (hasActiveFilters()) {
        <button
          pButton
          label="Limpiar"
          icon="pi pi-times"
          class="p-button-text p-button-secondary p-button-sm"
          (click)="clearFilters()"
        ></button>
        <span class="v-divider"></span>
        <button
          pButton
          label="Guardar Filtro"
          icon="pi pi-bookmark"
          class="p-button-text p-button-primary p-button-sm"
          (click)="showSaveDialog = true"
        ></button>
      }
    </div>
  </div>

  <form [formGroup]="searchForm">
    <div class="form-row main-search-row">
      <div class="field search-field">
        <span class="p-input-icon-left w-full">
          <i class="pi pi-search"></i>
          <input
            pInputText
            formControlName="name"
            placeholder="Nombre, ID o dominio..."
            class="w-full"
            (keyup.enter)="applySearch()"
          />
        </span>
      </div>

      <div class="field date-range-field">
        <div class="date-group">
          <div class="date-control">
            <span class="p-input-icon-left w-full">
              <i class="pi pi-calendar"></i>
              <p-datepicker
                ngDefaultControl
                formControlName="lastSyncAfter"
                placeholder="Desde"
                dateFormat="dd/mm/yy"
                [showIcon]="false"
                styleClass="w-full"
              ></p-datepicker>
            </span>
          </div>
          <span class="arrow-separator"><i class="pi pi-arrow-right"></i></span>
          <div class="date-control">
            <span class="p-input-icon-left w-full">
              <i class="pi pi-calendar"></i>
              <p-datepicker
                ngDefaultControl
                formControlName="lastSyncBefore"
                placeholder="Hasta"
                dateFormat="dd/mm/yy"
                [showIcon]="false"
                styleClass="w-full"
              ></p-datepicker>
            </span>
          </div>
        </div>
        @if (searchForm.errors?.['dateRangeInvalid'] && searchForm.touched) {
          <small class="error-msg">Fecha inválida.</small>
        }
      </div>

      <div class="field toggle-field">
        <p-toggleButton
          ngDefaultControl
          formControlName="favoritesOnly"
          onLabel="Favoritos"
          offLabel="Favoritos"
          onIcon="pi pi-star-fill"
          offIcon="pi pi-star"
          styleClass="w-full"
        ></p-toggleButton>
      </div>
    </div>

    @if (isExpanded()) {
    <div class="form-row grid-4">
      <div class="field">
        <label for="status">Estado</label>
        <p-multiSelect
          ngDefaultControl
          inputId="status"
          [options]="statusOptions"
          formControlName="status"
          optionLabel="label"
          optionValue="value"
          display="chip"
          [showClear]="true"
          placeholder="Todos"
          styleClass="w-full"
        ></p-multiSelect>
      </div>

      <div class="field">
        <label for="priority">Prioridad</label>
        <p-multiSelect
          ngDefaultControl
          inputId="priority"
          [options]="priorityOptions"
          formControlName="priority"
          optionLabel="label"
          optionValue="value"
          display="chip"
          [showClear]="true"
          placeholder="Cualquiera"
          styleClass="w-full"
        ></p-multiSelect>
      </div>

      <div class="field">
        <label for="health">Salud</label>
        <p-select
          ngDefaultControl
          inputId="health"
          [options]="errorOptions"
          formControlName="hasErrors"
          optionLabel="label"
          optionValue="value"
          placeholder="Estado de salud"
          styleClass="w-full"
        ></p-select>
      </div>

      <div class="field">
        <label for="tags">Etiquetas</label>
        <span class="p-input-icon-left w-full">
          <i class="pi pi-tags"></i>
          <input
            pInputText
            inputId="tags"
            formControlName="tagsInput"
            placeholder="Separadas por coma..."
            class="w-full"
          />
        </span>
      </div>
    </div>
    }

    @if (savedFilters().length > 0) {
      <div class="saved-filters-row">
        <label>Filtros Guardados:</label>
        <div class="chip-container">
          @for (filter of savedFilters(); track filter.id) {
            <div class="custom-chip" (click)="loadSavedFilter(filter)">
              <span class="name">{{ filter.name }}</span>
              <i
                class="pi pi-times remove-icon"
                (click)="$event.stopPropagation(); deleteSavedFilter(filter.id!)"
              ></i>
            </div>
          }
        </div>
      </div>
    }

    <div class="footer-actions">
      <button
        type="button" 
        pButton
        [label]="isExpanded() ? 'Menos Filtros' : 'Más Filtros'"
        class="p-button-text p-button-sm"
        (click)="toggleFilters()"
      ></button>
      <button
        type="button"
        pButton
        label="Buscar Resultados"
        icon="pi pi-search"
        class="p-button-primary w-full md:w-auto"
        (click)="applySearch()"
      ></button>
    </div>
  </form>

  @if (showSaveDialog) {
    <div class="modal-backdrop" (click)="showSaveDialog = false"></div>
    <div class="modal-dialog">
      <div class="modal-header">
        <h3>Nombrar Filtro</h3>
        <button class="close-btn" (click)="showSaveDialog = false">
          <i class="pi pi-times"></i>
        </button>
      </div>
      <div class="modal-content">
        <input
          pInputText
          type="text"
          [formControl]="saveFilterControl"
          placeholder="Nombre descriptivo..."
          class="w-full"
          autofocus
        />
        @if (saveFilterControl.invalid && saveFilterControl.touched) {
          <small class="text-red-500">Mínimo 3 caracteres.</small>
        }
      </div>
      <div class="modal-footer">
        <button
          pButton
          label="Cancelar"
          class="p-button-text p-button-secondary"
          (click)="showSaveDialog = false"
        ></button>
        <button
          pButton
          label="Guardar"
          [disabled]="saveFilterControl.invalid"
          (click)="saveCurrentFilter()"
        ></button>
      </div>
    </div>
  }
</div>
  `,
  styles: [`
    :host { display: block; }
    .advanced-search-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      transition: box-shadow 0.2s;
    }
    .advanced-search-card:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
    }
    .card-header .title-cluster {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .card-header .title-cluster .icon-indicator {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: var(--surface-50);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-color);
      border: 1px solid #e2e8f0;
    }
    .card-header .title-cluster .icon-indicator i { font-size: 1.2rem; }
    .card-header .title-cluster h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
    }
    .card-header .title-cluster .count-badge {
      background: var(--primary-100);
      color: var(--primary-700);
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 99px;
    }
    .card-header .header-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .card-header .header-actions .v-divider {
      width: 1px;
      height: 20px;
      background: #e2e8f0;
      margin: 0 0.25rem;
    }
    .form-row { margin-bottom: 1.5rem; }
    .form-row.main-search-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: flex-start;
    }
    .form-row.main-search-row .search-field { flex: 1 1 300px; }
    .form-row.main-search-row .date-range-field { flex: 0 0 auto; }
    .form-row.main-search-row .toggle-field { flex: 0 0 auto; width: 160px; }
    .form-row.grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }
    .field { display: flex; flex-direction: column; gap: 0.5rem; }
    .field label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .date-range-field .date-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .date-range-field .date-group .date-control { flex: 0 0 140px; }
    .date-range-field .date-group .arrow-separator {
      color: #64748b;
      padding: 0 0.25rem;
      font-size: 0.8rem;
    }
    .date-range-field .error-msg {
      color: #ef4444;
      font-size: 0.75rem;
      margin-top: 0.25rem;
      display: block;
    }
    .saved-filters-row { margin-bottom: 2rem; }
    .saved-filters-row label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #64748b;
      display: block;
      margin-bottom: 0.75rem;
    }
    .saved-filters-row .chip-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .saved-filters-row .chip-container .custom-chip {
      display: inline-flex;
      align-items: center;
      background: #f1f5f9;
      border: 1px solid transparent;
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      font-size: 0.9rem;
      color: #1e293b;
      cursor: pointer;
      transition: all 0.2s;
    }
    .saved-filters-row .chip-container .custom-chip:hover {
      background: white;
      border-color: #e2e8f0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    .saved-filters-row .chip-container .custom-chip .name {
      margin-right: 0.5rem;
      font-weight: 500;
    }
    .saved-filters-row .chip-container .custom-chip .remove-icon {
      font-size: 0.7rem;
      color: #64748b;
      padding: 4px;
      border-radius: 50%;
    }
    .saved-filters-row .chip-container .custom-chip .remove-icon:hover {
      background: #fee2e2;
      color: #ef4444;
    }
    .footer-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }
    .modal-backdrop {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.4);
      z-index: 1000;
      backdrop-filter: blur(2px);
    }
    .modal-dialog {
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 90%; max-width: 400px;
      background: white;
      padding: 1.5rem;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      z-index: 1001;
      display: flex; flex-direction: column; gap: 1.5rem;
    }
    .modal-dialog .modal-header {
      display: flex; justify-content: space-between; align-items: center;
    }
    .modal-dialog .modal-header h3 {
      margin: 0; font-size: 1.1rem; color: #1e293b;
    }
    .modal-dialog .modal-header .close-btn {
      background: none; border: none; cursor: pointer; color: #64748b;
    }
    .modal-dialog .modal-footer {
      display: flex; justify-content: flex-end; gap: 0.5rem;
    }
  `],
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
    this.searchForm = this.fb.group(
      {
        name: [''],
        status: [[]],
        priority: [[]],
        hasErrors: [null],
        tagsInput: [''],
        tags: [[]],
        favoritesOnly: [false],
        lastSyncAfter: [null],
        lastSyncBefore: [null],
      },
      { validators: this.dateRangeValidator },
    );
  }

  async ngOnInit(): Promise<void> {
    await this.filterService.loadSavedFilters();

    // Track form value changes
    this.searchForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => this.formValue.set(val));

    // Initialize signal with current value
    this.formValue.set(this.searchForm.value);

    // Auto-parse tags
    this.searchForm
      .get('tagsInput')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
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
    this.isExpanded.update((v) => !v);
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
      lastSyncBefore: c.lastSyncBefore ? new Date(c.lastSyncBefore) : null,
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
    return (
      !!val.name ||
      (val.status && val.status.length > 0) ||
      (val.priority && val.priority.length > 0) ||
      (val.tags && val.tags.length > 0) ||
      !!val.favoritesOnly ||
      val.hasErrors !== null ||
      !!val.lastSyncAfter ||
      !!val.lastSyncBefore
    );
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
