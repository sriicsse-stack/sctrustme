// Multi-language detection and translation utilities
export type Language = 'en' | 'ta' | 'hi' | 'te' | 'ml' | 'kn';

interface LanguagePatterns {
  [key: string]: RegExp;
}

const languagePatterns: LanguagePatterns = {
  ta: /[\u0B80-\u0BFF]/g, // Tamil
  hi: /[\u0900-\u097F]/g, // Hindi
  te: /[\u0C60-\u0C7F]/g, // Telugu
  ml: /[\u0D00-\u0D7F]/g, // Malayalam
  kn: /[\u0C80-\u0CFF]/g, // Kannada
};

const tamilToEnglishMap: { [key: string]: string } = {
  'வேலை': 'work',
  'செய்யல': 'not working',
  'வேலை செய்யல': 'not working',
  'பிரச्यობ्मे': 'issue',
  'சரி': 'ok',
  'பரவாயில्ल': 'no problem',
};

const tanglishPatterns: { [key: string]: string } = {
  'aagala': 'not working',
  'pannunga': 'do this',
  'pannitu': 'done',
  'sariyana': 'correct',
  'prablemae': 'issue',
  'bro': 'buddy',
  'da': 'buddy',
};

export function detectLanguage(text: string): Language {
  if (!text) return 'en';

  // Check for Tamil characters
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
  
  // Check for Hindi characters
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  
  // Check for Telugu characters
  if (/[\u0C60-\u0C7F]/.test(text)) return 'te';
  
  // Check for Malayalam characters
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml';
  
  // Check for Kannada characters
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';

  // Check for Tanglish patterns
  const lowerText = text.toLowerCase();
  for (const [tanglish, english] of Object.entries(tanglishPatterns)) {
    if (lowerText.includes(tanglish)) {
      return 'en'; // Tanglish is still treated as English variant
    }
  }

  return 'en';
}

export function translateTanglish(text: string): string {
  let translated = text;
  for (const [tanglish, english] of Object.entries(tanglishPatterns)) {
    const regex = new RegExp(`\\b${tanglish}\\b`, 'gi');
    translated = translated.replace(regex, english);
  }
  return translated;
}

export function normalizeMultiLanguage(text: string): string {
  const language = detectLanguage(text);
  
  if (language === 'ta') {
    // For Tamil, return as-is (would need API for full translation)
    return text;
  }

  // Normalize Tanglish
  return translateTanglish(text);
}

export function getLanguageName(lang: Language): string {
  const names: { [key in Language]: string } = {
    en: 'English',
    ta: 'Tamil',
    hi: 'Hindi',
    te: 'Telugu',
    ml: 'Malayalam',
    kn: 'Kannada',
  };
  return names[lang];
}
