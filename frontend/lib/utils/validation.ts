import { z } from "zod";

export const GenerationParametersSchema = z.object({
  temperature: z.number().min(0).max(2),
  topP: z.number().min(0).max(1),
  topK: z.number().int().min(1).max(100),
  maxOutputTokens: z.number().int().min(100).max(2000),
});

export const GenerateRequestSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt is required"),
  count: z.number().int().min(2).max(4),
  parameters: z.array(GenerationParametersSchema).min(1),
});

export type GenerationParameters = z.infer<typeof GenerationParametersSchema>;
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

export function validateGenerateRequest(input: unknown): GenerateRequest {
  return GenerateRequestSchema.parse(input);
}
