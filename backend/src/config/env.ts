import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  GEMINI_API_KEY: z.string().optional(),
  MODEL_NAME: z.string().default("gemini-2.0-flash"),
  CORS_ORIGIN: z.string().optional(),
  REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().optional(),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten());
  throw new Error("Invalid environment variables");
}

const raw = parsed.data;

export const env = {
  PORT: raw.PORT ?? 4000,
  GEMINI_API_KEY: raw.GEMINI_API_KEY,
  MODEL_NAME: raw.MODEL_NAME || "gemini-2.0-flash",
  REQUEST_TIMEOUT_MS: raw.REQUEST_TIMEOUT_MS ?? 90_000,
  CORS_ORIGINS: (
    raw.CORS_ORIGIN || "http://localhost:3000,http://localhost:3001"
  )
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
} as const;
