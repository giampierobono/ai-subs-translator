/**
 * Subtitle cue types
 */
export type SubtitleCue = {
  readonly index: number;
  readonly start: string;
  readonly end: string;
  readonly text: string;
};

/**
 * Subtitle format types
 */
export type SubtitleFormat = 'srt' | 'vtt' | 'ass' | 'ssa';

/**
 * Language code type (ISO 639-1)
 */
export type LanguageCode = string; // e.g., 'en', 'it', 'es', 'fr'

/**
 * Video identifier types
 */
export type VideoId = string; // e.g., 'tt1234567', '1234567', 'imdb:tt1234567'

/**
 * Subtitle metadata
 */
export type SubtitleMetadata = {
  readonly videoId: VideoId;
  readonly language: LanguageCode;
  readonly format: SubtitleFormat;
  readonly encoding?: string;
  readonly fps?: number;
};
