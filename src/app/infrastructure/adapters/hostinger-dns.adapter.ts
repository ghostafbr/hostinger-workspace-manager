import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { Timestamp } from 'firebase/firestore';
import { environment } from '../../../environments/environment';
import { DnsRecord, DnsRecordType } from '@app/domain';

/**
 * Hostinger DNS Adapter
 *
 * Handles DNS-related API calls to Hostinger
 */
@Injectable({
  providedIn: 'root',
})
export class HostingerDnsAdapter {
  private readonly http = inject(HttpClient);
  private readonly BASE_URL = environment.api.hostinger.baseUrl;
  private readonly REQUEST_TIMEOUT = environment.api.hostinger.timeout;

  /**
   * Fetch DNS records for a specific domain
   */
  async getDnsRecords(token: string, domainName: string, workspaceId: string): Promise<DnsRecord[]> {
    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      });

      // Hostinger API endpoint for DNS records
      const response = await firstValueFrom(
        this.http
          .get<{ data: unknown[] }>(`${this.BASE_URL}/api/dns/v1/zones/${domainName}`, { headers })
          .pipe(timeout(this.REQUEST_TIMEOUT)),
      );

      const records = (response.data || []).map((record: unknown) => {
        const r = record as Record<string, unknown>;
        return new DnsRecord({
          id: (r['id'] as string) || crypto.randomUUID(),
          workspaceId,
          domainName,
          recordType: this.mapRecordType(r['type'] as string),
          name: (r['name'] as string) || '@',
          value: (r['content'] as string) || (r['value'] as string) || '',
          ttl: (r['ttl'] as number) || 3600,
          priority: r['priority'] as number | undefined,
          syncedAt: Timestamp.now(),
        });
      });

      return records;
    } catch (error: unknown) {
      console.error('Error fetching DNS records from Hostinger:', error);
      throw error;
    }
  }

  /**
   * Map Hostinger record type to our enum
   */
  private mapRecordType(type: string): DnsRecordType {
    const upperType = type.toUpperCase();
    switch (upperType) {
      case 'A':
        return DnsRecordType.A;
      case 'AAAA':
        return DnsRecordType.AAAA;
      case 'CNAME':
        return DnsRecordType.CNAME;
      case 'MX':
        return DnsRecordType.MX;
      case 'TXT':
        return DnsRecordType.TXT;
      case 'NS':
        return DnsRecordType.NS;
      case 'SOA':
        return DnsRecordType.SOA;
      case 'SRV':
        return DnsRecordType.SRV;
      case 'PTR':
        return DnsRecordType.PTR;
      default:
        console.warn(`Unknown DNS record type: ${type}, defaulting to TXT`);
        return DnsRecordType.TXT;
    }
  }

  /**
   * Fetch DNS zones/domains available for management
   */
  async getDnsZones(token: string): Promise<string[]> {
    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      });

      const response = await firstValueFrom(
        this.http
          .get<{ data: unknown[] }>(`${this.BASE_URL}/domains/v1/portfolio`, { headers })
          .pipe(timeout(this.REQUEST_TIMEOUT)),
      );

      return (response.data || []).map((domain: unknown) => {
        const d = domain as Record<string, unknown>;
        return (d['domain'] as string) || (d['name'] as string) || '';
      });
    } catch (error: unknown) {
      console.error('Error fetching DNS zones from Hostinger:', error);
      throw error;
    }
  }
}
