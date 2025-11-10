"use server";
import { validateGenerateRequest } from "@/lib/utils/validation";
import { evaluateResponse } from "@/lib/services/metrics/metric-service";
import type {
  GenerationParameters,
  GenerationResult,
} from "@/lib/types/llm";

export interface ActionResult {
  ok: boolean;
  results?: GenerationResult[];
  labId?: string;
  error?: string;
}

function getFriendlyError(
  status: number | undefined,
  rawMessage: string | undefined,
  retryAfter?: string | null
): string {
  const msg = (rawMessage || "").toLowerCase();
  if (status === 429 || /\brate\b|quota|too many|429|exceed/.test(msg)) {
    const ra = retryAfter && /^\d+$/.test(retryAfter) ? ` ${retryAfter}s` : "";
    return `Rate limit reached. Please wait${ra ? " about" + ra : " a bit"} and try again.`;
  }
  if (status === 503 || /unavailable|overload|busy|temporar/.test(msg)) {
    return "Service is temporarily unavailable. Please try again shortly.";
  }
  if (status === 502 || status === 504 || /timeout|timed out|upstream/.test(msg)) {
    return "The model service is busy or timed out. Please retry or reduce the response length.";
  }
  if (status === 400) {
    return rawMessage ? `Invalid request: ${rawMessage}` : "Invalid request. Please check your inputs.";
  }
  if (status === 401 || status === 403 || /api key|unauthoriz|forbidden/.test(msg)) {
    return "Authentication failed on the backend. Please contact the maintainer.";
  }
  if (/gemini_api_key|mongo|database/.test(msg)) {
    return "Server configuration issue detected. Please try again later or contact the maintainer.";
  }
  if (status && status >= 500) {
    return "Unexpected server error. Please try again shortly.";
  }
  return rawMessage || "Request failed. Please try again.";
}

export async function generateResponsesAction(
  _: unknown,
  formData: FormData
): Promise<ActionResult> {
  try {
    const prompt = String(formData.get("prompt") || "").trim();
    const count = Number(formData.get("count") || 2);
    const parametersField = formData.get("parameters");
    let parameters: GenerationParameters[] | undefined;
    if (parametersField) {
      try {
        const parsed = JSON.parse(String(parametersField));
        if (Array.isArray(parsed))
          parameters = parsed as GenerationParameters[];
      } catch (_) {}
    }
    if (!parameters || !parameters.length) {
      const temperature = Number(formData.get("temperature") || 0.7);
      const topP = Number(formData.get("topP") || 0.9);
      const topK = Number(formData.get("topK") || 40);
      const maxOutputTokens = Number(formData.get("maxOutputTokens") || 2000);
      const params: GenerationParameters = {
        temperature,
        topP,
        topK,
        maxOutputTokens,
      };
      parameters = Array.from({ length: count }, () => params);
    }

    if (parameters.length > count) parameters = parameters.slice(0, count);
    if (parameters.length < count) {
      const seed = parameters[parameters.length - 1] || parameters[0];
      parameters = parameters.concat(
        Array.from({ length: count - parameters.length }, () => seed)
      );
    }

    const input = { prompt, count, parameters };
    validateGenerateRequest(input);

    const baseUrl = process.env.BACKEND_URL || "http://localhost:4000";
    // Client-side timeout to improve feedback on long/blocked requests
    const timeoutMs = Number(process.env.REQUEST_TIMEOUT_MS || 65000);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const resp = await fetch(`${baseUrl}/api/v1/labs/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, parameters }),
      // Keep same timeout expectation at infra level
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!resp.ok) {
      let err: any = {};
      try {
        err = await resp.json();
      } catch {
        try {
          const text = await resp.text();
          err = { error: text };
        } catch {}
      }
      const friendly = getFriendlyError(
        resp.status,
        typeof err?.error === "string" ? err.error : undefined,
        resp.headers.get("retry-after")
      );
      throw new Error(friendly);
    }
    const data = (await resp.json()) as { labId?: string; results: { response: string; metrics?: { vocabularyDiversity: number; readability: number; wordCount: number; sentiment: number } }[] };
    const now = Date.now();
    const responses: GenerationResult[] = (data.results || []).map((r, idx) => {
      const text = r.response || "";
      const metrics = r.metrics ?? evaluateResponse(text);
      return {
        id: `${now}-${idx}`,
        parameters: parameters[idx],
        response: text,
        metrics,
        generatedAt: new Date(),
      };
    });

    return { ok: true, labId: data.labId, results: responses };
  } catch (err: unknown) {
    const e = err as any;
    // AbortError indicates our client-side timeout fired
    if (e?.name === "AbortError") {
      const secs = Math.round(Number(process.env.REQUEST_TIMEOUT_MS || 65000) / 1000);
      return { ok: false, error: `Request timed out after ${secs}s. Please try again.` };
    }
    // Network-level errors
    if (
      typeof e?.message === "string" &&
      (/fetch failed|network|failed to fetch|econnrefused|enotfound/i.test(e.message) || /code\s*:\s*(ECONNREFUSED|ENOTFOUND)/i.test(String(e?.cause)))
    ) {
      return {
        ok: false,
        error: `Network error contacting backend at ${process.env.BACKEND_URL || "http://localhost:4000"}. Ensure the API is running and reachable.`,
      };
    }
    const message = err instanceof Error ? err.message : "Failed to generate responses";
    return { ok: false, error: message };
  }
}
