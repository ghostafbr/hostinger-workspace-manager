import * as admin from 'firebase-admin';
import { onCall, onRequest, HttpsError, CallableOptions, HttpsOptions } from 'firebase-functions/v2/https';
import { Request, Response } from 'express';
import * as crypto from 'crypto';
import {
  validateMxRecords,
  validateSpfRecord,
  validateDmarcRecord,
  validateTtl,
  validateAddressRecords,
  validateDuplicates,
  validateDkimRecord
} from '../../utils/dnsValidationUtils';
import {
    DnsValidationStatus,
    DnsCheckStatus,
    DnsValidationResult
} from '../../models/dns-validation.model';

// Import DnsRecordType enum from domain if possible, or define locally map
// Since cloud functions builds often struggle with relative imports outside /src,
// we'll cast types safely or duplicate the enum if needed.
// For now, assuming standard build process allows relative import from root src if configured,
// OR we rely on loose typing for the util inputs.

interface ValidateDnsRequest {
  workspaceId: string;
  domainName: string;
}

// Sanity limits to avoid huge writes or abuse
const MAX_CHECKS = 200;
const MAX_MESSAGE_LENGTH = 3000;

function validateInput(workspaceId: unknown, domainName: unknown) {
  if (typeof workspaceId !== 'string' || workspaceId.trim().length === 0) {
    throw new HttpsError('invalid-argument', 'workspaceId must be a non-empty string');
  }

  if (typeof domainName !== 'string' || domainName.trim().length === 0) {
    throw new HttpsError('invalid-argument', 'domainName must be a non-empty string');
  }

  // Basic domain validation (allow wildcard subdomains and punycode)
  const domain = domainName.trim();
  const domainRegex = /^(\*\.)?([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i;
  if (!domainRegex.test(domain)) {
    throw new HttpsError('invalid-argument', 'domainName has invalid format');
  }
}

function sanitizeChecks(checks: any[]) {
  if (!Array.isArray(checks)) return [];
  const truncated = checks.slice(0, MAX_CHECKS);
  return truncated.map((c) => ({
    id: String(c?.id || ''),
    category: c?.category || null,
    name: String(c?.name || ''),
    status: c?.status || null,
    message: String((c?.message || '').toString().slice(0, MAX_MESSAGE_LENGTH)),
    recommendation: typeof c?.recommendation === 'string' ? c.recommendation.slice(0, MAX_MESSAGE_LENGTH) : null,
    affectedRecords: Array.isArray(c?.affectedRecords) ? c.affectedRecords.slice(0, 20) : null,
  }));
}

const callableOptions: CallableOptions = {
  invoker: 'public',
  region: 'us-central1',
};

export const validateDns = onCall(callableOptions, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { workspaceId, domainName } = request.data as ValidateDnsRequest;

  // Validate inputs
  validateInput(workspaceId, domainName);

  const db = admin.firestore();

  try {
    // 1. Fetch current DNS records for the domain from Firestore
    // We assume the records are already synced. If we wanted fresh, we'd trigger sync first.
    // For validation, we validate what we know.
    const recordsSnapshot = await db
      .collection('dnsRecords')
      .where('workspaceId', '==', workspaceId)
      .where('domainName', '==', domainName)
      .get();

    if (recordsSnapshot.empty) {
      throw new HttpsError('not-found', 'No DNS records found for this domain. Please sync first.');
    }

    const records = recordsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            type: data['recordType'],
            name: data['name'],
            value: data['value'],
            ttl: Number(data['ttl']),
            priority: Number(data['priority'] || 0)
        };
    });

    // 2. Run Validation Checks
    const checks = [
        ...validateMxRecords(records),
        ...validateSpfRecord(records),
        ...validateDmarcRecord(records),
        ...validateTtl(records),
        ...validateAddressRecords(records),
        ...validateDuplicates(records),
        ...validateDkimRecord(records)
    ];

    // 3. Determine Overall Status
    let overallStatus = DnsValidationStatus.HEALTHY;
    if (checks.some(c => c.status === DnsCheckStatus.FAIL)) {
        overallStatus = DnsValidationStatus.ERRORS;
    } else if (checks.some(c => c.status === DnsCheckStatus.WARN)) {
        overallStatus = DnsValidationStatus.WARNINGS;
    }

    // 4. Create Validation Result
    const sanitizedChecks = sanitizeChecks(checks as any[]);

    const result: DnsValidationResult = {
      id: crypto.randomUUID(), // Or let Firestore gen ID
      workspaceId,
      domainName,
      validatedAt: admin.firestore.Timestamp.now(),
      status: overallStatus,
      checks: sanitizedChecks as any,
      score: calculateHealthScore(checks)
    };

    // 5. Store Result in Firestore
    await db.collection('dns_validations').add(result);

    return result;

  } catch (error) {
    console.error('DNS Validation failed:', error);
    throw new HttpsError('internal', 'Validation failed');
  }
});

