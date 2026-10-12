import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDatabase = globalThis as unknown as {
  postgresClient?: ReturnType<typeof postgres>;
};

export function getDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");

  const client = globalForDatabase.postgresClient ?? postgres(url, { max: 10 });
  if (process.env.NODE_ENV !== "production") globalForDatabase.postgresClient = client;

  return drizzle(client, { schema });
}