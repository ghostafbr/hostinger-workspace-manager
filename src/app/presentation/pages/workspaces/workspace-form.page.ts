import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

// Services & Models
import { WorkspaceService } from '@app/application/services/workspace.service';
import { WorkspaceStatus } from '@app/domain';

/**
 * Workspace Form Page
 *
 * Handles creation and editing of workspaces
 */
@Component({
  selector: 'app-workspace-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    PasswordModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './workspace-form.page.html',
  styleUrl: './workspace-form.page.scss',
})
export default class WorkspaceFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly messageService = inject(MessageService);

  workspaceForm!: FormGroup;
  isEditMode = false;
  workspaceId: string | null = null;
  isLoading = false;
  showTokenField = false;

  statusOptions = [
    { label: 'Activo', value: WorkspaceStatus.ACTIVE },
    { label: 'Token Inválido', value: WorkspaceStatus.INVALID_TOKEN },
    { label: 'Límite Excedido', value: WorkspaceStatus.RATE_LIMITED },
    { label: 'Error', value: WorkspaceStatus.ERROR },
    { label: 'Desactivado', value: WorkspaceStatus.DISABLED },
  ];

  ngOnInit(): void {
    this.checkEditMode();
  }

  /**
   * Initialize form
   */
  private initForm(): void {
    this.workspaceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      token: [''],
      status: [WorkspaceStatus.ACTIVE, Validators.required],
    });

    // En modo creación, el token es obligatorio
    if (!this.isEditMode) {
      this.workspaceForm.get('token')?.setValidators([Validators.required, Validators.minLength(10)]);
      this.showTokenField = true;
    }
  }

  /**
   * Check if in edit mode and load workspace
   */
  private async checkEditMode(): Promise<void> {
    this.workspaceId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.workspaceId;

    // Initialize form after knowing the mode
    this.initForm();

    if (this.workspaceId) {
      await this.loadWorkspace(this.workspaceId);
    }
  }

  /**
   * Load workspace for editing
   */
  private async loadWorkspace(id: string): Promise<void> {
    try {
      this.isLoading = true;
      const workspace = await this.workspaceService.getWorkspaceById(id);

      if (!workspace) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Workspace no encontrado',
        });
        this.router.navigate(['/workspaces']);
        return;
      }

      this.workspaceForm.patchValue({
        name: workspace.name,
        description: workspace.description || '',
        status: workspace.status,
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar el workspace',
      });
      this.router.navigate(['/workspaces']);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Submit form
   */
  async onSubmit(): Promise<void> {
    if (this.workspaceForm.invalid) {
      Object.keys(this.workspaceForm.controls).forEach(key => {
        this.workspaceForm.get(key)?.markAsTouched();
      });
      return;
    }

    try {
      this.isLoading = true;
      const formValue = this.workspaceForm.value;

      if (this.isEditMode && this.workspaceId) {
        await this.workspaceService.updateWorkspace(this.workspaceId, formValue);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Workspace actualizado correctamente',
        });
      } else {
        await this.workspaceService.createWorkspace(formValue);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Workspace creado correctamente',
        });
      }

      setTimeout(() => {
        this.router.navigate(['/workspaces']);
      }, 1000);
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: this.isEditMode
          ? 'No se pudo actualizar el workspace'
          : 'No se pudo crear el workspace',
      });
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Show token field for pasting new token (edit mode)
   */
  onPasteNewToken(): void {
    this.showTokenField = true;
    this.workspaceForm.get('token')?.setValidators([Validators.required, Validators.minLength(10)]);
    this.workspaceForm.get('token')?.updateValueAndValidity();
  }

  /**
   * Cancel and go back
   */
  onCancel(): void {
    this.router.navigate(['/workspaces']);
  }

  /**
   * Get form control
   */
  getControl(name: string) {
    return this.workspaceForm.get(name);
  }

  /**
   * Check if field is invalid
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.workspaceForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Get error message for field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.workspaceForm.get(fieldName);
    if (field?.hasError('required')) {
      return fieldName === 'token'
        ? 'Debe pegar el token de Hostinger'
        : 'Este campo es obligatorio';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    return '';
  }
}
