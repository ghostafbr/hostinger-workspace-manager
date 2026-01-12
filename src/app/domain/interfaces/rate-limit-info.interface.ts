/**
 * Interface for rate limit information from Hostinger API
 */
export interface RateLimitInfoInterface {
  workspaceId: string;
  requests: number; // Total requests made
  remaining: number; // Requests remaining
  limit: number; // Total limit
  resetTime: Date; // When the limit resets
  percentage: number; // Percentage used
  lastUpdated: Date; // When this was captured
}
