import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { signal } from '@angular/core';
import { IWebhookConfig, WebhookPayload, WebhookEvent } from '@app/domain';

/**
 * Webhook Service
 *
 * Manages webhook notifications for health alerts.
 * Supports multiple platforms: Slack, Discord, Teams, custom webhooks.
 */
@Injectable({
  providedIn: 'root',
})
export class WebhookService {
  private readonly http = inject(HttpClient);

  readonly isSending = signal<boolean>(false);
  readonly lastError = signal<string | null>(null);

  /**
   * Send webhook notification
   */
  async sendWebhook(config: IWebhookConfig, payload: WebhookPayload): Promise<void> {
    if (!config.enabled) {
      console.log('Webhook disabled, skipping notification');
      return;
    }

    // Check if event is configured
    if (!config.events.includes(payload.event)) {
      console.log(`Event ${payload.event} not configured for webhook, skipping`);
      return;
    }

    // Check severity threshold
    if (config.minSeverity === 'critical' && payload.severity === 'warning') {
      console.log('Alert severity below threshold, skipping webhook');
      return;
    }

    this.isSending.set(true);
    this.lastError.set(null);

    try {
      const formattedPayload = this.formatPayload(config.platform, payload);
      const headers = this.buildHeaders(config);

      await this.http
        .post(config.url, formattedPayload, { headers })
        .toPromise();

      console.log('Webhook sent successfully', { url: config.url, event: payload.event });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.lastError.set(errorMessage);
      console.error('Failed to send webhook', { error, url: config.url });
      throw error;
    } finally {
      this.isSending.set(false);
    }
  }

  /**
   * Send test webhook notification
   */
  async sendTestWebhook(config: IWebhookConfig): Promise<void> {
    if (!config.enableTestNotifications) {
      throw new Error('Test notifications are disabled for this webhook');
    }

    const testPayload: WebhookPayload = {
      event: 'health.warning',
      severity: 'warning',
      title: 'Test Notification',
      message: 'This is a test notification from Hostinger Workspace Manager',
      workspace: {
        id: 'test-workspace',
        name: 'Test Workspace',
      },
      timestamp: new Date().toISOString(),
      metadata: {
        healthScore: 75,
      },
    };

    await this.sendWebhook(config, testPayload);
  }

  /**
   * Format payload according to platform
   */
  private formatPayload(platform: string, payload: WebhookPayload): unknown {
    switch (platform) {
      case 'slack':
        return this.formatSlackPayload(payload);
      case 'discord':
        return this.formatDiscordPayload(payload);
      case 'teams':
        return this.formatTeamsPayload(payload);
      default:
        // Custom webhook - send raw payload
        return payload;
    }
  }

  /**
   * Format payload for Slack
   */
  private formatSlackPayload(payload: WebhookPayload): unknown {
    const color = payload.severity === 'critical' ? 'danger' : 'warning';
    const emoji = payload.severity === 'critical' ? ':rotating_light:' : ':warning:';

    const fields: { title: string; value: string; short: boolean }[] = [
      {
        title: 'Workspace',
        value: payload.workspace.name,
        short: true,
      },
      {
        title: 'Severity',
        value: payload.severity.toUpperCase(),
        short: true,
      },
    ];

    // Add metadata fields
    if (payload.metadata) {
      if (payload.metadata.healthScore !== undefined) {
        fields.push({
          title: 'Health Score',
          value: `${payload.metadata.healthScore}/100`,
          short: true,
        });
      }
      if (payload.metadata.rateLimitPercentage !== undefined) {
        fields.push({
          title: 'Rate Limit Usage',
          value: `${payload.metadata.rateLimitPercentage}%`,
          short: true,
        });
      }
      if (payload.metadata.consecutiveFailures !== undefined) {
        fields.push({
          title: 'Consecutive Failures',
          value: payload.metadata.consecutiveFailures.toString(),
          short: true,
        });
      }
    }

    return {
      text: `${emoji} ${payload.title}`,
      attachments: [
        {
          color,
          title: payload.title,
          text: payload.message,
          fields,
          footer: 'Hostinger Workspace Manager',
          ts: Math.floor(new Date(payload.timestamp).getTime() / 1000),
        },
      ],
    };
  }

