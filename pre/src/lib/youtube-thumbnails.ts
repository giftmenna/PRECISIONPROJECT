// YouTube thumbnail quality options (in order of preference)
const THUMBNAIL_QUALITIES = [
  'maxresdefault.jpg',  // 1280x720 - highest quality
  'hqdefault.jpg',      // 480x360 - high quality (most reliable)
  'mqdefault.jpg',      // 320x180 - medium quality
  'sddefault.jpg',      // 640x480 - standard definition
  'default.jpg'         // 120x90 - default (always exists)
];

/**
 * Extract YouTube video ID from various YouTube URL formats
 */
export function extractYouTubeVideoId(videoUrl: string): string | null {
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = videoUrl.match(youtubeRegex);
  return match ? match[1] : null;
}

/**
 * Generate YouTube thumbnail URL with fallback qualities
 */
export function generateYouTubeThumbnail(videoUrl: string, quality: string = 'hqdefault.jpg'): string {
  const videoId = extractYouTubeVideoId(videoUrl);
  if (!videoId) return '';
  
  return `https://img.youtube.com/vi/${videoId}/${quality}`;
}

/**
 * Generate multiple thumbnail URLs for fallback testing
 */
export function generateYouTubeThumbnails(videoUrl: string): string[] {
  const videoId = extractYouTubeVideoId(videoUrl);
  if (!videoId) return [];
  
  return THUMBNAIL_QUALITIES.map(quality => 
    `https://img.youtube.com/vi/${videoId}/${quality}`
  );
}

/**
 * Get the best available thumbnail URL by testing multiple qualities
 */
export async function getBestYouTubeThumbnail(videoUrl: string): Promise<string> {
  const thumbnails = generateYouTubeThumbnails(videoUrl);
  
  for (const thumbnailUrl of thumbnails) {
    try {
      const response = await fetch(thumbnailUrl, { method: 'HEAD' });
      if (response.ok) {
        return thumbnailUrl;
      }
    } catch (error) {
      // Continue to next quality
      continue;
    }
  }
  
  // Return the most reliable fallback
  return thumbnails[1] || ''; // hqdefault.jpg is most reliable
} 