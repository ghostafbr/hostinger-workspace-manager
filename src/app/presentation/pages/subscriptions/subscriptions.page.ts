import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Services
import { SubscriptionService } from '@app/application/services/subscription.service';
import { WorkspaceContextService } from '@app/application/services/workspace-context.service';

// Domain
import { Subscription as ISubscription } from '@app/domain/interfaces/subscription.interface';

// Components
import { SubscriptionsTableComponent } from '@app/presentation/components/organisms/subscriptions-table/subscriptions-table.component';
import { SubscriptionDetailsDialogComponent } from '@app/presentation/components/organisms/subscription-details-dialog/subscription-details-dialog.component';

/**
 * Subscriptions Page
 *
 * Shows filterable table of subscriptions for the current workspace
 */
@Component({
  selector: 'app-subscriptions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CardModule,
    ToastModule,
    SubscriptionsTableComponent,
    SubscriptionDetailsDialogComponent,
  ],
  providers: [MessageService],
  templateUrl: './subscriptions.page.html',
  styleUrl: './subscriptions.page.scss',
})
export default class SubscriptionsPage implements OnInit {
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly workspaceContext = inject(WorkspaceContextService);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  readonly subscriptions = signal<ISubscription[]>([]);
  readonly isLoading = this.subscriptionService.isLoading;
  readonly error = this.subscriptionService.error;

  readonly selectedSubscription = signal<ISubscription | null>(null);
  readonly showDetailsDialog = signal<boolean>(false);

  /**
   * Workspace name for display
   */
  readonly workspaceName = computed(() => {
    const ws = this.workspaceContext.getCurrentWorkspace();
    return ws?.name || 'Workspace';
  });

  /**
   * Total subscriptions count
   */
  readonly totalSubscriptions = computed(() => this.subscriptions().length);

  ngOnInit(): void {
    this.loadSubscriptions();
  }

  /**
   * Load all subscriptions for current workspace
   */
  async loadSubscriptions(): Promise<void> {
    try {
      const workspaceId = this.route.snapshot.paramMap.get('workspaceId');

      if (!workspaceId) {
        throw new Error('No se encontró el ID del workspace');
      }

      const subscriptions = await this.subscriptionService.getAllSubscriptions(workspaceId);

      this.subscriptions.set(subscriptions);

      if (subscriptions.length === 0) {
        this.messageService.add({
          severity: 'info',
          summary: 'Sin suscripciones',
          detail:
            'No se encontraron suscripciones para este workspace. Asegúrate de haber ejecutado la sincronización.',
          life: 5000,
        });
      }
    } catch (error) {
      console.error('[SubscriptionsPage] Error loading subscriptions:', error);

      let errorDetail = error instanceof Error ? error.message : 'Error al cargar suscripciones';

      // Check for index error
      if (error instanceof Error && error.message.includes('index')) {
        errorDetail =
          'El índice de Firestore está construyéndose. Espera unos minutos y recarga la página.';
      }

      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: errorDetail,
      });
    }
  }

  /**
   * Handle subscription click - open details dialog
   */
  onSubscriptionClicked(subscription: ISubscription): void {
    this.selectedSubscription.set(subscription);
    this.showDetailsDialog.set(true);
  }

  /**
   * Handle dialog visibility change
   */
  onDialogVisibilityChange(visible: boolean): void {
    this.showDetailsDialog.set(visible);
    if (!visible) {
      this.selectedSubscription.set(null);
    }
  }
}
