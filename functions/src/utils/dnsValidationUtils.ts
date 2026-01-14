/**
 * DNS Validation Utilities
 */

import {
  DnsCheckStatus,
  DnsCheckResult,
  DnsCheckCategory,
//   DnsValidationStatus,
} from '../models/dns-validation.model';

// Re-defining interfaces locally to avoid dependency issues in Cloud Functions if needed
// Or ensuring shared code is accessible. For now, assuming we can import from shared domain.
// If not, we'll duplicate or symlink. Given typical separate builds, I'll define helpers here 
// that return simple structures compatible with the models.

interface DnsRecord {
  type: string;
  name: string;
  value: string;
  ttl: number;
  priority?: number;
}

/**
 * Validate MX Records
 */
export function validateMxRecords(records: DnsRecord[]): DnsCheckResult[] {
  const checks: DnsCheckResult[] = [];
  const mxRecords = records.filter(r => r.type === 'MX');

  if (mxRecords.length === 0) {
    checks.push({
      id: 'mx-missing',
      category: DnsCheckCategory.MAIL,
      name: 'MX Record Existence',
      status: DnsCheckStatus.FAIL,
      message: 'No MX records found. Email will not work.',
      recommendation: 'Add at least one MX record pointing to your mail server.'
    });
  } else {
    checks.push({
      id: 'mx-exists',
      category: DnsCheckCategory.MAIL,
      name: 'MX Record Existence',
      status: DnsCheckStatus.PASS,
      message: `Found ${mxRecords.length} MX records.`
    });

    // Check for potential issues
    const pointingToIp = mxRecords.filter(r => /^\d+\.\d+\.\d+\.\d+$/.test(r.value));
    if (pointingToIp.length > 0) {
      checks.push({
        id: 'mx-points-to-ip',
        category: DnsCheckCategory.MAIL,
        name: 'MX Record Value',
        status: DnsCheckStatus.WARN,
        message: 'MX records should point to a hostname, not an IP address.',
        recommendation: 'Change MX record value to a hostname (e.g., mail.example.com).',
        affectedRecords: pointingToIp.map(r => r.value) 
      });
    }
  }

  return checks;
}

/**
 * Validate SPF Record
 */
export function validateSpfRecord(records: DnsRecord[]): DnsCheckResult[] {
  const checks: DnsCheckResult[] = [];
  const txtRecords = records.filter(r => r.type === 'TXT');
  const spfRecords = txtRecords.filter(r => r.value.includes('v=spf1'));

  if (spfRecords.length === 0) {
    checks.push({
        id: 'spf-missing',
        category: DnsCheckCategory.SECURITY,
        name: 'SPF Record',
        status: DnsCheckStatus.WARN,
        message: 'No SPF record found.',
        recommendation: 'Add a TXT record with "v=spf1..." to improve email deliverability and security.'
    });
  } else if (spfRecords.length > 1) {
    checks.push({
        id: 'spf-duplicate',
        category: DnsCheckCategory.SECURITY,
        name: 'SPF Record',
        status: DnsCheckStatus.FAIL,
        message: 'Multiple SPF records found. This is invalid.',
        recommendation: 'Combine all SPF rules into a single TXT record.',
        affectedRecords: spfRecords.map(r => r.value)
    });
  } else {
    const spf = spfRecords[0];
    let status = DnsCheckStatus.PASS;
    let message = 'Valid SPF record found.';
    let recommendation = undefined;

    if (spf.value.includes('+all')) {
        status = DnsCheckStatus.FAIL;
        message = 'SPF record allows all IPs (+all). This renders SPF useless.';
        recommendation = 'Change "+all" to "-all" or "~all".';
    }

    checks.push({
        id: 'spf-valid',
        category: DnsCheckCategory.SECURITY,
        name: 'SPF Record',
        status,
        message,
        recommendation,
        affectedRecords: [spf.value]
    });
  }

  return checks;
}

/**
 * Validate DMARC Record
 */
export function validateDmarcRecord(records: DnsRecord[]): DnsCheckResult[] {
    const checks: DnsCheckResult[] = [];
    // DMARC should be at _dmarc subdomain
    const dmarcRecords = records.filter(r => r.type === 'TXT' && r.name.startsWith('_dmarc'));

    if (dmarcRecords.length === 0) {
         checks.push({
            id: 'dmarc-missing',
            category: DnsCheckCategory.SECURITY,
            name: 'DMARC Record',
            status: DnsCheckStatus.WARN,
            message: 'No DMARC record found.',
            recommendation: 'Add a TXT record at _dmarc with "v=DMARC1..." to prevent email spoofing.'
        });
    } else {
        checks.push({
            id: 'dmarc-valid',
            category: DnsCheckCategory.SECURITY,
            name: 'DMARC Record',
            status: DnsCheckStatus.PASS,
            message: 'DMARC record found.'
        });
    }

    return checks;
}

/**
 * Validate TTL Values
 */
export function validateTtl(records: DnsRecord[]): DnsCheckResult[] {
    const checks: DnsCheckResult[] = [];
    const lowTtl = records.filter(r => r.ttl < 300);

    if (lowTtl.length > 0) {
        checks.push({
            id: 'ttl-low',
            category: DnsCheckCategory.PERFORMANCE,
            name: 'TTL Configuration',
            status: DnsCheckStatus.WARN,
            message: `Found ${lowTtl.length} records with very low TTL (< 300s).`,
            recommendation: 'Increase TTL to at least 300s (5 mins) or 3600s (1 hour) for stable records to reduce query load.',
            affectedRecords: lowTtl.slice(0, 5).map(r => `${r.name} (${r.type})`)
        });
    } else {
         checks.push({
            id: 'ttl-valid',
            category: DnsCheckCategory.PERFORMANCE,
            name: 'TTL Configuration',
            status: DnsCheckStatus.PASS,
            message: 'All records have reasonable TTL values.'
        });
    }

    return checks;
}
