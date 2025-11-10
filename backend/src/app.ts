import express from "express";
import cors from "cors";
import { router } from "./routes";
import { errorHandler } from "./middleware/error";
import { env } from "./config/env";
import { requestLogger } from "./middleware/request-logger";

export function createApp() {
  const app = express();
  app.use(express.json({ limit: "5mb" }));
  app.use(requestLogger);
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (env.CORS_ORIGINS.includes(origin)) return cb(null, true);
        return cb(null, false);
      },
      credentials: false,
    })
  );
  app.use(router);
  app.use(errorHandler);
  return app;
}
