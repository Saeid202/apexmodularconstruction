/**
 * YouTube URL utilities
 * Parses any YouTube URL format and extracts the video ID.
 * Supports: watch?v=, youtu.be/, /shorts/, /embed/
 */

/**
 * Extract YouTube video ID from any YouTube URL format.
 * Returns null if the URL is not a valid YouTube URL.
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;

  const trimmed = url.trim();

  // youtu.be/VIDEO_ID
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // youtube.com/watch?v=VIDEO_ID
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // youtube.com/shorts/VIDEO_ID
  const shortsMatch = trimmed.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];

  // youtube.com/embed/VIDEO_ID
  const embedMatch = trimmed.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  return null;
}

/**
 * Returns the YouTube embed URL for use in an <iframe>.
 * Includes privacy-enhanced mode (youtube-nocookie.com) and
 * rel=0 to suppress unrelated video suggestions.
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
}

/**
 * Returns the YouTube thumbnail URL (high quality).
 */
export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Validates that a string is a recognisable YouTube URL.
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null;
}
