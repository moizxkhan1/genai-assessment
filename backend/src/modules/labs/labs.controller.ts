import type { Request, Response } from "express";
import { GenerateRequestSchema } from "../llm/dto";
import { generateGemini } from "../llm/gemini.service";
import { env } from "../../config/env";
import { evaluateResponse } from "../metrics/metric-service";
import { createLab, getLabById, listLabs } from "./labs.repo";
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
          // When noUncheckedIndexedAccess is enabled, guard against undefined
          active--;
          next();
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

export async function generateAndPersistLab(req: Request, res: Response) {
  const parsed = GenerateRequestSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.message });
  const { prompt, parameters } = parsed.data;

  const start = Date.now();
  try {
    logger.info("labs:generate:start", {
      requestId: (req as any).requestId,
      promptLen: prompt.length,
      variants: parameters.length,
      timeoutMs: env.REQUEST_TIMEOUT_MS,
    });
    const tasks = parameters.map(
      (p) => () =>
        generateGemini(prompt, p, { timeoutMs: env.REQUEST_TIMEOUT_MS })
    );
    const texts = await runPool(tasks, 2);
    const results = texts.map((t) => ({
      response: t,
      metrics: evaluateResponse(t),
    }));
    const emptyCount = results.filter((r) => !r.response).length;
    logger.info("labs:generate:done", {
      requestId: (req as any).requestId,
      durationMs: Date.now() - start,
      results: results.length,
      emptyResponses: emptyCount,
      lengths: results.map((r) => r.response.length),
    });
    const lab = await createLab({
      prompt,
      model: env.MODEL_NAME,
      parameters,
      results,
      createdAt: new Date(),
      durationMs: Date.now() - start,
    });
    return res.json({ labId: String(lab._id), results });
  } catch (err: any) {
    const message =
      typeof err?.message === "string" ? err.message : "Generation failed";
    logger.error("labs:generate:error", {
      requestId: (req as any).requestId,
      error: message,
    });
    return res.status(502).json({ error: message });
  }
}

export async function getLabsList(_req: Request, res: Response) {
  try {
    const items = await listLabs();
    return res.json({ items });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to list labs" });
  }
}

export async function getLab(req: Request, res: Response) {
  try {
    const id = req.params?.id;
    if (!id) return res.status(400).json({ error: "Missing id parameter" });
    const lab = await getLabById(id);
    if (!lab) return res.status(404).json({ error: "Not found" });
    return res.json(lab);
  } catch (err: any) {
    return res.status(400).json({ error: "Invalid id" });
  }
}