  /**
   * Format payload for Discord
   */
  private formatDiscordPayload(payload: WebhookPayload): unknown {
    const color = payload.severity === 'critical' ? 0xff0000 : 0xffa500; // Red : Orange

    const fields: { name: string; value: string; inline: boolean }[] = [
      {
        name: 'Workspace',
        value: payload.workspace.name,
        inline: true,
      },
      {
        name: 'Severity',
        value: payload.severity.toUpperCase(),
        inline: true,
      },
    ];

    // Add metadata fields
    if (payload.metadata) {
      if (payload.metadata.healthScore !== undefined) {
        fields.push({
          name: 'Health Score',
          value: `${payload.metadata.healthScore}/100`,
          inline: true,
        });
      }
      if (payload.metadata.rateLimitPercentage !== undefined) {
        fields.push({
          name: 'Rate Limit Usage',
          value: `${payload.metadata.rateLimitPercentage}%`,
          inline: true,
        });
      }
      if (payload.metadata.consecutiveFailures !== undefined) {
        fields.push({
          name: 'Consecutive Failures',
          value: payload.metadata.consecutiveFailures.toString(),
          inline: true,
        });
      }
    }

    return {
      embeds: [
        {
          title: payload.title,
          description: payload.message,
          color,
          fields,
          footer: {
            text: 'Hostinger Workspace Manager',
          },
          timestamp: payload.timestamp,
        },
      ],
    };
  }

  /**
   * Format payload for Microsoft Teams
   */
  private formatTeamsPayload(payload: WebhookPayload): unknown {
    const themeColor = payload.severity === 'critical' ? 'FF0000' : 'FFA500';

    const facts: { name: string; value: string }[] = [
      {
        name: 'Workspace',
        value: payload.workspace.name,
      },
      {
        name: 'Severity',
        value: payload.severity.toUpperCase(),
      },
    ];

    // Add metadata facts
    if (payload.metadata) {
      if (payload.metadata.healthScore !== undefined) {
        facts.push({
          name: 'Health Score',
          value: `${payload.metadata.healthScore}/100`,
        });
      }
      if (payload.metadata.rateLimitPercentage !== undefined) {
        facts.push({
          name: 'Rate Limit Usage',
          value: `${payload.metadata.rateLimitPercentage}%`,
        });
      }
      if (payload.metadata.consecutiveFailures !== undefined) {
        facts.push({
          name: 'Consecutive Failures',
          value: payload.metadata.consecutiveFailures.toString(),
        });
      }
    }

    return {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      themeColor,
      summary: payload.title,
      sections: [
        {
          activityTitle: payload.title,
          activitySubtitle: payload.message,
          facts,
        },
      ],
    };
  }

  /**
   * Build HTTP headers
   */
  private buildHeaders(config: IWebhookConfig): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    // Add custom headers
    if (config.headers) {
      Object.entries(config.headers).forEach(([key, value]) => {
        headers = headers.set(key, value as string);
      });
    }

    // Add signature if secret is configured
    if (config.secret) {
      // Simple signature - in production use HMAC-SHA256
      headers = headers.set('X-Webhook-Secret', config.secret);
    }

    return headers;
  }

  /**
   * Map alert severity to webhook event
   */
  mapAlertToWebhookEvent(
    alertTitle: string,
    severity: 'warning' | 'critical'
  ): WebhookEvent {
    if (alertTitle.includes('Rate Limit Critical')) {
      return 'rateLimit.critical';
    }
    if (alertTitle.includes('Rate Limit Warning')) {
      return 'rateLimit.warning';
    }
    if (alertTitle.includes('Consecutive Failures') || alertTitle.includes('Sync Failures')) {
      return 'sync.consecutiveFailures';
    }
    if (alertTitle.includes('Circuit Breaker')) {
      return 'circuitBreaker.open';
    }
    if (alertTitle.includes('Sync Failed')) {
      return 'sync.failure';
    }
    if (severity === 'critical') {
      return 'health.critical';
    }
    return 'health.warning';
  }
}
