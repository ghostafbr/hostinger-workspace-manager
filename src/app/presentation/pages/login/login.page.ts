import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@app/application/services/auth.service';
import { FirebaseError } from 'firebase/app';
import { fadeIn, slideUp, shake } from '@app/infrastructure';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
/**
 * Login Page Component
 *
 * Provides authentication interface for users.
 * NO registration option - users must be created in Firebase Console.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    ProgressSpinnerModule,
    InputGroupModule,
    InputGroupAddonModule,
  ],
  animations: [fadeIn, slideUp, shake],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export default class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly errorState = signal<'default' | 'error'>('default');

  /**
   * Handle form submission
   */
  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;

    // Validate that email and password are not null/undefined
    if (!email || !password) {
      this.errorMessage.set('Email y contraseña son requeridos');
      this.isLoading.set(false);
      return;
    }

    try {
      await this.authService.signIn(email, password);
      // Redirect to dashboard on success
      await this.router.navigate(['/dashboard']);
    } catch (error) {
      this.errorState.set('error'); // Trigger shake animation
      setTimeout(() => this.errorState.set('default'), 500); // Reset after animation
      this.handleAuthError(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(error: unknown): void {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          this.errorMessage.set(
            'Email o contraseña incorrectos. Por favor, verifica tus credenciales.',
          );
          break;
        case 'auth/user-disabled':
          this.errorMessage.set('Esta cuenta ha sido deshabilitada. Contacta al administrador.');
          break;
        case 'auth/too-many-requests':
          this.errorMessage.set('Demasiados intentos fallidos. Por favor, intenta más tarde.');
          break;
        case 'auth/network-request-failed':
          this.errorMessage.set('Error de conexión. Verifica tu conexión a internet.');
          break;
        case 'auth/invalid-email':
          this.errorMessage.set('El formato del email no es válido.');
          break;
        default:
          this.errorMessage.set('Error al iniciar sesión. Por favor, intenta de nuevo.');
          console.error('Auth error:', error);
      }
    } else {
      this.errorMessage.set('Error inesperado. Por favor, intenta de nuevo.');
      console.error('Unexpected error:', error);
    }
  }

  /**
   * Check if a field has errors and has been touched
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  /**
   * Get error message for a specific field
   */
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);

    if (!field || !field.errors || !field.touched) {
      return '';
    }

    if (field.errors['required']) {
      return 'Este campo es obligatorio';
    }

    if (field.errors['email']) {
      return 'Ingresa un email válido';
    }

    if (field.errors['minlength']) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }

    return '';
  }
}
