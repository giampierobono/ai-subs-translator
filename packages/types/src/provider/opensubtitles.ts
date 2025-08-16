import type { LanguageCode, VideoId } from '../subtitle';

/**
 * OpenSubtitles provider configuration
 */
export type OpenSubtitlesProviderConfig = {
  readonly apiKey: string | null;
  readonly userAgent: string;
  readonly baseUrl: string;
};

/**
 * OpenSubtitles subtitle file information (matches API response)
 */
export type OpenSubtitlesFile = {
  readonly file_id: number;
  readonly cd_number: number;
  readonly file_name: string;
  readonly attributes: {
    readonly subtitle_file_id: number;
    readonly hearing_impaired: boolean;
    readonly hd: boolean;
    readonly fps: number;
    readonly votes: number;
    readonly points: number;
    readonly ratings: number;
    readonly from_trusted: boolean;
    readonly foreign_parts_only: boolean;
    readonly upload_date: string;
    readonly ai_translated: boolean;
    readonly machine_translated: boolean;
    readonly release: string;
    readonly comments: string;
    readonly legacy_subtitle_id: number;
    readonly uploader: {
      readonly uploader_id: number;
      readonly name: string;
      readonly rank: string;
    };
    readonly feature_details: {
      readonly feature_id: number;
      readonly feature_type: string;
      readonly year: number;
      readonly title: string;
      readonly movie_name: string;
      readonly imdb_id: number;
      readonly tmdb_id: number;
    };
    readonly url: string;
    readonly related_links: {
      readonly label: string;
      readonly url: string;
      readonly img_url: string;
    }[];
    readonly files: {
      readonly file_id: number;
      readonly cd_number: number;
      readonly file_name: string;
    }[];
  };
};

/**
 * OpenSubtitles search request
 */
export type OpenSubtitlesSearchRequest = {
  readonly videoId: VideoId;
  readonly language: LanguageCode;
  readonly query?: string;
  readonly season?: number;
  readonly episode?: number;
};

/**
 * OpenSubtitles API response structure
 */
export type OpenSubtitlesApiResponse = {
  readonly total_pages: number;
  readonly total_count: number;
  readonly page: number;
  readonly data: readonly OpenSubtitlesFile[];
};

/**
 * OpenSubtitles error types
 */
export type OpenSubtitlesErrorType = 
  | 'not_found'
  | 'rate_limit'
  | 'authentication'
  | 'server_error'
  | 'network_error'
  | 'invalid_request'
  | 'unknown';

/**
 * OpenSubtitles error details
 */
export type OpenSubtitlesErrorDetails = {
  readonly type: OpenSubtitlesErrorType;
  readonly message: string;
  readonly statusCode?: number;
  readonly retryAfter?: number;
};
