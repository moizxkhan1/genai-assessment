import util from "node:util";
import { env } from "../config/env";

type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

const LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 50,
};

const level: LogLevel = (env.LOG_LEVEL || "info") as LogLevel;
const threshold = LEVELS[level] ?? LEVELS.info;
const isPretty = Boolean(env.LOG_PRETTY);

function fmtMessage(
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>
) {
  const base = {
    ts: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  if (isPretty) {
    const { ts, level: lvl, message: msg, ...rest } = base as any;
    const time = new Date(ts).toLocaleTimeString();
    const metaStr = Object.keys(rest).length
      ? " " + util.inspect(rest, { depth: 5, colors: true })
      : "";
    return `[${time}] ${lvl.toUpperCase()} ${msg}${metaStr}`;
  }
  return JSON.stringify(base);
}

function logAt(lvl: LogLevel, message: string, meta?: Record<string, unknown>) {
  if ((LEVELS[lvl] ?? 100) < threshold) return;
  const line = fmtMessage(lvl, message, meta);
  if (lvl === "error") {
    // eslint-disable-next-line no-console
    console.error(line);
  } else if (lvl === "warn") {
    // eslint-disable-next-line no-console
    console.warn(line);
  } else {
    // eslint-disable-next-line no-console
    console.log(line);
  }
}

export const logger = {
  level,
  debug: (msg: string, meta?: Record<string, unknown>) =>
    logAt("debug", msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) =>
    logAt("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) =>
    logAt("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) =>
    logAt("error", msg, meta),
};
