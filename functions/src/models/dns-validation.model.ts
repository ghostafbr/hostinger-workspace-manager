import { Timestamp } from 'firebase-admin/firestore';

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
