# 🎉 Birthday Missions

A birthday scavenger-hunt/challenge game: 27 missions tagged **Easy Mode**,
**Explorer**, **Challenge**, **Chaos**, and **Final Boss**. Players create an
account, submit a photo or video as proof for each mission, earn points, and
compete on a live leaderboard.

## Stack

Self-contained Node.js app, no external services required:

- **Backend:** Express + better-sqlite3 (file-based SQL database, `data.sqlite`)
- **Auth:** Real accounts with hashed passwords (bcryptjs) + server-side sessions
- **Uploads:** Multer stores proof photos/videos on disk under `public/uploads/`
- **Frontend:** Plain HTML/CSS/JS (no build step)

## Getting started

```bash
npm install
npm start
```

Then open http://localhost:3000, register an account, and start completing missions.

The server listens on `PORT` (default `3000`). The SQLite database file and
session secret are created automatically on first run.

## How it works

- Missions are seeded from `server/data/missions.js` (27 missions, points
  scale with tag difficulty: Easy Mode 5pts → Explorer 10pts → Challenge
  15pts → Chaos 20pts → Final Boss 40pts).
- Each player can submit **one** proof per mission (image or video, up to
  100MB). Submitting immediately awards points.
- `/api/leaderboard` ranks players by total points earned.

## Editing the missions

Update the `raw` array in `server/data/missions.js` — the app re-seeds the
missions table (upsert by mission number) on every server start, so you can
freely rename/re-tag/re-point missions and just restart the server.

## Deploying

Because everything (database + file storage) is local to the container/disk,
this app deploys as-is to any Node host with persistent disk (Render,
Railway, Fly.io, a VPS). Set the `SESSION_SECRET` environment variable in
production so sessions survive restarts/redeploys.
