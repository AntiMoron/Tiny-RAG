/**
 * We're exporting your built result to your side project.
 */
export interface ExportServiceApiKey {
  key: string;
  name: string;
  limits: {
    requestsPerMinute?: number;
    requestsPerDay?: number;
    tokensPerMinute?: number;
    tokensPerDay?: number;
  } | null;
}
