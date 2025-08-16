// Re-export all provider types
export * from './openai';
export * from './opensubtitles';

/**
 * Generic provider error base type
 */
export type ProviderErrorBase = {
  readonly message: string;
  readonly statusCode?: number;
  readonly retryAfter?: number;
};

/**
 * Provider status type
 */
export type ProviderStatus = 'available' | 'unavailable' | 'rate_limited' | 'misconfigured';
