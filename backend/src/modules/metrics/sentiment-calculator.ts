import natural from "natural";

const Analyzer = (natural as any).SentimentAnalyzer as new (
  lang: string,
  stemmer: any,
  vocabulary: string
) => { getSentiment: (tokens: string[]) => number };
const stemmer = (natural as any).PorterStemmer;
const analyzer = new Analyzer("English", stemmer, "afinn");

export function calculateSentiment(text: string): number {
  const tokens = (text.match(/\b\w+\b/g) || []).map((t) => t.toLowerCase());
  if (tokens.length === 0) return 0;
  return analyzer.getSentiment(tokens);
}
