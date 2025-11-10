import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";
import { logger } from "../lib/logger";

declare global {
  // eslint-disable-next-line no-var
  var __request_counter: number | undefined;
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const id = randomUUID();
  const start = Date.now();
  (req as any).requestId = id;
  const { method, originalUrl } = req;
  logger.info("req:start", { requestId: id, method, path: originalUrl });
  res.on("finish", () => {
    const durationMs = Date.now() - start;
    logger.info("req:finish", {
      requestId: id,
      method,
      path: originalUrl,
      status: res.statusCode,
      durationMs,
    });
  });
  next();
}
