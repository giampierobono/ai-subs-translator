import express from 'express';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from the root .env file if present
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import helper functions and providers from local packages
import { parseSrt, cuesToSrt, srtToVtt } from '@ai-subs-translator/core';
import { fetchSubtitles } from '@ai-subs-translator/provider-opensubtitles';
import { translateSrt } from '@ai-subs-translator/provider-openai';

const PORT = process.env.PORT || 8787;
const DEFAULT_LANG = process.env.DEFAULT_LANG || 'en';

const app = express();

// Health endpoint
app.get('/', (_req, res) => {
  res.send('AI Subtitle Translator Server');
});

// Subtitles translation endpoint
app.get('/subs', async (req, res) => {
  try {
    const video = req.query.video as string;
    const lang = (req.query.lang as string) || DEFAULT_LANG;
    
    if (!video) {
      return res.status(400).send('Missing video parameter');
    }

    // Fetch the original subtitles in SRT format
    const originalSrt = await fetchSubtitles(video, lang);

    // Parse the SRT file into cues
    const cues = parseSrt(originalSrt);

    // Convert the cues back into SRT text (optional)
    const srtText = cuesToSrt(cues);

    // Translate the SRT; this function should return valid SRT with the same timecodes
    const translatedSrt = await translateSrt(srtText, lang);

    // Convert translated SRT into VTT for streaming
    const vtt = srtToVtt(translatedSrt);

    res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
    return res.send(vtt);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error processing subtitles');
  }
});

app.listen(PORT, () => {
  console.log(`AI Subtitle Translator server listening on ${PORT}`);
});
