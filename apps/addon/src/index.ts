import { addonBuilder, type SubtitlesRequest } from 'stremio-addon-sdk';
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
builder.defineSubtitlesHandler(({ id, type, extra }: SubtitlesRequest) => {
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
});

// Export the interface for Stremio
export = builder.getInterface();
