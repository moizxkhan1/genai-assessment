import type { Request, Response } from "express";
import { GenerateRequestSchema } from "./dto";
import { generateGemini } from "./gemini.service";
import { env } from "../../config/env";

async function runPool<T>(tasks: Array<() => Promise<T>>, concurrency = 2): Promise<T[]> {
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
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
  const { prompt, parameters } = parsed.data;

  try {
    const tasks = parameters.map((p) => () =>
      generateGemini(prompt, p, { timeoutMs: env.REQUEST_TIMEOUT_MS })
    );
    const texts = await runPool(tasks, 2);
    return res.json({ results: texts.map((text) => ({ text })) });
  } catch (err: any) {
    const message = typeof err?.message === "string" ? err.message : "Generation failed";
    return res.status(502).json({ error: message });
  }
}
