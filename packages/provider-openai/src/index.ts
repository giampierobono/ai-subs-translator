import OpenAI from 'openai';
import type { OpenAIProviderConfig } from '@ai-subs-translator/types';

/**
 * Language mapping for better OpenAI translation prompts
 */
const LANGUAGE_NAMES: Record<string, string> = {
  'en': 'English',
  'it': 'Italian',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'tr': 'Turkish',
  'pl': 'Polish',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'da': 'Danish',
  'no': 'Norwegian',
  'fi': 'Finnish'
};

/**
 * Configuration for OpenAI provider
 */
const config: OpenAIProviderConfig = {
  apiKey: process.env.OPENAI_API_KEY || null,
  model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
  temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.3'),
  organization: process.env.OPENAI_ORGANIZATION
};

/**
 * OpenAI client instance
 */
let openaiClient: OpenAI | null = null;

/**
 * Custom error class for OpenAI translation errors
 */
export class OpenAIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'OpenAIError';
  }
}

/**
 * Initialize OpenAI client
 */
function getOpenAIClient(apiKey?: string): OpenAI {
  const keyToUse = apiKey || config.apiKey;
  
  if (!keyToUse) {
    throw new OpenAIError('OpenAI API key is required. Provide apiKey parameter or set OPENAI_API_KEY environment variable.');
  }

  // If we have a user-provided key, create a new client (don't cache)
  if (apiKey && apiKey !== config.apiKey) {
    return new OpenAI({
      apiKey: keyToUse,
      organization: config.organization || undefined
    });
  }

  // Use cached client for server's default key
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: keyToUse,
      organization: config.organization || undefined
    });
  }
  
  return openaiClient;
}

/**
 * Extract subtitle text lines from SRT content (without timestamps)
 */
function extractSubtitleTexts(srt: string): string[] {
  const blocks = srt.replace(/\r/g, '').split(/\n\n+/);
  const texts: string[] = [];
  
  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length >= 3) {
      // Skip index (line 0) and timestamp (line 1), take text (line 2+)
      const text = lines.slice(2).join('\n').trim();
      if (text) {
        texts.push(text);
      }
    }
  }
  
  return texts;
}

/**
 * Reconstruct SRT with translated texts
 */
function reconstructSrt(originalSrt: string, translatedTexts: string[]): string {
  const blocks = originalSrt.replace(/\r/g, '').split(/\n\n+/);
  const translatedBlocks: string[] = [];
  let textIndex = 0;
  
  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length >= 3 && textIndex < translatedTexts.length) {
      // Keep index and timestamp, replace text
      const index = lines[0];
      const timestamp = lines[1];
      const translatedText = translatedTexts[textIndex];
      
      translatedBlocks.push(`${index}\n${timestamp}\n${translatedText}`);
      textIndex++;
    }
  }
  
  return translatedBlocks.join('\n\n') + '\n';
}

/**
 * Split texts into chunks to respect token limits
 */
function chunkTexts(texts: string[], maxChunkSize: number = 50): string[][] {
  const chunks: string[][] = [];
  
  for (let i = 0; i < texts.length; i += maxChunkSize) {
    chunks.push(texts.slice(i, i + maxChunkSize));
  }
  
  return chunks;
}

/**
 * Translate a batch of subtitle texts using OpenAI
 */
