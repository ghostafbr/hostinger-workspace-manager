import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import CryptoJS from 'crypto-js';
import * as crypto from 'crypto';

const ENCRYPTION_SECRET = process.env.ENCRYPTION_KEY || '';

interface HostingerDnsRecordEntry {
  name: string;
  type: string;
  ttl: number;
  records: {
    content: string;
    is_disabled: boolean;
  }[];
}

interface DnsRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  ttl: number;
  priority?: number;
}

/**
 * Decrypt API token
 */
function decryptToken(encryptedToken: string): string {
  if (!ENCRYPTION_SECRET) {
    logger.error('ENCRYPTION_SECRET is not set!');
    throw new Error('Encryption key not configured');
  }

  logger.info('Attempting to decrypt token...', {
    encryptedTokenLength: encryptedToken?.length,
    hasEncryptionSecret: !!ENCRYPTION_SECRET,
    encryptionSecretLength: ENCRYPTION_SECRET.length,
  });

  const bytes = CryptoJS.AES.decrypt(encryptedToken, ENCRYPTION_SECRET);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);

  if (!decrypted) {
    logger.error('Decryption resulted in empty string - wrong encryption key?');
    throw new Error('Token decryption failed - invalid encryption key');
  }

  logger.info('Token decrypted successfully', {
    decryptedLength: decrypted.length,
    startsWithCorrectPrefix: decrypted.startsWith('pk_') || decrypted.startsWith('sk_'),
  });

  return decrypted;
}

/**
 * Fetch DNS records from Hostinger API
 */
async function fetchDnsRecordsFromHostinger(
  apiToken: string,
  domainName: string
): Promise<DnsRecord[]> {
  const url = `https://developers.hostinger.com/api/dns/v1/zones/${domainName}`;

  logger.info(`Fetching DNS records for domain: ${domainName}`, {
    url,
    tokenPrefix: apiToken.substring(0, 7) + '...',
    tokenLength: apiToken.length,
  });

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
  });

  logger.info(`Hostinger API response for ${domainName}:`, {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error(`Hostinger API error for ${domainName}:`, {
      status: response.status,
      statusText: response.statusText,
      errorBody: errorText,
    });
    logger.error(`FULL ERROR DETAILS: Status=${response.status}, Body=${errorText}`);
    throw new Error(`Failed to fetch DNS records: ${response.status} ${response.statusText}`);
  }

  const responseText = await response.text();
  logger.info(`RAW RESPONSE for ${domainName}: ${responseText}`);

  const entries: HostingerDnsRecordEntry[] = JSON.parse(responseText);

  // Flatten records array - each entry can have multiple records
  const dnsRecords: DnsRecord[] = [];
  entries.forEach((entry) => {
    entry.records.forEach((record) => {
      dnsRecords.push({
        id: crypto.randomUUID(), // Generate unique ID
        type: entry.type,
        name: entry.name,
        content: record.content,
        ttl: entry.ttl,
        priority: undefined, // Not provided in this API
      });
    });
  });

  logger.info(`Parsed ${dnsRecords.length} DNS records for ${domainName}`);

  return dnsRecords;
}

/**
 * Sync DNS records for a specific domain
 */
export async function syncDnsRecordsForDomain(
  workspaceId: string,
  domainName: string,
  apiToken: string
): Promise<{ success: boolean; recordCount: number; error?: string }> {
  try {
    logger.info(`Starting DNS sync for domain: ${domainName}`);

    // Fetch DNS records from Hostinger
    const dnsRecords = await fetchDnsRecordsFromHostinger(apiToken, domainName);

    if (!dnsRecords || dnsRecords.length === 0) {
      logger.warn(`No DNS records found for domain: ${domainName}`);
      return { success: true, recordCount: 0 };
    }

    // Prepare Firestore batch operations
    const firestore = admin.firestore();
    const batch = firestore.batch();
    const recordsRef = firestore.collection('dnsRecords');

    // Delete existing records for this domain
    const existingRecordsQuery = await recordsRef
      .where('workspaceId', '==', workspaceId)
      .where('domainName', '==', domainName)
      .get();

    existingRecordsQuery.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    logger.info(`Deleting ${existingRecordsQuery.size} existing records`);

    // Add new records
    dnsRecords.forEach((record) => {
      const docRef = recordsRef.doc();
      batch.set(docRef, {
        workspaceId,
        domainName,
        recordType: record.type, // Map to recordType for consistency
        name: record.name,
        value: record.content, // Map content to value
        ttl: record.ttl,
        priority: record.priority || 0,
        hostingerRecordId: record.id,
        syncedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    // Commit batch
    await batch.commit();

    logger.info(`Successfully synced ${dnsRecords.length} DNS records for ${domainName}`);

    return {
      success: true,
      recordCount: dnsRecords.length,
    };
  } catch (error) {
    logger.error(`Error syncing DNS records for ${domainName}:`, error);
    return {
      success: false,
      recordCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sync DNS records for all domains in a workspace
 */
export async function syncAllDnsRecords(workspaceId: string): Promise<{
  success: boolean;
  domainsProcessed: number;
  totalRecords: number;
  errors: string[];
}> {
  try {
    logger.info(`Starting DNS sync for workspace: ${workspaceId}`);

    const firestore = admin.firestore();

    // Get workspace to decrypt API token
    const workspaceDoc = await firestore.collection('workspaces').doc(workspaceId).get();

    if (!workspaceDoc.exists) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    const workspace = workspaceDoc.data()!;
    const encryptedToken = workspace.encryptedToken;

    if (!encryptedToken) {
      throw new Error('No API token found for workspace');
    }

    // Decrypt API token
    const apiToken = decryptToken(encryptedToken);

    // Get all domains for this workspace
    const domainsQuery = await firestore
      .collection('domains')
      .where('workspaceId', '==', workspaceId)
      .get();

    if (domainsQuery.empty) {
      logger.warn(`No domains found for workspace: ${workspaceId}`);
      return {
        success: true,
        domainsProcessed: 0,
        totalRecords: 0,
        errors: [],
      };
    }

    logger.info(`Found ${domainsQuery.size} domains to sync DNS records`);

    const errors: string[] = [];
    let totalRecords = 0;
    let domainsProcessed = 0;

    // Sync DNS for each domain
    for (const domainDoc of domainsQuery.docs) {
      const domain = domainDoc.data();
      const domainName = domain.domainName;

      const result = await syncDnsRecordsForDomain(workspaceId, domainName, apiToken);

      if (result.success) {
        domainsProcessed++;
        totalRecords += result.recordCount;
      } else {
        errors.push(`${domainName}: ${result.error}`);
      }

      // Rate limiting: wait 500ms between API calls
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    logger.info(`DNS sync completed. Processed: ${domainsProcessed}, Total records: ${totalRecords}, Errors: ${errors.length}`);

    return {
      success: errors.length === 0,
      domainsProcessed,
      totalRecords,
      errors,
    };
  } catch (error) {
    logger.error('Error in syncAllDnsRecords:', error);
    throw error;
  }
}
