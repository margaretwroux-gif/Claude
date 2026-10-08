import "server-only";
import { neon } from "@neondatabase/serverless";

type Row = Record<string, unknown>;
type Runner = (text: string, params: unknown[]) => Promise<Row[]>;

let runner: Runner | undefined;

function isLocal(url: string) {
  const host = new URL(url).hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

async function getRunner(): Promise<Runner> {
  if (runner) return runner;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. See .env.example.");

  if (isLocal(url)) {
    // Neon's HTTP driver can't talk to a plain local Postgres, so fall back to `pg` in dev.
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 5 });
    runner = async (text, params) => (await pool.query(text, params)).rows;
  } else {
    const sql = neon(url);
    runner = (text, params) => sql.query(text, params) as Promise<Row[]>;
  }
  return runner;
}

/** Run a parameterised query ($1, $2, ...) and return the rows. */
export async function query<T = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  const run = await getRunner();
  return (await run(text, params)) as T[];
}
