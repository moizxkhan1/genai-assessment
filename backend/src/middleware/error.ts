import type { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = typeof err?.status === "number" ? err.status : 500;
  const message =
    typeof err?.message === "string" ? err.message : "Internal Server Error";
  logger.error("http:error", {
    requestId: (_req as any)?.requestId,
    status,
    error: message,
    stack: typeof err?.stack === "string" ? err.stack : undefined,
  });
  res.status(status).json({ error: message });
}
