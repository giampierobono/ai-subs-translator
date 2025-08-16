import express from 'express';
import cors from 'cors';
import { config, getConfigStatus, validateConfig } from '@ai-subs-translator/config';

// Import helper functions and providers from local packages
import { parseSrt, cuesToSrt, srtToVtt } from '@ai-subs-translator/core';
import { fetchSubtitles, OpenSubtitlesError } from '@ai-subs-translator/provider-opensubtitles';
import { translateSrt, OpenAIError } from '@ai-subs-translator/provider-openai';

/**
 * Custom error classes for better error handling
 */
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class ServiceUnavailableError extends Error {
  constructor(message: string, public service: string) {
    super(message);
    this.name = 'ServiceUnavailableError';
  }
}

/**
 * Logger utility (simple console logging for now)
 */
const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  error: (message: string, meta?: any) => {
    console.error(`[ERROR] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${message}`, meta ? JSON.stringify(meta) : '');
  }
};

/**
 * Validate video ID format
 */
function validateVideoId(videoId: string): void {
  if (!videoId?.trim()) {
    throw new ValidationError('video parameter is required');
  }
  
  // Accept various formats: tt1234567, 1234567, imdb:tt1234567
  const cleanId = videoId.replace(/^[a-z]+:/i, '');
  if (!cleanId.match(/^(tt)?\d+$/)) {
    throw new ValidationError('video must be a valid IMDb ID (e.g., tt1234567 or 1234567)');
  }
}

/**
 * Validate language code
 */
function validateLanguage(lang: string): void {
  if (!lang?.trim()) {
    throw new ValidationError('lang parameter is required');
  }
  
  if (!lang.match(/^[a-z]{2}$/)) {
    throw new ValidationError('lang must be a 2-letter language code (e.g., en, it, es)');
  }
}

/**
 * Handle API errors and send appropriate responses
 */
function handleError(error: any, res: express.Response, context: string): void {
  logger.error(`${context} failed`, { 
    error: error.message, 
    name: error.name,
    stack: config.server.environment === 'development' ? error.stack : undefined
  });

  if (error instanceof ValidationError) {
    res.status(400).json({
      error: 'Invalid request',
      message: error.message
    });
  } else if (error instanceof OpenSubtitlesError) {
    res.status(error.statusCode === 404 ? 404 : 503).json({
      error: 'Subtitle service error',
      message: error.statusCode === 404 ? 'No subtitles found for this video' : 'Subtitle service temporarily unavailable'
    });
  } else if (error instanceof OpenAIError) {
    const statusCode = error.statusCode || 503;
    res.status(statusCode).json({
      error: 'Translation service error',
      message: statusCode === 401 ? 'Translation service authentication failed' : 
               statusCode === 429 ? 'Translation service quota exceeded' :
               'Translation service temporarily unavailable'
    });
  } else if (error instanceof ServiceUnavailableError) {
    res.status(503).json({
      error: 'Service unavailable',
      message: `${error.service} is not properly configured`
    });
  } else {
    res.status(500).json({
      error: 'Internal server error',
      message: config.server.environment === 'production' ? 'An unexpected error occurred' : error.message
    });
  }
}

/**
 * Initialize Express app
 */
const app = express();

// Middleware
app.use(express.json());

// CORS configuration
if (config.server.corsOrigin.length > 0) {
  app.use(cors({
    origin: config.server.corsOrigin,
    credentials: true
  }));
} else {
  app.use(cors()); // Allow all origins in development
}

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { 
    query: req.query,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Health endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'AI Subtitle Translator Server',
    version: '1.0.0',
    status: 'healthy',
    environment: config.server.environment
  });
});

// Configuration status endpoint
app.get('/status', (_req, res) => {
  const status = getConfigStatus();
  res.json(status);
});

// Health check endpoint
app.get('/health', (_req, res) => {
  const configErrors = validateConfig(config);
  const isHealthy = configErrors.length === 0;
  
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    checks: {
      openai: !!config.openai.apiKey,
      opensubtitles: !!config.opensubtitles.apiKey
    },
    issues: configErrors
  });
});

// Main subtitles translation endpoint
app.get('/subs', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Extract and validate parameters
    const video = req.query.video as string;
    const lang = (req.query.lang as string) || config.server.defaultLang;
    const targetLang = req.query.target as string; // New: explicit target language
    
    validateVideoId(video);
    validateLanguage(lang);
    
    // If target language is specified, validate it too
    if (targetLang) {
      validateLanguage(targetLang);
    }

    // Check service availability
    if (!config.opensubtitles.apiKey) {
      throw new ServiceUnavailableError('OpenSubtitles API key not configured', 'OpenSubtitles');
    }

    // Only check OpenAI if translation is needed
    const needsTranslation = targetLang && targetLang !== lang;
    if (needsTranslation && !config.openai.apiKey) {
      throw new ServiceUnavailableError('OpenAI API key not configured', 'OpenAI');
    }

    logger.info('Processing subtitle request', { 
      video, 
      sourceLang: lang, 
      targetLang: targetLang || 'none',
      needsTranslation 
    });

    // Step 1: Fetch the original subtitles in SRT format
    const originalSrt = await fetchSubtitles(video, lang);
    logger.info('Subtitles fetched successfully', { 
      video, 
      lang, 
      sizeBytes: originalSrt.length 
    });

    // Step 2: Parse and validate SRT content
    const cues = parseSrt(originalSrt);
    if (cues.length === 0) {
      throw new ValidationError('No valid subtitle cues found in fetched content');
    }

    // Step 3: Translate if target language is different
    let finalSrt = originalSrt;
    if (needsTranslation) {
      logger.info('Starting translation', { from: lang, to: targetLang });
      const srtText = cuesToSrt(cues);
      finalSrt = await translateSrt(srtText, targetLang);
      logger.info('Translation completed', { 
        from: lang, 
        to: targetLang,
        originalSize: srtText.length,
        translatedSize: finalSrt.length
      });
    }

    // Step 4: Convert to VTT for streaming
    const vtt = srtToVtt(finalSrt);
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    const processingTime = Date.now() - startTime;
    logger.info('Request completed successfully', {
      video,
      sourceLang: lang,
      targetLang: targetLang || 'none',
      processingTimeMs: processingTime,
      outputSizeBytes: vtt.length
    });

    return res.send(vtt);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    handleError(error, res, 'Subtitle processing');
    
    // Log performance metrics even for errors
    logger.info('Request completed with error', {
      video: req.query.video,
      processingTimeMs: processingTime
    });
  }
});

// Error handling for 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { 
    error: err.message, 
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  res.status(500).json({
    error: 'Internal server error',
    message: config.server.environment === 'production' ? 'An unexpected error occurred' : err.message
  });
});

// Start server
app.listen(config.server.port, () => {
  logger.info('AI Subtitle Translator server started', {
    port: config.server.port,
    environment: config.server.environment,
    defaultLang: config.server.defaultLang
  });
  
  // Log configuration status
  const configErrors = validateConfig(config);
  if (configErrors.length > 0) {
    logger.warn('Configuration warnings', { issues: configErrors });
  } else {
    logger.info('All services properly configured');
  }
});