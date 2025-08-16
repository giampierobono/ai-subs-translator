/**
 * Subtitle cue interface
 */
export interface SubtitleCue {
  index: number;
  start: string;
  end: string;
  text: string;
}

/**
 * Parse an SRT string into an array of cue objects.
 * Each cue has an index, start time, end time and text.
 */
export function parseSrt(srt: string): SubtitleCue[] {
  if (!srt) return [];
  const blocks = srt.replace(/\r/g, '').split(/\n\n+/);
  const cues: SubtitleCue[] = [];
  
  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length < 2) continue;
    
    const index = parseInt(lines[0].trim(), 10);
    const timeMatch = lines[1].match(/^(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
    if (!timeMatch) continue;
    
    const start = timeMatch[1];
    const end = timeMatch[2];
    const text = lines.slice(2).join('\n');
    
    cues.push({ index, start, end, text });
  }
  
  return cues;
}

/**
 * Convert an array of cue objects back into SRT format.
 */
export function cuesToSrt(cues: SubtitleCue[]): string {
  return cues
    .map((cue) => `${cue.index}\n${cue.start} --> ${cue.end}\n${cue.text}`)
    .join('\n\n') + '\n';
}

/**
 * Convert SRT formatted subtitles into WebVTT format.
 * Note: WebVTT uses '.' instead of ',' for milliseconds.
 */
export function srtToVtt(srt: string): string {
  const normalized = srt.replace(/\r/g, '').replace(/,/g, '.');
  return 'WEBVTT\n\n' + normalized;
}
