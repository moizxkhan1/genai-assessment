function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  let count = 0;
  const vowels = /[aeiouy]/g;
  const matches = w.match(vowels);
  if (matches) count = matches.length;
  if (w.endsWith("e")) count--;
  return Math.max(1, count);
}

export function calculateFleschScore(text: string): number {
  const sentences = (text.match(/[.!?]+/g) || []).length || 1;
  const words = (text.match(/\b\w+\b/g) || []).length || 1;
  const tokens = (text.match(/\b\w+\b/g) || []).map((t) => t);
  const syllables = tokens.reduce((acc, w) => acc + countSyllables(w), 0) || 1;

  const asl = words / sentences;
  const asw = syllables / words;
  const score = 206.835 - 1.015 * asl - 84.6 * asw;
  return Math.max(0, Math.min(100, score));
}
