import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  GEMINI_API_KEY: z.string().optional(),
  MODEL_NAME: z.string().default("gemini-2.0-flash"),
  CORS_ORIGIN: z.string().optional(),
  FRONTEND_URL: z.string().url().optional(),
  CORS_ALLOW_ALL: z
    .union([z.string().transform((v) => v === "true"), z.boolean()])
    .optional(),
  REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().optional(),
  MONGO_URI: z.string().url().optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error", "silent"]).optional(),
  LOG_PRETTY: z
    .union([z.string().transform((v) => v === "true"), z.boolean()])
    .optional(),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten());
  throw new Error("Invalid environment variables");
}

const raw = parsed.data;

const defaultOrigins = "http://localhost:3000,http://localhost:3001";
const parsedOrigins = (raw.CORS_ORIGIN || defaultOrigins)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const combinedOrigins = Array.from(
  new Set([
    ...parsedOrigins,
    ...(raw.FRONTEND_URL ? [raw.FRONTEND_URL] : []),
  ])
);

export const env = {
  PORT: raw.PORT ?? 4000,
  GEMINI_API_KEY: raw.GEMINI_API_KEY,
  MODEL_NAME: raw.MODEL_NAME || "gemini-2.0-flash",
  REQUEST_TIMEOUT_MS: raw.REQUEST_TIMEOUT_MS ?? 90_000,
  CORS_ORIGINS: combinedOrigins,
  CORS_ALLOW_ALL: Boolean(raw.CORS_ALLOW_ALL),
  MONGO_URI: raw.MONGO_URI,
  LOG_LEVEL: raw.LOG_LEVEL || "info",
  LOG_PRETTY: Boolean(raw.LOG_PRETTY),
} as const;
