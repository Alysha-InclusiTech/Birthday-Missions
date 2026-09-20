const { neon } = require('@neondatabase/serverless');
const { missions } = require('./data/missions');

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error(
    'Missing DATABASE_URL (or POSTGRES_URL). Connect a Postgres database to this project in the Vercel Storage tab, or set it locally via `vercel env pull`.'
  );
}

const sql = neon(connectionString);

let initPromise = null;

// Runs once per warm serverless instance (idempotent), so every request
// after a cold start is a normal fast query with no extra setup cost.
function ensureInitialized() {
  if (!initPromise) {
    initPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS missions (
          id SERIAL PRIMARY KEY,
          number INTEGER UNIQUE NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          tag TEXT NOT NULL,
          points INTEGER NOT NULL
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS submissions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          mission_id INTEGER NOT NULL REFERENCES missions(id),
          file_url TEXT NOT NULL,
          media_type TEXT NOT NULL,
          submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE(user_id, mission_id)
        )
      `;

      for (const m of missions) {
        await sql`
          INSERT INTO missions (number, title, description, tag, points)
          VALUES (${m.number}, ${m.title}, ${m.description}, ${m.tag}, ${m.points})
          ON CONFLICT (number) DO UPDATE SET
            title = excluded.title,
            description = excluded.description,
            tag = excluded.tag,
            points = excluded.points
        `;
      }
    })();
  }
  return initPromise;
}

module.exports = { sql, ensureInitialized };
