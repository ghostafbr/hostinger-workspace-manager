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
    const highTtl = records.filter(r => r.ttl > 86400); // > 1 day

    if (lowTtl.length > 0) {
        checks.push({
            id: 'ttl-low',
            category: DnsCheckCategory.PERFORMANCE,
            name: 'TTL Configuration',
            status: DnsCheckStatus.WARN,
            message: `Found ${lowTtl.length} records with very low TTL (< 300s).`,
            recommendation: 'Increase TTL to at least 300s (5 mins) for stable records.'
        });
    }

    if (highTtl.length > 0) {
        checks.push({
            id: 'ttl-high',
            category: DnsCheckCategory.PERFORMANCE,
            name: 'TTL Configuration',
            status: DnsCheckStatus.WARN,
            message: `Found ${highTtl.length} records with very high TTL (> 1 day).`,
            recommendation: 'Consider lowering TTL if you plan to make changes soon. 1 hour (3600s) is a good default.'
        });
    }

    if (lowTtl.length === 0 && highTtl.length === 0) {
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

/**
 * Validate A and AAAA Records
 */
export function validateAddressRecords(records: DnsRecord[]): DnsCheckResult[] {
    const checks: DnsCheckResult[] = [];
    const aRecords = records.filter(r => r.type === 'A');
    const aaaaRecords = records.filter(r => r.type === 'AAAA');

    // Private IP ranges regex
    const privateIpRegex = /^(?:10\.|172\.(?:1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|127\.|0\.0\.0\.0)/;
    
    // Check A records
    const privateARecords = aRecords.filter(r => privateIpRegex.test(r.value));
    if (privateARecords.length > 0) {
        checks.push({
            id: 'a-private-ip',
            category: DnsCheckCategory.CONFIGURATION,
            name: 'A Record Value',
            status: DnsCheckStatus.WARN,
            message: 'Found A records pointing to private/local IP addresses.',
            recommendation: 'Ensure standard A records point to public IP addresses.',
            affectedRecords: privateARecords.map(r => r.value)
        });
    }

    if (aRecords.length === 0 && aaaaRecords.length === 0) {
        checks.push({
            id: 'root-record-missing',
            category: DnsCheckCategory.CONFIGURATION,
            name: 'Root Record',
            status: DnsCheckStatus.WARN,
            message: 'No A or AAAA records found. The domain might not resolve to a website.',
            recommendation: 'Add an A record pointing to your web server if you have a website.'
        });
    } else {
        checks.push({
            id: 'root-record-valid',
            category: DnsCheckCategory.CONFIGURATION,
            name: 'Root Record',
            status: DnsCheckStatus.PASS,
            message: `Found ${aRecords.length} A records and ${aaaaRecords.length} AAAA records.`
        });
    }

    return checks;
}

/**
 * Validate Duplicate Records
 */
export function validateDuplicates(records: DnsRecord[]): DnsCheckResult[] {
    const checks: DnsCheckResult[] = [];
    const seen = new Set<string>();
    const requestDuplicates: string[] = [];

    records.forEach(r => {
        const key = `${r.type}:${r.name}:${r.value}`;
        if (seen.has(key)) {
            requestDuplicates.push(`${r.type} ${r.name} -> ${r.value}`);
        }
        seen.add(key);
    });

    if (requestDuplicates.length > 0) {
        checks.push({
            id: 'duplicates-found',
            category: DnsCheckCategory.CONFIGURATION,
            name: 'Duplicate Records',
            status: DnsCheckStatus.WARN,
            message: 'Found duplicate DNS records.',
            recommendation: 'Remove duplicate records to keep configuration clean.',
            affectedRecords: requestDuplicates
        });
    } else {
         checks.push({
            id: 'duplicates-none',
            category: DnsCheckCategory.CONFIGURATION,
            name: 'Duplicate Records',
            status: DnsCheckStatus.PASS,
            message: 'No duplicate records found.'
        });
    }

    return checks;
}

/**
 * Validate DKIM Record
 */
export function validateDkimRecord(records: DnsRecord[]): DnsCheckResult[] {
    const checks: DnsCheckResult[] = [];
    // DKIM records are TXT records usually at selector._domainkey
    const dkimRecords = records.filter(r => r.type === 'TXT' && r.value.includes('v=DKIM1'));

    if (dkimRecords.length > 0) {
        checks.push({
             id: 'dkim-found',
             category: DnsCheckCategory.SECURITY,
             name: 'DKIM Record',
             status: DnsCheckStatus.PASS,
             message: `Found ${dkimRecords.length} DKIM record(s).`
        });
    } else {
        // Not definitely a fail/warn because we don't know if they send email or what selectors they use,
        // but often if MX exists, DKIM should too.
        const mxExists = records.some(r => r.type === 'MX');
        if (mxExists) {
             checks.push({
             id: 'dkim-missing',
             category: DnsCheckCategory.SECURITY,
             name: 'DKIM Record',
             status: DnsCheckStatus.WARN,
             message: 'No DKIM records found, but MX records exist.',
             recommendation: 'Configure DKIM for your mail provider to improve deliverability.'
            });
        }
    }

    return checks;
}
