import type { GenerationParameters, GenerationResult } from "@/lib/types/llm";

export type { GenerationParameters, GenerationResult };

export interface GenerateFormState {
  prompt: string;
  count: number;
  parameters: GenerationParameters;
}
