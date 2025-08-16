/**
 * Fetch subtitles for a given video and language.
 *
 * This is a stub implementation. In a real implementation you
 * would call the OpenSubtitles API using your API key to retrieve
 * the appropriate SRT file. See the README for details.
 */
export async function fetchSubtitles(videoId: string, lang: string): Promise<string> {
  // TODO: implement real API call to OpenSubtitles here
  // For the skeleton, return a static SRT as a placeholder.
  return `1
00:00:01,000 --> 00:00:03,000
Hello, world!

2
00:00:03,500 --> 00:00:05,000
This is a sample subtitle.`;
}
