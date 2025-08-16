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
export type LanguageCode = string;
/**
 * Video identifier types
 */
export type VideoId = string;
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
//# sourceMappingURL=index.d.ts.map