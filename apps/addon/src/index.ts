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

// Configuration endpoint for user's API keys
const CONFIG_URL = '/configure';

// Function to create manifest with user configuration
function createManifest(openaiKey?: string, opensubtitlesKey?: string) {
  const configSuffix = openaiKey ? '' : '\n\n⚠️ Configure your API keys first!';
  
  return {
    id: 'ai-subs-translator-addon',
    version: '1.0.0',
    name: 'AI Subtitle Translator',
    description: `Serve AI-translated subtitles on demand.${configSuffix}`,
    resources: ['subtitles'],
    types: ['movie', 'series'],
    idPrefixes: ['tt'],
    catalogs: [],
    // Stremio addon configuration
    behaviorHints: {
      configurable: true,
      configurationRequired: !openaiKey
    }
  };
}

// Create default builder (will be recreated with user config)
const defaultManifest = createManifest();
const builder = new addonBuilder(defaultManifest);

// Function to create subtitles handler with user's API keys
function createSubtitlesHandler(openaiKey?: string, opensubtitlesKey?: string) {
  return ({ id, type, extra }: SubtitlesRequest) => {
    // Check if user has configured API keys
    if (!openaiKey) {
      return Promise.resolve({
        subtitles: [
          {
            id: 'config-required',
            lang: 'en',
            url: '',
            name: '⚠️ Configure API Keys First'
          }
        ]
      });
    }

    // Determine the requested language; fallback to default
    const lang = (extra && extra.lang) || DEFAULT_LANG;
    
    // Pass API keys as headers to backend
    const params = new URLSearchParams({ 
      video: id, 
      lang,
      openai_key: openaiKey,
      opensubtitles_key: opensubtitlesKey || ''
    });
    
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
}

// Default handler (no keys configured)
builder.defineSubtitlesHandler(createSubtitlesHandler());

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
    
    // Serve manifest (default or configured)
    app.get('/manifest.json', (req: Request, res: Response) => {
      res.json(defaultManifest);
    });

    // Serve configured manifest with user's API keys
    app.get('/:openaiKey/manifest.json', (req: Request, res: Response) => {
      const { openaiKey } = req.params;
      const opensubtitlesKey = req.query.opensubtitles_key as string;
      
      if (!openaiKey || openaiKey === 'configure') {
        return res.redirect('/configure.html');
      }
      
      const configuredManifest = createManifest(openaiKey, opensubtitlesKey);
      res.json(configuredManifest);
    });

    // Configuration page
    app.get('/configure.html', (req: Request, res: Response) => {
      const html = `
<!DOCTYPE html>
<html>
<head>
  <title>AI Subtitle Translator - Configuration</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
    .form-group { margin: 15px 0; }
    label { display: block; margin-bottom: 5px; font-weight: bold; }
    input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
    button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
    .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 4px; margin: 20px 0; }
    .generated-url { background: #d4edda; border: 1px solid #c3e6cb; padding: 10px; border-radius: 4px; margin: 20px 0; word-break: break-all; }
  </style>
</head>
<body>
  <h1>🎬 AI Subtitle Translator Configuration</h1>
  
  <div class="warning">
    <strong>⚠️ Privacy Notice:</strong> Your API keys will be included in the addon URL. Only share this URL with trusted devices. Never share it publicly.
  </div>

  <form id="configForm">
    <div class="form-group">
      <label for="openaiKey">OpenAI API Key (Required):</label>
      <input type="password" id="openaiKey" placeholder="sk-..." required>
      <small>Get your key from: <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com/api-keys</a></small>
    </div>
    
    <div class="form-group">
      <label for="opensubtitlesKey">OpenSubtitles API Key (Optional):</label>
      <input type="password" id="opensubtitlesKey" placeholder="Your OpenSubtitles key">
      <small>Get your key from: <a href="https://www.opensubtitles.com/en/consumers" target="_blank">opensubtitles.com/consumers</a></small>
    </div>
    
    <button type="submit">Generate Addon URL</button>
  </form>

  <div id="result" style="display: none;">
    <h3>✅ Your Personal Addon URL:</h3>
    <div class="generated-url">
      <strong>Copy this URL to install in Stremio:</strong><br>
      <span id="addonUrl"></span>
    </div>
    <p><strong>How to install:</strong></p>
    <ol>
      <li>Copy the URL above</li>
      <li>Open Stremio</li>
      <li>Go to Addons → Community Addons</li>
      <li>Paste the URL and click Install</li>
    </ol>
  </div>

  <script>
    document.getElementById('configForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const openaiKey = document.getElementById('openaiKey').value;
      const opensubtitlesKey = document.getElementById('opensubtitlesKey').value;
      
      if (!openaiKey) {
        alert('OpenAI API Key is required!');
        return;
      }
      
      let addonUrl = window.location.origin + '/' + openaiKey + '/manifest.json';
      if (opensubtitlesKey) {
        addonUrl += '?opensubtitles_key=' + encodeURIComponent(opensubtitlesKey);
      }
      
      document.getElementById('addonUrl').textContent = addonUrl;
      document.getElementById('result').style.display = 'block';
    });
  </script>
</body>
</html>`;
      res.send(html);
    });
    
    // Serve subtitles with dynamic API keys
    app.get('/:openaiKey/subtitles/:type/:id.json', async (req: Request, res: Response) => {
      try {
        const { openaiKey, type, id } = req.params;
        const extra = req.query;
        const opensubtitlesKey = req.query.opensubtitles_key as string;
        
        // Create handler with user's API keys
        const handler = createSubtitlesHandler(openaiKey, opensubtitlesKey);
        
        const result = await handler({
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

    // Default subtitles endpoint (no config)
    app.get('/subtitles/:type/:id.json', async (req: Request, res: Response) => {
      res.status(400).json({ 
        error: 'Configuration required',
        message: 'Please configure your API keys at /configure.html'
      });
    });
    
    // Root endpoint - redirect to configuration
    app.get('/', (req: Request, res: Response) => {
      res.redirect('/configure.html');
    });

    app.listen(PORT, () => {
      console.log(`🎬 AI Subtitle Translator addon started on port ${PORT}`);
      console.log(`🔧 Configuration: http://localhost:${PORT}/configure.html`);
      console.log(`📋 Default Manifest: http://localhost:${PORT}/manifest.json`);
      console.log(`🔗 Backend URL: ${BACKEND_URL}`);
    });
  }
} catch (error) {
  console.error('Failed to start addon server:', error);
  process.exit(1);
}
