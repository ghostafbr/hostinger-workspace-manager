import { onRequest } from 'firebase-functions/v2/https';
import { defineString } from 'firebase-functions/params';
import * as logger from 'firebase-functions/logger';
import { syncAllDnsRecords } from './syncDnsRecords';

// Define ENCRYPTION_KEY as environment parameter
const encryptionKey = defineString('ENCRYPTION_KEY', {
  description: 'Encryption key for decrypting Hostinger API tokens',
  default: 'hostinger-workspace-manager-secret-key-2026-prod',
});

/**
 * HTTP endpoint to sync DNS records for a workspace
 *
 * POST /syncDnsRecords
 * Body: { workspaceId: string }
 *
 * Returns:
 * {
 *   success: boolean;
 *   domainsProcessed: number;
 *   totalRecords: number;
 *   errors: string[];
 * }
 */
export const syncDnsRecordsHttp = onRequest(
  {
    timeoutSeconds: 540, // 9 minutes max
    memory: '512MiB',
    cors: true,
  },
  async (request, response) => {
    // Set ENCRYPTION_KEY in process.env so syncAllDnsRecords can access it
    process.env.ENCRYPTION_KEY = encryptionKey.value();
    // Only allow POST requests
    if (request.method !== 'POST') {
      response.status(405).json({ error: 'Method not allowed. Use POST.' });
      return;
    }

    try {
      logger.info('Received request:', {
        method: request.method,
        body: request.body,
        contentType: request.headers['content-type'],
      });

      const { workspaceId } = request.body;

      // Validate request body
      if (!workspaceId || typeof workspaceId !== 'string') {
        logger.error('Invalid request body:', request.body);
        response.status(400).json({
          error: 'Missing or invalid workspaceId in request body',
        });
        return;
      }

      logger.info(`HTTP request to sync DNS records for workspace: ${workspaceId}`);
      logger.info(`ENCRYPTION_KEY status: ${encryptionKey.value() ? 'SET' : 'NOT SET'}`);

      // Execute sync
      const result = await syncAllDnsRecords(workspaceId);

      logger.info(`DNS sync completed for workspace ${workspaceId}:`, result);

      // Return result
      response.status(200).json(result);
    } catch (error) {
      logger.error('Error in syncDnsRecordsHttp:', error);

      response.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }
);
