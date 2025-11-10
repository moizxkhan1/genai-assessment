export function calculateTTR(text: string): number {
  const words = (text.toLowerCase().match(/\b\w+\b/g) || []).filter(Boolean);
  if (words.length === 0) return 0;
  const uniqueWords = new Set(words);
  return (uniqueWords.size / words.length) * 100;
}
