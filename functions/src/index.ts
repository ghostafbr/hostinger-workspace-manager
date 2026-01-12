import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export Cloud Functions
// Manual sync functions (HTTP with CORS)
export { syncWorkspace } from './syncWorkspace.http';
export { syncAllWorkspaces } from './syncAllWorkspaces';

// Scheduled sync function (Cloud Scheduler)
export { syncAllWorkspacesScheduled } from './syncAllWorkspaces';

// Alert generation function (Cloud Scheduler)
export { generateAlerts } from './generateAlerts';

// Health metrics calculation function (Cloud Scheduler - every 15 minutes)
export { calculateHealthMetrics } from './calculateHealthMetrics';

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
