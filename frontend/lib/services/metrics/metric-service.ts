import { calculateTTR } from "./ttr-calculator";
import { calculateFleschScore } from "./readability-calculator";
import { calculateSentiment } from "./sentiment-calculator";
import type { Metrics } from "./types";

export function countWords(text: string): number {
  return (text.match(/\b\w+\b/g) || []).length;
}

export function evaluateResponse(text: string): Metrics {
  return {
    vocabularyDiversity: calculateTTR(text),
    readability: calculateFleschScore(text),
    wordCount: countWords(text),
    sentiment: calculateSentiment(text),
  };
}
