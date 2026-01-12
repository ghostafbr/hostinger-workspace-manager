import { Injectable, signal } from '@angular/core';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  Firestore,
} from 'firebase/firestore';
import { FirebaseAdapter } from '@app/infrastructure';
import type {
  IEmailConfig,
  IEmailLog,
  ISendEmailRequest,
  ISendEmailResponse,
} from '@app/domain';

/**
 * Email Service
 *
 * Manages email configuration and logging for workspaces.
 * Handles CRUD operations for email settings and email logs.
 *
 * @example
 * ```typescript
 * const emailConfig = await emailService.getEmailConfig(workspaceId);
 * await emailService.updateEmailConfig(workspaceId, { enabled: true });
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private readonly firestore = FirebaseAdapter.getFirestore();

  // Signals for reactive state
  readonly emailConfigs = signal<IEmailConfig[]>([]);
  readonly emailLogs = signal<IEmailLog[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  /**
   * Get email configuration for a workspace
   */
  async getEmailConfig(workspaceId: string): Promise<IEmailConfig | null> {
    try {
      const configsRef = collection(this.firestore, 'emailConfigs');
      const q = query(configsRef, where('workspaceId', '==', workspaceId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const configDoc = snapshot.docs[0];
      return {
        id: configDoc.id,
        ...configDoc.data(),
      } as IEmailConfig;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.error.set(`Failed to get email config: ${message}`);
      throw error;
    }
  }

  /**
   * Create email configuration for a workspace
   */
  async createEmailConfig(config: Omit<IEmailConfig, 'id' | 'createdAt'>): Promise<string> {
    try {
      const configsRef = collection(this.firestore, 'emailConfigs');

      // Check if config already exists
      const existing = await this.getEmailConfig(config.workspaceId);
      if (existing) {
        throw new Error('Email configuration already exists for this workspace');
      }

      const docRef = await addDoc(configsRef, {
        ...config,
        createdAt: Timestamp.now(),
      });

      return docRef.id;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.error.set(`Failed to create email config: ${message}`);
      throw error;
    }
  }

  /**
   * Update email configuration
   */
  async updateEmailConfig(
    workspaceId: string,
    updates: Partial<Omit<IEmailConfig, 'id' | 'workspaceId' | 'createdAt'>>
  ): Promise<void> {
    try {
      const config = await this.getEmailConfig(workspaceId);
      if (!config?.id) {
        throw new Error('Email configuration not found');
      }

      const configRef = doc(this.firestore, 'emailConfigs', config.id);
      await updateDoc(configRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.error.set(`Failed to update email config: ${message}`);
      throw error;
    }
  }

  /**
   * Delete email configuration
   */
  async deleteEmailConfig(workspaceId: string): Promise<void> {
    try {
      const config = await this.getEmailConfig(workspaceId);
      if (!config?.id) {
        throw new Error('Email configuration not found');
      }

      const configRef = doc(this.firestore, 'emailConfigs', config.id);
      await deleteDoc(configRef);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.error.set(`Failed to delete email config: ${message}`);
      throw error;
    }
  }

  /**
   * Get email logs for a workspace
   */
  async getEmailLogs(
    workspaceId: string,
    limit = 50
  ): Promise<IEmailLog[]> {
    try {
      this.isLoading.set(true);

      const logsRef = collection(this.firestore, 'emailLogs');
      const q = query(
        logsRef,
        where('workspaceId', '==', workspaceId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const logs = snapshot.docs
        .slice(0, limit)
        .map((doc: { id: string; data: () => Record<string, unknown> }) => ({
          id: doc.id,
          ...doc.data(),
        })) as IEmailLog[];

      this.emailLogs.set(logs);
      return logs;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.error.set(`Failed to get email logs: ${message}`);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Create email log entry
   */
  async createEmailLog(log: Omit<IEmailLog, 'id' | 'createdAt'>): Promise<string> {
    try {
      const logsRef = collection(this.firestore, 'emailLogs');
      const docRef = await addDoc(logsRef, {
        ...log,
        createdAt: Timestamp.now(),
      });

      return docRef.id;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.error.set(`Failed to create email log: ${message}`);
      throw error;
    }
  }

  /**
   * Update email log (for retry logic)
   */
  async updateEmailLog(
    logId: string,
    updates: Partial<Omit<IEmailLog, 'id' | 'workspaceId' | 'createdAt'>>
  ): Promise<void> {
    try {
      const logRef = doc(this.firestore, 'emailLogs', logId);
      await updateDoc(logRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.error.set(`Failed to update email log: ${message}`);
      throw error;
    }
  }

  /**
   * Get pending emails for retry
   */
  async getPendingEmails(): Promise<IEmailLog[]> {
    try {
      const logsRef = collection(this.firestore, 'emailLogs');
      const now = Timestamp.now();

      const q = query(
        logsRef,
        where('status', 'in', ['pending', 'retrying']),
        where('nextRetryAt', '<=', now),
        orderBy('nextRetryAt', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: { id: string; data: () => Record<string, unknown> }) => ({
        id: doc.id,
        ...doc.data(),
      })) as IEmailLog[];
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.error.set(`Failed to get pending emails: ${message}`);
      throw error;
    }
  }

  /**
   * Get email statistics for a workspace
   */
  async getEmailStats(workspaceId: string): Promise<{
    total: number;
    sent: number;
    failed: number;
    pending: number;
    retrying: number;
  }> {
    try {
      const logs = await this.getEmailLogs(workspaceId, 1000);

      return {
        total: logs.length,
        sent: logs.filter((log) => log.status === 'sent').length,
        failed: logs.filter((log) => log.status === 'failed').length,
        pending: logs.filter((log) => log.status === 'pending').length,
        retrying: logs.filter((log) => log.status === 'retrying').length,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.error.set(`Failed to get email stats: ${message}`);
      throw error;
    }
  }

  /**
   * Check if workspace has email enabled
   */
  async isEmailEnabled(workspaceId: string): Promise<boolean> {
    try {
      const config = await this.getEmailConfig(workspaceId);
      return config?.enabled ?? false;
    } catch {
      return false;
    }
  }

  /**
   * Validate email rate limits
   */
  async checkRateLimits(workspaceId: string): Promise<{
    canSend: boolean;
    hourlyCount: number;
    dailyCount: number;
    maxPerHour: number;
    maxPerDay: number;
  }> {
    try {
      const config = await this.getEmailConfig(workspaceId);
      if (!config) {
        return {
          canSend: false,
          hourlyCount: 0,
          dailyCount: 0,
          maxPerHour: 0,
          maxPerDay: 0,
        };
      }

      const maxPerHour = config.rateLimit?.maxPerHour ?? 10;
      const maxPerDay = config.rateLimit?.maxPerDay ?? 50;

      // Count emails in last hour
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const logs = await this.getEmailLogs(workspaceId, 1000);

      const hourlyCount = logs.filter((log) => {
        if (!log.sentAt) return false;
        const sentDate = (log.sentAt as unknown as Timestamp).toDate();
        return sentDate >= oneHourAgo;
      }).length;

      const dailyCount = logs.filter((log) => {
        if (!log.sentAt) return false;
        const sentDate = (log.sentAt as unknown as Timestamp).toDate();
        return sentDate >= oneDayAgo;
      }).length;

      const canSend = hourlyCount < maxPerHour && dailyCount < maxPerDay;

      return {
        canSend,
        hourlyCount,
        dailyCount,
        maxPerHour,
        maxPerDay,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.error.set(`Failed to check rate limits: ${message}`);
      throw error;
    }
  }
}