async function translateTextBatch(texts: string[], targetLang: string, apiKey?: string): Promise<string[]> {
  const client = getOpenAIClient(apiKey);
  const targetLanguage = LANGUAGE_NAMES[targetLang.toLowerCase()] || targetLang;
  
  // Create prompt for batch translation
  const textsFormatted = texts.map((text, i) => `${i + 1}. ${text}`).join('\n');
  
  const prompt = `Translate the following subtitle texts to ${targetLanguage}. 
Keep the same numbering and format. Preserve the emotional tone and context. 
Only return the translated texts with their numbers, nothing else.

${textsFormatted}`;

  try {
    const completion = await client.chat.completions.create({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: `You are a professional subtitle translator. Translate subtitle texts accurately while preserving timing, tone, and cultural context. Keep translations concise to fit subtitle constraints.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature
    });

    const translatedContent = completion.choices[0]?.message?.content;
    
    if (!translatedContent) {
      throw new OpenAIError('No translation received from OpenAI');
    }

    // Parse the numbered response back to array
    const translatedTexts = translatedContent
      .split('\n')
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(line => line.length > 0);

    if (translatedTexts.length !== texts.length) {
      console.warn(`Translation count mismatch: expected ${texts.length}, got ${translatedTexts.length}`);
      // Pad with original texts if needed
      while (translatedTexts.length < texts.length) {
        translatedTexts.push(texts[translatedTexts.length]);
      }
    }

    return translatedTexts;

  } catch (error: any) {
    // Re-throw OpenAI errors as-is to preserve the specific error type
    if (error instanceof OpenAIError) {
      throw error;
    }
    
    // Handle specific OpenAI API errors
    if (error.code === 'insufficient_quota') {
      throw new OpenAIError('OpenAI API quota exceeded', error.code, 429);
    }
    if (error.code === 'invalid_api_key') {
      throw new OpenAIError('Invalid OpenAI API key', error.code, 401);
    }
    if (error.status) {
      throw new OpenAIError(
        `OpenAI API error: ${error.message || 'Unknown API error'}`,
        error.code,
        error.status
      );
    }
    
    // Generic error handling
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new OpenAIError(`Translation failed: ${message}`);
  }
}

/**
 * Translate a subtitle file from the source language into the target language.
 * 
 * This implementation uses OpenAI's GPT model to translate subtitle texts
 * while preserving the original timing and format.
 * 
 * @param srt The original subtitle text in SRT format
 * @param targetLang The target language code (e.g. 'it', 'es', 'fr')
 * @returns Promise<string> The translated subtitle text in SRT format
 * 
 * @throws {OpenAIError} When API request fails or configuration is invalid
 */
export async function translateSrt(srt: string, targetLang: string, apiKey?: string): Promise<string> {
  if (!srt?.trim()) {
    throw new OpenAIError('SRT content is required');
  }
  
  if (!targetLang?.trim()) {
    throw new OpenAIError('Target language is required');
  }

  try {
    // Extract subtitle texts (without timestamps)
    const originalTexts = extractSubtitleTexts(srt);
    
    if (originalTexts.length === 0) {
      throw new OpenAIError('No subtitle texts found in SRT content');
    }

    // Split into manageable chunks for API limits
    const textChunks = chunkTexts(originalTexts, 30); // Process 30 subtitles at a time
    const translatedChunks: string[] = [];

    // Translate each chunk
    for (const chunk of textChunks) {
      const translatedChunk = await translateTextBatch(chunk, targetLang, apiKey);
      translatedChunks.push(...translatedChunk);
    }

    // Reconstruct SRT with translated texts
    const translatedSrt = reconstructSrt(srt, translatedChunks);
    
    if (!translatedSrt.trim()) {
      throw new OpenAIError('Failed to reconstruct translated SRT');
    }

    return translatedSrt;

  } catch (error) {
    if (error instanceof OpenAIError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new OpenAIError(`Translation failed: ${message}`);
  }
}

/**
 * Check if OpenAI API is properly configured
 */
export function isConfigured(): boolean {
  return !!config.apiKey;
}

/**
 * Get configuration status for debugging
 */
export function getConfigStatus(): {
  hasApiKey: boolean;
  model: string;
  maxTokens: number;
  temperature: number;
  hasOrganization: boolean;
} {
  return {
    hasApiKey: !!config.apiKey,
    model: config.model,
    maxTokens: config.maxTokens,
    temperature: config.temperature,
    hasOrganization: !!config.organization
  };
}

/**
 * Get supported languages
 */
export function getSupportedLanguages(): Record<string, string> {
  return { ...LANGUAGE_NAMES };
}