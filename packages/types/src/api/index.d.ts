import type { LanguageCode, VideoId } from '../subtitle';
import type { ConfigStatus } from '../config';
/**
 * API request types
 */
export type SubtitleRequest = {
    readonly video: VideoId;
    readonly lang: LanguageCode;
    readonly target?: LanguageCode;
};
/**
 * API response types
 */
export type ApiResponse<T = unknown> = {
    readonly success: boolean;
    readonly data?: T;
    readonly error?: string;
    readonly message?: string;
};
/**
 * Health check response
 */
export type HealthCheckResponse = {
    readonly status: 'healthy' | 'unhealthy';
    readonly checks: {
        readonly openai: boolean;
        readonly opensubtitles: boolean;
    };
    readonly issues: readonly string[];
};
/**
 * Server info response
 */
export type ServerInfoResponse = {
    readonly name: string;
    readonly version: string;
    readonly status: 'healthy' | 'unhealthy';
    readonly environment: string;
};
/**
 * Status endpoint response
 */
export type StatusResponse = ConfigStatus;
/**
 * Error response types
 */
export type ErrorType = 'validation_error' | 'not_found' | 'service_unavailable' | 'rate_limit' | 'internal_error' | 'authentication_error';
export type ErrorResponse = {
    readonly error: string;
    readonly message: string;
    readonly type?: ErrorType;
    readonly statusCode?: number;
};
/**
 * Request context types
 */
export type RequestContext = {
    readonly ip: string;
    readonly userAgent?: string;
    readonly requestId?: string;
    readonly startTime: number;
};
//# sourceMappingURL=index.d.ts.map