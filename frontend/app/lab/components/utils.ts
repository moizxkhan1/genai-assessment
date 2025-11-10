import type { GenerationResult } from "@/lib/types/llm";

export type SentimentCategory = "Negative" | "Neutral" | "Positive";

export function sentimentToCategory(score: number): SentimentCategory {
  if (score <= -0.1) return "Negative";
  if (score >= 0.1) return "Positive";
  return "Neutral";
}

export function sentimentCategoryToScore(cat: SentimentCategory): number {
  switch (cat) {
    case "Negative":
      return 0;
    case "Neutral":
      return 50;
    case "Positive":
      return 100;
  }
}

export function buildChartData(results: GenerationResult[]) {
  const round1 = (n: number) => Math.round(n * 10) / 10;
  return results.map((r, i) => ({
    name: `Response ${i + 1}`,
    TTR: round1(r.metrics.vocabularyDiversity),
    Readability: round1(r.metrics.readability),
    Sentiment: sentimentCategoryToScore(sentimentToCategory(r.metrics.sentiment)),
  }));
}
