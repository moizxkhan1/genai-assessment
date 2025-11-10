import { MongoClient, Db, Document } from "mongodb";
import { env } from "../config/env";
import { logger } from "../lib/logger";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongo(): Promise<Db | null> {
  const uri = env.MONGO_URI;
  if (!uri) {
    logger.warn("mongo:skipped", { reason: "MONGO_URI not set" });
    return null;
  }
  if (db) return db;
  client = new MongoClient(uri);
  logger.info("mongo:connecting");
  await client.connect();
  const dbName = new URL(uri).pathname.replace(/^\//, "") || "genai";
  db = client.db(dbName);
  logger.info("mongo:connected", { dbName });
  return db;
}

export function getDb(): Db {
  if (!db) throw new Error("MongoDB not connected. Call connectMongo() first.");
  return db;
}

export function getCollection<T extends Document = Document>(name: string) {
  logger.debug("mongo:collection", { name });
  return getDb().collection<T>(name);
}
