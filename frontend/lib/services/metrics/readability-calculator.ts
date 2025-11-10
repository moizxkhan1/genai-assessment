// Simple Flesch Reading Ease implementation
// 206.835 - 1.015*(words/sentences) - 84.6*(syllables/word)

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  // Heuristic syllable count
  let count = 0;
  const vowels = /[aeiouy]/g;
  const matches = w.match(vowels);
  if (matches) count = matches.length;
  // Remove silent 'e'
  if (w.endsWith("e")) count--;
  // Ensure at least 1 syllable
  return Math.max(1, count);
}

export function calculateFleschScore(text: string): number {
  const sentences = (text.match(/[.!?]+/g) || []).length || 1;
  const words = (text.match(/\b\w+\b/g) || []).length || 1;
  const tokens = (text.match(/\b\w+\b/g) || []).map((t) => t);
  const syllables = tokens.reduce((acc, w) => acc + countSyllables(w), 0) || 1;

  const asl = words / sentences; // average sentence length
  const asw = syllables / words; // average syllables per word
  const score = 206.835 - 1.015 * asl - 84.6 * asw;
  // Clamp 0..100 for UI
  return Math.max(0, Math.min(100, score));
}
