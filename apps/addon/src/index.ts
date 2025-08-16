import { addonBuilder, type SubtitlesRequest } from 'stremio-addon-sdk';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from the root .env file if present
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Base URL of the backend server; can be overridden via environment variables
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8787/subs';
// Default language for subtitles when not provided by the user
const DEFAULT_LANG = process.env.DEFAULT_LANG || 'en';

// Manifest for Stremio addon
const manifest = {
  id: 'ai-subs-translator-addon',
  version: '1.0.0',
  name: 'AI Subtitle Translator',
  description: 'Serve AI-translated subtitles on demand.',
  resources: ['subtitles'],
  types: ['movie', 'series'],
  idPrefixes: ['tt'],
  catalogs: []
};

const builder = new addonBuilder(manifest);

// Define the subtitles handler
const subtitlesHandler = ({ id, type, extra }: SubtitlesRequest) => {
  // Determine the requested language; fallback to default
  const lang = (extra && extra.lang) || DEFAULT_LANG;
  // Compose query string for the backend
  const params = new URLSearchParams({ video: id, lang });
  return Promise.resolve({
    subtitles: [
      {
        id: `ai-${lang}`,
        lang,
        url: `${BACKEND_URL}?${params.toString()}`,
        name: `${lang.toUpperCase()} (AI)`
      }
    ]
  });
};

builder.defineSubtitlesHandler(subtitlesHandler);

// Start the addon server using Stremio SDK's built-in method
const PORT = process.env.PORT || 7000;

try {
  // Use the SDK's built-in server
  const addonInterface = builder.getInterface();
  
  // If the SDK provides a publishToWeb method, use it
  if (typeof addonInterface.publishToWeb === 'function') {
    addonInterface.publishToWeb(PORT);
    console.log(`🎬 AI Subtitle Translator addon started on port ${PORT}`);
    console.log(`📋 Manifest: http://localhost:${PORT}/manifest.json`);
    console.log(`🔗 Backend URL: ${BACKEND_URL}`);
  } else {
    // Fallback: manual express setup
    const app = express();
    
    // CORS middleware
    app.use((req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });
    
    // Serve manifest
    app.get('/manifest.json', (req: Request, res: Response) => {
      res.json(manifest);
    });
    
    // Serve subtitles
    app.get('/subtitles/:type/:id.json', async (req: Request, res: Response) => {
      try {
        const { type, id } = req.params;
        const extra = req.query;
        
        const result = await subtitlesHandler({
          id,
          type,
          extra
        } as SubtitlesRequest);
        
        res.json(result);
      } catch (error) {
        console.error('Subtitles error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
    
    app.listen(PORT, () => {
      console.log(`🎬 AI Subtitle Translator addon started on port ${PORT}`);
      console.log(`📋 Manifest: http://localhost:${PORT}/manifest.json`);
      console.log(`🔗 Backend URL: ${BACKEND_URL}`);
    });
  }
} catch (error) {
  console.error('Failed to start addon server:', error);
  process.exit(1);
}
