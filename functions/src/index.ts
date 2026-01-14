import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export Cloud Functions
// Export Cloud Functions
// Manual sync functions (HTTP with CORS)
export { syncWorkspace } from './features/sync/syncWorkspace.http';
export { syncAllWorkspaces } from './features/sync/syncAllWorkspaces';
export { syncDnsRecordsHttp } from './features/sync/syncDnsRecords.http';

// Scheduled sync function (Cloud Scheduler)
export { syncAllWorkspacesScheduled } from './features/sync/syncAllWorkspaces';

// Alert generation function (Cloud Scheduler)
export { generateAlerts } from './features/alerts/generateAlerts';

// Scheduled alert generation with escalating reminders (Cloud Scheduler)
export { generateAlertsScheduled } from './features/alerts/generateAlertsScheduled';

// Health metrics calculation function (Cloud Scheduler - every 15 minutes)
export { calculateHealthMetrics } from './features/health/calculateHealthMetrics';

// Email sending functions
export { sendEmail, retryFailedEmails } from './features/alerts/sendEmail';
export { sendEmailNow } from './features/alerts/sendEmailNow';

// Test functions
export { createTestAlert } from './features/alerts/createTestAlert';
export { runGenerateAlerts } from './features/alerts/runGenerateAlerts';
// Webhooks
export { wompiWebhook } from './features/webhooks/wompiWebhook';

// DNS Validation
export { validateDns, validateDnsHttp } from './features/dns/validateDns';
/*
 * Example functions commented out - not needed for MVP
 *
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true });
  response.send('Hello from Firebase!');
});

export const onWorkspaceCreated = functions.firestore
  .document('workspaces/{workspaceId}')
  .onCreate((snap, context) => {
    const workspace = snap.data();
    functions.logger.info('Workspace created:', {
      workspaceId: context.params.workspaceId,
      name: workspace.name,
    });
  });
*/

// TODO: Add actual Cloud Functions based on requirements:
// - workspaces.createOrUpdate
// - workspaces.list
// - workspaces.getById
// - workspaces.disable
// - workspaces.delete
// - workspaces.saveToken
// - workspaces.testConnection
// - workspaces.syncNow
// - syncAllWorkspaces (scheduled)
// - generateAlerts (scheduled)
