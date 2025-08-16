/**
 * Server configuration types
 */
export type ServerConfig = {
  readonly port: number;
  readonly environment: 'development' | 'production' | 'test';
  readonly defaultLang: string;
  readonly corsOrigin: string[];
};

/**
 * OpenAI configuration types
 */
export type OpenAIConfig = {
  readonly apiKey: string | null;
  readonly organization: string | null;
  readonly model: string;
  readonly maxTokens: number;
  readonly temperature: number;
};

/**
 * OpenSubtitles configuration types
 */
export type OpenSubtitlesConfig = {
  readonly apiKey: string | null;
  readonly userAgent: string;
  readonly baseUrl: string;
};

/**
 * Complete application configuration
 */
export type AppConfig = {
  readonly server: ServerConfig;
  readonly openai: OpenAIConfig;
  readonly opensubtitles: OpenSubtitlesConfig;
};

/**
 * Configuration status types
 */
export type ConfigStatus = {
  readonly server: ServerConfig;
  readonly openai: Omit<OpenAIConfig, 'apiKey'> & { readonly hasApiKey: boolean; readonly hasOrganization: boolean };
  readonly opensubtitles: Omit<OpenSubtitlesConfig, 'apiKey'> & { readonly hasApiKey: boolean };
  readonly validation: readonly string[];
};
