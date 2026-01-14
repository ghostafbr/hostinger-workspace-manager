import { Timestamp } from 'firebase/firestore';

/**
 * Status of a specific DNS check
 */
export enum DnsCheckStatus {
  PASS = 'pass',
  WARN = 'warn',
  FAIL = 'fail',
}

/**
 * Overall status of DNS validation
 */
export enum DnsValidationStatus {
  HEALTHY = 'healthy',
  WARNINGS = 'warnings',
  ERRORS = 'errors',
}

/**
 * Categories for DNS checks
 */
export enum DnsCheckCategory {
  SECURITY = 'security', // SPF, DMARC
  MAIL = 'mail', // MX
  PERFORMANCE = 'performance', // TTL, CNAME chains
  CONFIGURATION = 'configuration', // A, AAAA, Syntax
}

/**
 * Result of a single DNS check
 */
export interface DnsCheckResult {
  id: string;
  category: DnsCheckCategory;
  name: string; // e.g., "SPF Record"
  status: DnsCheckStatus;
  message: string;
  recommendation?: string;
  affectedRecords?: string[]; // IDs of records involved
}

/**
 * Complete validation result for a domain
 */
export interface DnsValidationResult {
  id: string;
  workspaceId: string;
  domainName: string;
  validatedAt: Timestamp;
  status: DnsValidationStatus;
  checks: DnsCheckResult[];
  score?: number; // 0-100 health score
}

/**
 * Class wrapper for business logic if needed
 */
export class DnsValidation implements DnsValidationResult {
  id: string;
  workspaceId: string;
  domainName: string;
  validatedAt: Timestamp;
  status: DnsValidationStatus;
  checks: DnsCheckResult[];
  score?: number;

  constructor(data: Partial<DnsValidationResult>) {
    this.id = data.id || '';
    this.workspaceId = data.workspaceId || '';
    this.domainName = data.domainName || '';
    this.validatedAt = data.validatedAt || Timestamp.now();
    this.status = data.status || DnsValidationStatus.ERRORS;
    this.checks = data.checks || [];
    this.score = data.score;
  }

  /**
   * Get checks filtered by status
   */
  getChecksByStatus(status: DnsCheckStatus): DnsCheckResult[] {
    return this.checks.filter((c) => c.status === status);
  }

  /**
   * Get total count of issues (warnings + failures)
   */
  getIssueCount(): number {
    return this.checks.filter((c) => c.status !== DnsCheckStatus.PASS).length;
  }
}
