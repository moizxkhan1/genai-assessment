import type { Metrics } from "@/lib/services/metrics/types";

export interface GenerationParameters {
  temperature: number;
  topP: number;
  topK: number;
  maxOutputTokens: number;
}

export interface GenerationResult {
  id: string;
  parameters: GenerationParameters;
  response: string;
  metrics: Metrics;
  generatedAt: Date;
}
