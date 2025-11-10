import type { Request, Response } from "express";
import { GenerateRequestSchema } from "./dto";
import { generateGemini } from "./gemini.service";
import { env } from "../../config/env";
import { logger } from "../../lib/logger";

async function runPool<T>(
  tasks: Array<() => Promise<T>>,
  concurrency = 2
): Promise<T[]> {
  const results: T[] = [];
  let i = 0;
  let active = 0;
  return await new Promise((resolve, reject) => {
    const next = () => {
      if (i >= tasks.length && active === 0) return resolve(results);
      while (active < concurrency && i < tasks.length) {
        const idx = i++;
        active++;
        const task = tasks[idx];
        if (!task) {
          // Should not happen with the given bounds, but satisfies strict indexing
          active--;
          continue;
        }
        task()
          .then((r) => {
            results[idx] = r;
          })
          .catch(reject)
          .finally(() => {
            active--;
            next();
          });
      }
    };
    next();
  });
}

export async function generateHandler(req: Request, res: Response) {
  const parsed = GenerateRequestSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.message });
  const { prompt, parameters } = parsed.data;

  try {
    logger.info("llm:generate:start", {
      requestId: (req as any).requestId,
      promptLen: prompt.length,
      variants: parameters.length,
    });
    const tasks = parameters.map(
      (p) => () =>
        generateGemini(prompt, p, { timeoutMs: env.REQUEST_TIMEOUT_MS })
    );
    const texts = await runPool(tasks, 2);
    const results = texts.map((text) => ({ text }));
    logger.info("llm:generate:done", {
      requestId: (req as any).requestId,
      results: results.length,
      lengths: results.map((r) => r.text.length),
    });
    return res.json({ results });
  } catch (err: any) {
    const message =
      typeof err?.message === "string" ? err.message : "Generation failed";
    logger.error("llm:generate:error", {
      requestId: (req as any).requestId,
      error: message,
    });
    return res.status(502).json({ error: message });
  }
}
