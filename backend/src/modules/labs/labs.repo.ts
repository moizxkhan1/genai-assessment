import { ObjectId } from "mongodb";
import { getCollection } from "../../db/mongo";
import type { LabDoc } from "./types";

const COLLECTION = "labs";

export async function createLab(doc: LabDoc) {
  const col = getCollection<LabDoc>(COLLECTION);
  const res = await col.insertOne({ ...doc });
  return { ...doc, _id: res.insertedId };
}

export async function getLabById(id: string) {
  const col = getCollection<LabDoc>(COLLECTION);
  return await col.findOne({ _id: new ObjectId(id) });
}

export async function listLabs(limit = 20) {
  const col = getCollection<LabDoc>(COLLECTION);
  const cursor = col
    .find({}, { projection: { prompt: 1, createdAt: 1, results: 1 } })
    .sort({ createdAt: -1 })
    .limit(limit);
  const items = await cursor.toArray();
  return items.map((i) => ({
    id: String(i._id),
    promptPreview: (i.prompt || "").slice(0, 80),
    createdAt: i.createdAt,
    count: i.results?.length || 0,
  }));
}
