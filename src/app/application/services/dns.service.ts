import { Injectable, inject, signal } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { FirebaseAdapter } from '@app/infrastructure/adapters/firebase.adapter';
import { Timestamp as FirestoreTimestamp } from 'firebase/firestore';
import { DnsRecord, DnsSnapshot, DnsRecordType, DnsValidationResult, DnsValidationStatus } from '@app/domain';
import { WorkspaceContextService } from './workspace-context.service';
import { httpsCallable, Functions } from 'firebase/functions';

/**
 * DNS Service
 *
 * Manages DNS records and snapshots for domains
 */
@Injectable({
  providedIn: 'root',
})
export class DnsService {
  private readonly firestore: Firestore = FirebaseAdapter.getFirestore();
  private readonly functions: Functions = FirebaseAdapter.getFunctions();
  private readonly workspaceContext = inject(WorkspaceContextService);
  private readonly http = inject(HttpClient);

  // State signals
  readonly dnsRecords = signal<DnsRecord[]>([]);
  readonly snapshots = signal<DnsSnapshot[]>([]);
  readonly validationResults = signal<DnsValidationResult | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly isSyncing = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Filtered records signal
  readonly filteredRecords = signal<DnsRecord[]>([]);
  readonly selectedDomain = signal<string | null>(null);
  readonly selectedRecordTypes = signal<DnsRecordType[]>([]);

