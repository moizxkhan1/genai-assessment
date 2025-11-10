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
  error?: string;
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
    const resp = await fetch(`${baseUrl}/api/v1/llm/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, parameters }),
      // Keep same timeout expectation at infra level
      cache: "no-store",
    });
    if (!resp.ok) {
      const err = (await resp.json().catch(() => ({}))) as any;
      throw new Error(err?.error || `Backend error (${resp.status})`);
    }
    const data = (await resp.json()) as { results: { text: string }[] };
    const now = Date.now();
    const responses: GenerationResult[] = (data.results || []).map((r, idx) => {
      const metrics = evaluateResponse(r.text || "");
      return {
        id: `${now}-${idx}`,
        parameters: parameters[idx],
        response: r.text || "",
        metrics,
        generatedAt: new Date(),
      };
    });

    return { ok: true, results: responses };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to generate responses";
    return { ok: false, error: message };
  }
}
