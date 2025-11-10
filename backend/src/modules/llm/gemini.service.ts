import { env } from "../../config/env";

export interface GenerateOptions {
  timeoutMs?: number;
  modelName?: string;
}

function isRetryableError(err: any): boolean {
  const msg: string = String(err?.message || "").toLowerCase();
  return (
    msg.includes("503") ||
    msg.includes("overloaded") ||
    msg.includes("unavailable") ||
    msg.includes("timeout") ||
    msg.includes("rate") ||
    msg.includes("429") ||
    msg.includes("temporarily")
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getClient() {
  if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set on backend");
  const mod = await import("@google/generative-ai");
  const { GoogleGenerativeAI } = mod as any;
  return new GoogleGenerativeAI(env.GEMINI_API_KEY);
}

export async function generateGemini(
  prompt: string,
  params: { temperature: number; topP: number; topK: number; maxOutputTokens: number },
  options?: GenerateOptions
): Promise<string> {
  const client = await getClient();
  const model = client.getGenerativeModel({ model: options?.modelName || env.MODEL_NAME });

  const timeoutMs = options?.timeoutMs ?? env.REQUEST_TIMEOUT_MS;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  const attempt = async () => {
    const result = await model.generateContent(
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: params.temperature,
          topP: params.topP,
          topK: params.topK,
          maxOutputTokens: params.maxOutputTokens,
        },
      },
      { signal: controller.signal }
    );
    return result.response.text() ?? "";
  };

  try {
    let delay = 500;
    const maxAttempts = 5;
    for (let i = 1; i <= maxAttempts; i++) {
      try {
        return await attempt();
      } catch (err: any) {
        if (i >= maxAttempts || !isRetryableError(err)) throw err;
        const jitter = Math.floor(Math.random() * 250);
        await sleep(delay + jitter);
        delay = Math.min(delay * 2, 4000);
      }
    }
    return "";
  } finally {
    clearTimeout(t);
  }
}
