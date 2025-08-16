import fetch from 'node-fetch';

/**
 * OpenSubtitles API configuration
 */
interface OpenSubtitlesConfig {
  apiKey?: string;
  userAgent: string;
  baseUrl: string;
}

/**
 * OpenSubtitles subtitle file response
 */
interface SubtitleFile {
  file_id: number;
  cd_number: number;
  file_name: string;
  attributes: {
    subtitle_file_id: number;
    hearing_impaired: boolean;
    hd: boolean;
    fps: number;
    votes: number;
    points: number;
    ratings: number;
    from_trusted: boolean;
    foreign_parts_only: boolean;
    upload_date: string;
    ai_translated: boolean;
    machine_translated: boolean;
    release: string;
    comments: string;
    legacy_subtitle_id: number;
    uploader: {
      uploader_id: number;
      name: string;
      rank: string;
    };
    feature_details: {
      feature_id: number;
      feature_type: string;
      year: number;
      title: string;
      movie_name: string;
      imdb_id: number;
      tmdb_id: number;
    };
    url: string;
    related_links: {
      label: string;
      url: string;
      img_url: string;
    }[];
    files: {
      file_id: number;
      file_name: string;
    }[];
  };
}

/**
 * OpenSubtitles API response for subtitles search
 */
interface OpenSubtitlesResponse {
  total_pages: number;
  total_count: number;
  per_page: number;
  page: number;
  data: SubtitleFile[];
}

/**
 * Configuration for OpenSubtitles provider
 */
const config: OpenSubtitlesConfig = {
  apiKey: process.env.OPENSUBTITLES_API_KEY,
  userAgent: process.env.OPENSUBTITLES_USER_AGENT || 'ai-subs-translator v1.0',
  baseUrl: 'https://api.opensubtitles.com/api/v1'
};

/**
 * Custom error class for OpenSubtitles API errors
 */
export class OpenSubtitlesError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'OpenSubtitlesError';
  }
}

/**
 * Extract IMDb ID from various video ID formats
 * Supports: tt1234567, 1234567, imdb:tt1234567
 */
function extractImdbId(videoId: string): string {
  // Remove any protocol prefix (imdb:, etc.)
  const cleaned = videoId.replace(/^[a-z]+:/i, '');
  
  // If it already starts with 'tt', use as-is
  if (cleaned.startsWith('tt')) {
    return cleaned;
  }
  
  // If it's just numbers, add 'tt' prefix
  if (/^\d+$/.test(cleaned)) {
    return `tt${cleaned}`;
  }
  
  throw new OpenSubtitlesError(`Invalid video ID format: ${videoId}`);
}

/**
 * Make authenticated request to OpenSubtitles API
 */
async function makeApiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${config.baseUrl}${endpoint}`;
  
  const headers: Record<string, string> = {
    'User-Agent': config.userAgent,
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {})
  };

  // Add API key if available
  if (config.apiKey) {
    headers['Api-Key'] = config.apiKey;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      ...options
    } as any);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new OpenSubtitlesError(
        `OpenSubtitles API error: ${response.status} ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof OpenSubtitlesError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown network error';
    throw new OpenSubtitlesError(`Network error: ${message}`);
  }
}

/**
 * Download subtitle file content
 */
async function downloadSubtitleFile(downloadUrl: string): Promise<string> {
  try {
    const response = await fetch(downloadUrl, {
      headers: {
        'User-Agent': config.userAgent
      }
    });

    if (!response.ok) {
      throw new OpenSubtitlesError(
        `Failed to download subtitle: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    return await response.text();
  } catch (error) {
    if (error instanceof OpenSubtitlesError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown download error';
    throw new OpenSubtitlesError(`Download error: ${message}`);
  }
}

/**
 * Fetch subtitles for a given video and language from OpenSubtitles API.
 * 
 * @param videoId The video identifier (IMDb ID like 'tt1234567' or just '1234567')
 * @param lang The desired language code (ISO 639-1, e.g. 'en', 'it', 'es')
 * @returns Promise<string> The subtitle file contents in SRT format
 * 
 * @throws {OpenSubtitlesError} When API request fails or no subtitles found
 */
export async function fetchSubtitles(videoId: string, lang: string): Promise<string> {
  if (!videoId?.trim()) {
    throw new OpenSubtitlesError('Video ID is required');
  }
  
  if (!lang?.trim()) {
    throw new OpenSubtitlesError('Language code is required');
  }

  const imdbId = extractImdbId(videoId);
  
  try {
    // Search for subtitles
    const searchParams = new URLSearchParams({
      imdb_id: imdbId.replace('tt', ''), // API expects numeric ID
      languages: lang,
      order_by: 'download_count', // Get most popular first
      order_direction: 'desc'
    });

    const searchResponse: OpenSubtitlesResponse = await makeApiRequest(
      `/subtitles?${searchParams.toString()}`
    );

    if (!searchResponse.data || searchResponse.data.length === 0) {
      throw new OpenSubtitlesError(
        `No subtitles found for video ${imdbId} in language ${lang}`
      );
    }

    // Get the best subtitle (first one after sorting by download_count)
    const bestSubtitle = searchResponse.data[0];
    const downloadUrl = bestSubtitle.attributes.url;

    if (!downloadUrl) {
      throw new OpenSubtitlesError('No download URL found for subtitle');
    }

    // Download the subtitle file
    const subtitleContent = await downloadSubtitleFile(downloadUrl);
    
    if (!subtitleContent.trim()) {
      throw new OpenSubtitlesError('Downloaded subtitle file is empty');
    }

    return subtitleContent;

  } catch (error) {
    if (error instanceof OpenSubtitlesError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new OpenSubtitlesError(
      `Failed to fetch subtitles: ${message}`
    );
  }
}

/**
 * Check if OpenSubtitles API is properly configured
 */
export function isConfigured(): boolean {
  return !!config.apiKey;
}

/**
 * Get configuration status for debugging
 */
export function getConfigStatus(): {
  hasApiKey: boolean;
  userAgent: string;
  baseUrl: string;
} {
  return {
    hasApiKey: !!config.apiKey,
    userAgent: config.userAgent,
    baseUrl: config.baseUrl
  };
}