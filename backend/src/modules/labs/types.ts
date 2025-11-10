import type { GenerationParameters } from "../llm/dto";
import type { Metrics } from "../metrics/types";

export interface LabResult {
  response: string;
  metrics: Metrics;
}

export interface LabDoc {
  _id?: any;
  prompt: string;
  model: string;
  parameters: GenerationParameters[];
  results: LabResult[];
  createdAt: Date;
  durationMs: number;
}
