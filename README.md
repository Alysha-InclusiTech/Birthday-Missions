# 🎉 Birthday Missions

A birthday scavenger-hunt/challenge game: 27 missions tagged **Easy Mode**,
**Explorer**, **Challenge**, **Chaos**, and **Final Boss**. Players create an
account, submit a photo or video as proof for each mission, earn points, and
compete on a live leaderboard.

## Stack

Built to run on Vercel, which has no persistent disk — so storage lives in
managed services instead of local files:

- **Backend:** Express, deployed as a single Vercel serverless function (`api/index.js`)
- **Database:** Postgres via [Neon](https://neon.tech) (`@neondatabase/serverless`) — connect it through Vercel's **Storage** tab
- **Auth:** Real accounts with hashed passwords (bcryptjs) + signed JWT cookies (stateless, so it works across serverless invocations)
- **Uploads:** [Vercel Blob](https://vercel.com/docs/vercel-blob) — the browser uploads photos/videos directly to Blob storage, bypassing the serverless function's request-size limit
- **Frontend:** Plain HTML/CSS/JS (no framework). A tiny esbuild step bundles the Blob upload client into a plain `<script>` global.

Requires **Node.js 20+**.

## One-time setup on Vercel

1. Import this GitHub repo into a new Vercel project.
2. Go to the project's **Storage** tab → **Create Database** → choose **Postgres** (this provisions a Neon database and wires up connection env vars automatically, usually `DATABASE_URL`).
3. Still in **Storage** → **Create Database** → choose **Blob** → connect it to the project (this sets `BLOB_READ_WRITE_TOKEN` automatically).
4. Go to **Settings → Environment Variables** and add:
   - `SESSION_SECRET` — any long random string (used to sign login tokens).
5. Deploy. Vercel runs `npm run build` (bundles the Blob client) automatically per `vercel.json`, then deploys `api/index.js` as the backend and serves `public/` as static files.
6. Open the deployed URL, register an account, and start completing missions.

No manual database migration step is needed — the app creates its tables and
seeds the 27 missions automatically on first request after each deploy.

## Local development

Local dev talks to the same real Postgres + Blob resources as production
(there's no local emulator for either), so pull the project's env vars first:

```bash
npm install
npm run build          # bundles the Blob upload client into public/vendor/
npx vercel link        # link this folder to your Vercel project (one-time)
npx vercel env pull .env.local
export $(cat .env.local | xargs)   # or use a tool like `dotenv-cli`
npm start
```

Then open http://localhost:3000.

## How it works

- Missions are seeded from `server/data/missions.js` (27 missions, points
  scale with tag difficulty: Easy Mode 5pts → Explorer 10pts → Challenge
  15pts → Chaos 20pts → Final Boss 40pts).
- Each player can submit **one** proof per mission (image or video, up to
  100MB — uploaded directly from the browser to Blob storage). Submitting
  immediately awards points.
- `/api/leaderboard` ranks players by total points earned.

## Editing the missions

Update the `raw` array in `server/data/missions.js` — the app re-seeds the
missions table (upsert by mission number) on every cold start, so you can
freely rename/re-tag/re-point missions and just redeploy.

## Architecture notes

- `server/app.js` holds the actual Express app (routes, middleware) with no
  `listen()` call. `server/index.js` is the local-dev entry point that calls
  `listen()`; `api/index.js` is the Vercel entry point that just exports the
  app for the platform to invoke per-request. `vercel.json` rewrites all
  `/api/*` requests to that one function.
- Sessions are stateless signed cookies (JWT), not server-side session
  storage — necessary because serverless function instances don't share
  memory between invocations.
- Large file uploads go straight from the browser to Vercel Blob using a
  short-lived upload token (`POST /api/missions/upload-token`); the app
  server never sees the file bytes, only the resulting URL.
