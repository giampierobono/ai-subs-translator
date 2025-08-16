import { config as loadDotenv } from 'dotenv';
import path from 'path';

// Load environment variables from root .env file
loadDotenv({ path: path.join(__dirname, '../../../.env') });

// Import types for internal use
import type { 
  ServerConfig, 
  OpenAIConfig, 
  OpenSubtitlesConfig, 
  AppConfig, 
  ConfigStatus 
} from '@ai-subs-translator/types';

/**
 * Parse environment variable as number with default
 */
function parseNumber(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Parse environment variable as float with default
 */
function parseFloatValue(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = Number.parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Parse comma-separated string into array
 */
function parseArray(value: string | undefined, defaultValue: string[] = []): string[] {
  if (!value) return defaultValue;
  return value.split(',').map(s => s.trim()).filter(Boolean);
}

/**
 * Validate environment and return typed value
 */
function parseEnvironment(value: string | undefined): 'development' | 'production' | 'test' {
  const env = value?.toLowerCase();
  if (env === 'production' || env === 'test') {
    return env;
  }
  return 'development';
}

/**
 * Create and validate configuration from environment variables
 */
function createConfig(): AppConfig {
  return {
    server: {
      port: parseNumber(process.env.PORT, 8787),
      defaultLang: process.env.DEFAULT_LANG || 'en',
      corsOrigin: parseArray(process.env.CORS_ORIGIN),
      environment: parseEnvironment(process.env.NODE_ENV)
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || null,
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      maxTokens: parseNumber(process.env.OPENAI_MAX_TOKENS, 2000),
      temperature: parseFloatValue(process.env.OPENAI_TEMPERATURE, 0.3),
      organization: process.env.OPENAI_ORGANIZATION || null
    },
    opensubtitles: {
      apiKey: process.env.OPENSUBTITLES_API_KEY || null,
      userAgent: process.env.OPENSUBTITLES_USER_AGENT || 'ai-subs-translator v1.0',
      baseUrl: process.env.OPENSUBTITLES_BASE_URL || 'https://api.opensubtitles.com/api/v1'
    }
  };
}

/**
 * Validate that required configuration is present
 */
export function validateConfig(config: AppConfig): string[] {
  const errors: string[] = [];

  // Optional validations with warnings
  if (!config.openai.apiKey) {
    errors.push('OPENAI_API_KEY is not set - translation will not work');
  }

  if (!config.opensubtitles.apiKey) {
    errors.push('OPENSUBTITLES_API_KEY is not set - subtitle fetching may be limited');
  }

  // Validate port range
  if (config.server.port < 1 || config.server.port > 65535) {
    errors.push(`Invalid port: ${config.server.port}. Must be between 1 and 65535`);
  }

  // Validate OpenAI parameters
  if (config.openai.maxTokens < 100 || config.openai.maxTokens > 8000) {
    errors.push(`Invalid OpenAI max tokens: ${config.openai.maxTokens}. Should be between 100 and 8000`);
  }

  if (config.openai.temperature < 0 || config.openai.temperature > 2) {
    errors.push(`Invalid OpenAI temperature: ${config.openai.temperature}. Should be between 0 and 2`);
  }

  return errors;
}

/**
 * Global configuration instance
 */
export const config: AppConfig = createConfig();

/**
 * Get configuration status for debugging
 */
export function getConfigStatus() {
  return {
    server: {
      port: config.server.port,
      environment: config.server.environment,
      defaultLang: config.server.defaultLang,
      hasCorsOrigin: config.server.corsOrigin.length > 0
    },
    openai: {
      hasApiKey: !!config.openai.apiKey,
      model: config.openai.model,
      maxTokens: config.openai.maxTokens,
      temperature: config.openai.temperature,
      hasOrganization: !!config.openai.organization
    },
    opensubtitles: {
      hasApiKey: !!config.opensubtitles.apiKey,
      userAgent: config.opensubtitles.userAgent,
      baseUrl: config.opensubtitles.baseUrl
    },
    validation: validateConfig(config)
  };
}

/**
 * Check if the application is properly configured for production
 */
export function isProductionReady(): boolean {
  const errors = validateConfig(config);
  return errors.length === 0 && !!config.openai.apiKey && !!config.opensubtitles.apiKey;
}
