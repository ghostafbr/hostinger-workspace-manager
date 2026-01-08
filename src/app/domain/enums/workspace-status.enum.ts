/**
 * Workspace Status Enum
 *
 * Represents the current operational status of a workspace
 */
export enum WorkspaceStatus {
  /** Workspace is active and functioning normally */
  ACTIVE = 'ACTIVE',

  /** Workspace has an invalid or expired Hostinger API token */
  INVALID_TOKEN = 'INVALID_TOKEN',

  /** Workspace has exceeded Hostinger API rate limits */
  RATE_LIMITED = 'RATE_LIMITED',

  /** Workspace encountered an error during operation */
  ERROR = 'ERROR',

  /** Workspace has been manually disabled by the user */
  DISABLED = 'DISABLED',
}
