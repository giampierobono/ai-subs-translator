import type { LanguageCode } from '../subtitle';
/**
 * OpenAI provider configuration
 */
export type OpenAIProviderConfig = {
    readonly apiKey: string;
    readonly organization?: string;
    readonly model: string;
    readonly maxTokens: number;
    readonly temperature: number;
};
/**
 * OpenAI translation request
 */
export type OpenAITranslationRequest = {
    readonly text: string;
    readonly targetLanguage: LanguageCode;
    readonly sourceLanguage?: LanguageCode;
    readonly context?: string;
};
/**
 * OpenAI translation response
 */
export type OpenAITranslationResponse = {
    readonly translatedText: string;
    readonly tokensUsed: number;
    readonly model: string;
};
/**
 * OpenAI error types
 */
export type OpenAIErrorType = 'authentication' | 'rate_limit' | 'quota_exceeded' | 'invalid_request' | 'server_error' | 'network_error' | 'unknown';
/**
 * OpenAI error details
 */
export type OpenAIErrorDetails = {
    readonly type: OpenAIErrorType;
    readonly message: string;
    readonly statusCode?: number;
    readonly retryAfter?: number;
};
//# sourceMappingURL=openai.d.ts.map