  /**
   * Validate DNS Configuration for a domain
   */
  async validateDns(domainName: string): Promise<DnsValidationResult> {
    this.isLoading.set(true);
    this.error.set(null);
    const workspaceId = this.workspaceContext.workspaceId();

    if (!workspaceId) {
      const errorMsg = 'No workspace selected';
      this.error.set(errorMsg);
      this.isLoading.set(false);
      throw new Error(errorMsg);
    }

    try {
      // Direct call to Cloud Function using Modular SDK
      const validateDnsFn = httpsCallable<{workspaceId: string, domainName: string}, DnsValidationResult>(
        this.functions,
        'validateDns'
      );

      const result = await validateDnsFn({ workspaceId, domainName });
      const validationData = result.data as any;

      // Normalize validatedAt to Firestore Timestamp on client so template can call toDate()
      const va = validationData?.validatedAt;
      if (va && typeof va.toDate !== 'function') {
        if (typeof va.seconds === 'number') {
          // Admin Timestamp serialized as { seconds, nanoseconds }
          const millis = va.seconds * 1000 + (va.nanoseconds ? Math.round(va.nanoseconds / 1e6) : 0);
          validationData.validatedAt = FirestoreTimestamp.fromMillis(millis);
        } else if (typeof va === 'string' || typeof va === 'number') {
          validationData.validatedAt = FirestoreTimestamp.fromDate(new Date(va));
        } else {
          validationData.validatedAt = FirestoreTimestamp.now();
        }
      }

      this.validationResults.set(validationData as DnsValidationResult);
      return validationData as DnsValidationResult;
    } catch (err: any) {
      console.error('Error validating DNS:', err);
      const errorMsg = err.message || 'Failed to validate DNS';
      this.error.set(errorMsg);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Get DNS records for a specific domain
   */
  async getDnsRecordsByDomain(domainName: string): Promise<DnsRecord[]> {
    this.isLoading.set(true);
    this.error.set(null);
    this.selectedDomain.set(domainName);

    try {
      const workspaceId = this.workspaceContext.workspaceId();
      if (!workspaceId) {
        throw new Error('No workspace selected');
      }

      const recordsRef = collection(this.firestore, 'dnsRecords');
      const q = query(
        recordsRef,
        where('workspaceId', '==', workspaceId),
        where('domainName', '==', domainName),
      );

      const snapshot = await getDocs(q);
      const records = snapshot.docs.map((doc) => {
        const data = doc.data();
        return new DnsRecord({
          id: doc.id,
          workspaceId: data['workspaceId'] as string,
          domainName: data['domainName'] as string,
          recordType: data['recordType'] as DnsRecordType,
          name: data['name'] as string,
          value: data['value'] as string,
          ttl: data['ttl'] as number,
          priority: data['priority'] as number | undefined,
          syncedAt: data['syncedAt'] as Timestamp,
        });
      });

      this.dnsRecords.set(records);
      this.filteredRecords.set(records);
      return records;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.error.set(error.message);
      } else {
        this.error.set('Unknown error fetching DNS records');
      }
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Filter records by type
   */
  filterByRecordTypes(types: DnsRecordType[]): void {
    this.selectedRecordTypes.set(types);

    if (types.length === 0) {
      this.filteredRecords.set(this.dnsRecords());
      return;
    }

    const filtered = this.dnsRecords().filter((record) => types.includes(record.recordType));
    this.filteredRecords.set(filtered);
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.selectedRecordTypes.set([]);
    this.filteredRecords.set(this.dnsRecords());
  }

  /**
   * Get snapshots for a domain
   */
  async getSnapshotsByDomain(domainName: string): Promise<DnsSnapshot[]> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const workspaceId = this.workspaceContext.workspaceId();
      if (!workspaceId) {
        throw new Error('No workspace selected');
      }

      const snapshotsRef = collection(this.firestore, 'dnsSnapshots');
      const q = query(
        snapshotsRef,
        where('workspaceId', '==', workspaceId),
        where('domainName', '==', domainName),
      );

      const snapshot = await getDocs(q);
      const snapshots = snapshot.docs.map((doc) => {
        const data = doc.data();
        return new DnsSnapshot({
          id: doc.id,
          workspaceId: data['workspaceId'] as string,
          domainName: data['domainName'] as string,
          records: (data['records'] as DnsRecord[]) || [],
          createdAt: data['createdAt'] as Timestamp,
          note: data['note'] as string | undefined,
        });
      });

      // Sort by creation date (newest first)
      snapshots.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

      this.snapshots.set(snapshots);
      return snapshots;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.error.set(error.message);
      } else {
        this.error.set('Unknown error fetching DNS snapshots');
      }
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Create a manual snapshot of current DNS configuration
   */
  async createSnapshot(domainName: string, note?: string): Promise<DnsSnapshot> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const workspaceId = this.workspaceContext.workspaceId();
      if (!workspaceId) {
        throw new Error('No workspace selected');
      }

      // Get current DNS records
      const currentRecords = this.dnsRecords();
      if (currentRecords.length === 0) {
        throw new Error('No DNS records to snapshot. Sync DNS records first.');
      }

      // Convert DnsRecord instances to plain objects for Firestore
      // Manual field-by-field extraction to avoid any class metadata
      const recordsData: {
        id: string;
        workspaceId: string;
        domainName: string;
        recordType: string;
        name: string;
        value: string;
        ttl: number;
        priority: number | null;
        syncedAt: Timestamp;
      }[] = [];

      for (const record of currentRecords) {
        recordsData.push({
          id: record.id,
          workspaceId: record.workspaceId,
          domainName: record.domainName,
          recordType: record.recordType,
          name: record.name,
          value: record.value,
          ttl: record.ttl,
          priority: record.priority ?? null,
          syncedAt: record.syncedAt,
        });
      }

      const snapshotsRef = collection(this.firestore, 'dnsSnapshots');
      const docRef = await addDoc(snapshotsRef, {
        workspaceId,
        domainName,
        records: recordsData,
        createdAt: Timestamp.now(),
        note: note || undefined,
      });

      const newSnapshot = new DnsSnapshot({
        id: docRef.id,
        workspaceId,
        domainName,
        records: currentRecords,
        createdAt: Timestamp.now(),
        note,
      });

      // Update snapshots list
      const updated = [newSnapshot, ...this.snapshots()];
      this.snapshots.set(updated);

      return newSnapshot;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.error.set(error.message);
      } else {
        this.error.set('Unknown error creating DNS snapshot');
      }
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Compare current DNS records with a snapshot
   */
  compareWithSnapshot(snapshotId: string): {
    added: DnsRecord[];
    removed: DnsRecord[];
    modified: DnsRecord[];
  } | null {
    const snapshot = this.snapshots().find((s) => s.id === snapshotId);
    if (!snapshot) {
      this.error.set('Snapshot not found');
      return null;
    }

    const currentRecords = this.dnsRecords();
    return snapshot.compareWith(currentRecords);
  }

  /**
   * Get record count by type
   */
  getRecordCountByType(): Map<DnsRecordType, number> {
    const counts = new Map<DnsRecordType, number>();
    const records = this.filteredRecords();

    for (const record of records) {
      const count = counts.get(record.recordType) || 0;
      counts.set(record.recordType, count + 1);
    }

    return counts;
  }

  /**
   * Clear all state
   */
  clearState(): void {
    this.dnsRecords.set([]);
    this.snapshots.set([]);
    this.filteredRecords.set([]);
    this.selectedDomain.set(null);
    this.selectedRecordTypes.set([]);
    this.error.set(null);
  }

  /**
   * Sync DNS records from Hostinger API via Cloud Function
   */
  async syncDnsRecords(workspaceId: string): Promise<{
    success: boolean;
    domainsProcessed: number;
    totalRecords: number;
    errors: string[];
  }> {
    this.isSyncing.set(true);
    this.error.set(null);

    try {
      // Use the new Cloud Run URL generated by Firebase Functions v2
      const cloudFunctionUrl = 'https://syncdnsrecordshttp-7jxe2gomqa-uc.a.run.app';

      const response = await firstValueFrom(
        this.http.post<{
          success: boolean;
          domainsProcessed: number;
          totalRecords: number;
          errors: string[];
        }>(cloudFunctionUrl, {
          workspaceId,
        }),
      );

      // Refresh records for selected domain if any
      const currentDomain = this.selectedDomain();
      if (currentDomain) {
        await this.getDnsRecordsByDomain(currentDomain);
      }

      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.error.set(error.message);
      } else {
        this.error.set('Unknown error syncing DNS records');
      }
      throw error;
    } finally {
      this.isSyncing.set(false);
    }
  }
}
