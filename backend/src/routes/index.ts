import { Router } from "express";
import { generateHandler } from "../modules/llm/llm.controller";
import { labsRouter } from "../modules/labs/labs.router";

export const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true }));
router.post("/api/v1/llm/generate", generateHandler);
router.use("/api/v1/labs", labsRouter);
