import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Timestamp } from 'firebase/firestore';
import { EmailService } from '@app/application';
import type { IEmailConfig, IEmailLog } from '@app/domain';
import { EmailProvider } from '@app/domain';
import { WorkspaceContextService } from '@app/application/services/workspace-context.service';
import { EncryptionService } from '@app/application/services/encryption.service';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { PasswordModule } from 'primeng/password';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-email-config',
  standalone: true,
  imports: [
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    ToggleButtonModule,
    InputNumberModule,
    MessageModule,
    TableModule,
    TagModule,
    TooltipModule,
    PasswordModule,
    Select,
  ],
  templateUrl: './email-config.page.html',
  styleUrl: './email-config.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailConfigPage implements OnInit {
  private readonly emailService = inject(EmailService);
  private readonly workspaceContext = inject(WorkspaceContextService);
  private readonly encryptionService = inject(EncryptionService);
  private readonly router = inject(Router);

  // Signals
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isSendingTest = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly config = signal<IEmailConfig | null>(null);
  readonly emailLogs = signal<IEmailLog[]>([]);
  readonly showApiKey = signal(false);

  // Form model signals
  readonly enabled = signal(true);
  readonly providerType = signal<EmailProvider>(EmailProvider.SMTP);
  readonly recipientEmail = signal('andres.fbramirez@gmail.com');
  readonly ccEmails = signal<string[]>([]);
  readonly fromEmail = signal('afbolanos@andres-bolanos.dev');
  readonly fromName = signal('Hostinger Workspace Manager');
  readonly apiKey = signal(''); // For SendGrid
  readonly smtpHost = signal('smtp.hostinger.com');
  readonly smtpPort = signal(465);
  readonly smtpSecure = signal(true);
  readonly smtpUsername = signal('afbolanos@andres-bolanos.dev');
  readonly smtpPassword = signal('');
  readonly maxPerHour = signal(10);
  readonly maxPerDay = signal(50);
  readonly maxRetryAttempts = signal(3);
  readonly retryDelayMinutes = signal(5);

  // Payment options signals
  readonly wompiPublicKey = signal('');
  readonly wompiIntegrityKey = signal('');
  readonly bancolombiaAccountType = signal<'ahorros' | 'corriente'>('ahorros');
  readonly bancolombiaAccountNumber = signal('');
  readonly bancolombiaOwnerName = signal('');
  readonly bancolombiaOwnerDocument = signal('');
  readonly nequiPhoneNumber = signal('');
  readonly nequiOwnerName = signal('');

  // Provider options
  readonly providerOptions = [
    { label: 'SMTP (Hostinger, Gmail, etc.)', value: EmailProvider.SMTP },
    { label: 'SendGrid API', value: EmailProvider.SENDGRID },
  ];

  // Enum reference for template
  readonly EmailProvider = EmailProvider;

  // Computed
  readonly currentWorkspace = computed(() => this.workspaceContext.getCurrentWorkspace());
  readonly canSave = computed(() => {
    const hasBasicFields =
      this.recipientEmail().trim() !== '' &&
      this.fromEmail().trim() !== '' &&
      this.fromName().trim() !== '';

    if (!hasBasicFields) return false;

    if (this.providerType() === EmailProvider.SMTP) {
      return (
        this.smtpHost().trim() !== '' &&
        this.smtpUsername().trim() !== '' &&
        (this.smtpPassword().trim() !== '' || this.config() !== null)
      );
    } else {
      return this.apiKey().trim() !== '' || this.config() !== null;
    }
  });

  async ngOnInit(): Promise<void> {
    await this.loadConfig();
  }

  async loadConfig(): Promise<void> {
    const workspace = this.currentWorkspace();
    if (!workspace?.id) {
      this.error.set('No workspace selected');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const config = await this.emailService.getEmailConfig(workspace.id);

      if (config) {
        this.config.set(config);
        this.enabled.set(config.enabled);
        this.providerType.set(config.providerType || EmailProvider.SMTP);
        this.recipientEmail.set(config.recipientEmail);
        this.ccEmails.set(config.ccEmails || []);
        this.fromEmail.set(config.provider.fromEmail);
        this.fromName.set(config.provider.fromName);

        // Load SMTP settings if provider is SMTP
        if (config.providerType === EmailProvider.SMTP && config.provider.smtp) {
          this.smtpHost.set(config.provider.smtp.host);
          this.smtpPort.set(config.provider.smtp.port);
          this.smtpSecure.set(config.provider.smtp.secure);
          this.smtpUsername.set(config.provider.smtp.username);
        }

        this.maxPerHour.set(config.rateLimit?.maxPerHour || 10);
        this.maxPerDay.set(config.rateLimit?.maxPerDay || 50);
        this.maxRetryAttempts.set(config.retry?.maxAttempts || 3);
        this.retryDelayMinutes.set(config.retry?.delayMinutes || 5);

        // Load payment options if available
        if (config.paymentOptions) {
          this.wompiPublicKey.set(config.paymentOptions.wompiPublicKey || '');
          this.wompiIntegrityKey.set(config.paymentOptions.wompiIntegrityKey || '');
          this.bancolombiaAccountType.set(config.paymentOptions.bancolombia?.accountType || 'ahorros');
          this.bancolombiaAccountNumber.set(config.paymentOptions.bancolombia?.accountNumber || '');
          this.bancolombiaOwnerName.set(config.paymentOptions.bancolombia?.ownerName || '');
          this.bancolombiaOwnerDocument.set(config.paymentOptions.bancolombia?.ownerDocument || '');
          this.nequiPhoneNumber.set(config.paymentOptions.nequi?.phoneNumber || '');
          this.nequiOwnerName.set(config.paymentOptions.nequi?.ownerName || '');
        }

        // Don't show actual API key/password for security
      }

      // Load email logs
      await this.loadEmailLogs();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.error.set(`Failed to load configuration: ${message}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadEmailLogs(): Promise<void> {
    const workspace = this.currentWorkspace();
    if (!workspace?.id) return;

    try {
      const logs = await this.emailService.getEmailLogs(workspace.id, 20);
      this.emailLogs.set(logs);
    } catch (err: unknown) {
      console.error('Failed to load email logs:', err);
    }
  }

  onCCEmailsChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    const emails = target.value
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email.length > 0);
    this.ccEmails.set(emails);
  }

  async onSave(): Promise<void> {
    const workspace = this.currentWorkspace();
    if (!workspace?.id) {
      this.error.set('No workspace selected');
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);
    this.success.set(null);

    try {
      let emailConfig: Omit<IEmailConfig, 'id' | 'createdAt'>;

      if (this.providerType() === EmailProvider.SMTP) {
        // SMTP configuration
        const passwordValue = this.smtpPassword();
        const encryptedPassword =
          passwordValue.trim() !== ''
            ? this.encryptionService.encrypt(passwordValue)
            : this.config()?.provider.smtp?.password;

        if (!encryptedPassword) {
          throw new Error('SMTP password is required');
        }

        emailConfig = {
          workspaceId: workspace.id,
          enabled: this.enabled(),
          providerType: EmailProvider.SMTP,
          recipientEmail: this.recipientEmail(),
          ccEmails: this.ccEmails(),
          provider: {
            smtp: {
              host: this.smtpHost(),
              port: this.smtpPort(),
              secure: this.smtpSecure(),
              username: this.smtpUsername(),
              password: encryptedPassword,
            },
            fromEmail: this.fromEmail(),
            fromName: this.fromName(),
          },
          rateLimit: {
            maxPerHour: this.maxPerHour(),
            maxPerDay: this.maxPerDay(),
          },
          retry: {
            maxAttempts: this.maxRetryAttempts(),
            delayMinutes: this.retryDelayMinutes(),
          },
          paymentOptions: {
            wompiPublicKey: this.wompiPublicKey().trim() || undefined,
            wompiIntegrityKey: this.wompiIntegrityKey().trim() || undefined,
            bancolombia: this.bancolombiaAccountNumber().trim()
              ? {
                  accountType: this.bancolombiaAccountType(),
                  accountNumber: this.bancolombiaAccountNumber(),
                  ownerName: this.bancolombiaOwnerName(),
                  ownerDocument: this.bancolombiaOwnerDocument(),
                }
              : undefined,
            nequi: this.nequiPhoneNumber().trim()
              ? {
                  phoneNumber: this.nequiPhoneNumber(),
                  ownerName: this.nequiOwnerName(),
                }
              : undefined,
          },
        };
      } else {
        // SendGrid configuration
        const apiKeyValue = this.apiKey();
        const encryptedApiKey =
          apiKeyValue.trim() !== ''
            ? this.encryptionService.encrypt(apiKeyValue)
            : this.config()?.provider.apiKey;

        if (!encryptedApiKey) {
          throw new Error('SendGrid API key is required');
        }

        emailConfig = {
          workspaceId: workspace.id,
          enabled: this.enabled(),
          providerType: EmailProvider.SENDGRID,
          recipientEmail: this.recipientEmail(),
          ccEmails: this.ccEmails(),
          provider: {
            apiKey: encryptedApiKey,
            fromEmail: this.fromEmail(),
            fromName: this.fromName(),
          },
          rateLimit: {
            maxPerHour: this.maxPerHour(),
            maxPerDay: this.maxPerDay(),
          },
          retry: {
            maxAttempts: this.maxRetryAttempts(),
            delayMinutes: this.retryDelayMinutes(),
          },
          paymentOptions: {
            wompiPublicKey: this.wompiPublicKey().trim() || undefined,
            wompiIntegrityKey: this.wompiIntegrityKey().trim() || undefined,
            bancolombia: this.bancolombiaAccountNumber().trim()
              ? {
                  accountType: this.bancolombiaAccountType(),
                  accountNumber: this.bancolombiaAccountNumber(),
                  ownerName: this.bancolombiaOwnerName(),
                  ownerDocument: this.bancolombiaOwnerDocument(),
                }
              : undefined,
            nequi: this.nequiPhoneNumber().trim()
              ? {
                  phoneNumber: this.nequiPhoneNumber(),
                  ownerName: this.nequiOwnerName(),
                }
              : undefined,
          },
        };
      }

      if (this.config()) {
        await this.emailService.updateEmailConfig(workspace.id, emailConfig);
        this.success.set('Configuration updated successfully');
      } else {
        await this.emailService.createEmailConfig(emailConfig);
        this.success.set('Configuration created successfully');
      }

      // Clear sensitive inputs after save
      this.apiKey.set('');
      this.smtpPassword.set('');

      await this.loadConfig();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.error.set(`Failed to save configuration: ${message}`);
    } finally {
      this.isSaving.set(false);
    }
  }

  async onDelete(): Promise<void> {
    const workspace = this.currentWorkspace();
    if (!workspace?.id) return;

    if (!confirm('Are you sure you want to delete the email configuration?')) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      await this.emailService.deleteEmailConfig(workspace.id);
      this.success.set('Configuration deleted successfully');
      this.config.set(null);
      this.resetForm();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.error.set(`Failed to delete configuration: ${message}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }

  async onSendTestEmail(): Promise<void> {
    const workspace = this.currentWorkspace();
    if (!workspace?.id) {
      this.error.set('No workspace selected');
      return;
    }

    // Verificar que hay configuración guardada
    if (!this.config()) {
      this.error.set('Debes guardar la configuración antes de enviar un email de prueba');
      return;
    }

    this.isSendingTest.set(true);
    this.error.set(null);
    this.success.set(null);

    try {
      // Llamar a la función HTTP createTestAlert
      const response = await fetch(
        'https://us-central1-hostinger-workspace-manager.cloudfunctions.net/createTestAlert',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: this.recipientEmail(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const alertResult = await response.json();

      // Llamar a runGenerateAlerts para procesar la alerta
      const processResponse = await fetch(
        'https://us-central1-hostinger-workspace-manager.cloudfunctions.net/runGenerateAlerts',
        {
          method: 'POST',
        }
      );

      if (!processResponse.ok) {
        throw new Error(`HTTP error! status: ${processResponse.status}`);
      }

      await processResponse.json(); // Process the alert

      this.success.set(
        `✅ Email de prueba enviado exitosamente a ${this.recipientEmail()}. ` +
        `El email será entregado en los próximos 15 minutos por la función automática. ` +
        `Dominio de prueba: ${alertResult.data?.domainName || 'N/A'}`
      );

      // Recargar logs después de 2 segundos
      setTimeout(() => {
        this.loadEmailLogs();
      }, 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.error.set(`Error al enviar email de prueba: ${message}`);
    } finally {
      this.isSendingTest.set(false);
    }
  }

  toggleApiKeyVisibility(): void {
    this.showApiKey.set(!this.showApiKey());
  }

  getStatusSeverity(status: string): 'success' | 'danger' | 'warn' | 'info' {
    switch (status) {
      case 'sent':
        return 'success';
      case 'failed':
        return 'danger';
      case 'retrying':
        return 'warn';
      default:
        return 'info';
    }
  }

  formatDate(timestamp: unknown): string {
    if (!timestamp) return 'N/A';
    const date = (timestamp as Timestamp).toDate();
    return date.toLocaleString();
  }

  private resetForm(): void {
    this.enabled.set(false);
    this.recipientEmail.set('');
    this.ccEmails.set([]);
    this.fromEmail.set('');
    this.fromName.set('');
    this.apiKey.set('');
    this.maxPerHour.set(10);
    this.maxPerDay.set(50);
    this.maxRetryAttempts.set(3);
    this.retryDelayMinutes.set(5);
  }
}