// HTTP wrapper with CORS handling so frontend can call via fetch directly
const httpOptions: HttpsOptions = {
  region: 'us-central1',
  cors: [
    'http://localhost:4200',
    'https://hostinger-workspace-manager.web.app',
    'https://hostinger-workspace-manager.firebaseapp.com',
  ],
};

export const validateDnsHttp = onRequest(httpOptions, async (req: Request, res: Response) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Extract token from Authorization header if present
    const authHeader = (req.headers.authorization || '') as string;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '');
      res.status(401).json({ error: 'Unauthorized: missing token' });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (!decoded) {
      res.status(401).json({ error: 'Unauthorized: invalid token' });
      return;
    }

    const { workspaceId, domainName } = req.body as ValidateDnsRequest;
    try {
      validateInput(workspaceId, domainName);
    } catch (err: any) {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '');
      const msg = err instanceof HttpsError ? err.message : 'Invalid input';
      res.status(400).json({ error: msg });
      return;
    }

    const db = admin.firestore();

    const recordsSnapshot = await db
      .collection('dnsRecords')
      .where('workspaceId', '==', workspaceId)
      .where('domainName', '==', domainName)
      .get();

    if (recordsSnapshot.empty) {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '');
      res.status(404).json({ error: 'No DNS records found for this domain. Please sync first.' });
      return;
    }

    const records = recordsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        type: data['recordType'],
        name: data['name'],
        value: data['value'],
        ttl: Number(data['ttl']),
        priority: Number(data['priority'] || 0)
      };
    });

    const checks = [
      ...validateMxRecords(records),
      ...validateSpfRecord(records),
      ...validateDmarcRecord(records),
      ...validateTtl(records),
      ...validateAddressRecords(records),
      ...validateDuplicates(records),
      ...validateDkimRecord(records)
    ];

    let overallStatus = DnsValidationStatus.HEALTHY;
    if (checks.some(c => c.status === DnsCheckStatus.FAIL)) {
      overallStatus = DnsValidationStatus.ERRORS;
    } else if (checks.some(c => c.status === DnsCheckStatus.WARN)) {
      overallStatus = DnsValidationStatus.WARNINGS;
    }

    const sanitizedChecksHttp = sanitizeChecks(checks as any[]);

    const result: DnsValidationResult = {
      id: crypto.randomUUID(),
      workspaceId,
      domainName,
      validatedAt: admin.firestore.Timestamp.now(),
      status: overallStatus,
      checks: sanitizedChecksHttp as any,
      score: calculateHealthScore(checks)
    };

    await db.collection('dns_validations').add(result);

    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '');
    res.json(result);
  } catch (error) {
    console.error('DNS Validation HTTP failed:', error);
    // Provide error message in non-production to aid debugging
    const details = error instanceof Error ? error.message : String(error);
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '');
      res.status(500).json({ error: 'Validation failed' });
    } else {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '');
      res.status(500).json({ error: 'Validation failed', details });
    }
  }
});

function calculateHealthScore(checks: any[]): number {
    if (checks.length === 0) return 0;
    const totalPoints = checks.length * 10; // Max points
    let currentPoints = totalPoints;

    checks.forEach(check => {
        if (check.status === DnsCheckStatus.FAIL) currentPoints -= 10;
        if (check.status === DnsCheckStatus.WARN) currentPoints -= 3;
    });

    return Math.max(0, Math.round((currentPoints / totalPoints) * 100));
}
