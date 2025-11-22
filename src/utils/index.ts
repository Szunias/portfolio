/**
 * Formats seconds into MM:SS string
 */
export const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return '0:00';
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};

/**
 * Safely extracts the base language code (e.g., 'en-US' -> 'en')
 * Defaults to 'en' if something goes wrong.
 */
export const getSafeLanguage = (langCode: string): 'en' | 'pl' | 'nl' => {
  if (!langCode) return 'en';
  const base = langCode.split('-')[0];
  if (['en', 'pl', 'nl'].includes(base)) {
    return base as 'en' | 'pl' | 'nl';
  }
  return 'en';
};
