import { Router } from "express";
import {
  generateAndPersistLab,
  getLab,
  getLabsList,
  deleteLab,
  saveLab,
} from "./labs.controller";

export const labsRouter = Router();

labsRouter.post("/generate", generateAndPersistLab);
labsRouter.post("/", saveLab);
labsRouter.get("/", getLabsList);
labsRouter.get("/:id", getLab);
labsRouter.delete("/:id", deleteLab);
