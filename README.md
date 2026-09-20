# 🎉 Birthday Missions

A birthday scavenger-hunt/challenge game: 27 missions tagged **Easy Mode**,
**Explorer**, **Challenge**, **Chaos**, and **Final Boss**. Players create an
account, submit a photo or video as proof for each mission, earn points, and
compete on a live leaderboard.

## Stack

Self-contained Node.js app, no external services required:

- **Backend:** Express + better-sqlite3 (file-based SQL database, `data.sqlite`)
- **Auth:** Real accounts with hashed passwords (bcryptjs) + server-side sessions
- **Uploads:** Multer stores proof photos/videos on disk under `uploads/`
- **Frontend:** Plain HTML/CSS/JS (no build step)

Requires **Node.js 22+** (needed by better-sqlite3).

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

Because the database and uploaded proofs are local files, this app needs a
host with **persistent disk** — not a serverless/static host like Vercel or
GitHub Pages. Any of these work well:

| Platform | Why | Persistent storage |
|---|---|---|
| **Railway** (easiest) | Deploy straight from GitHub, no CLI needed | Attach a Volume in the dashboard |
| **Render** | Similar to Railway, generous free web tier (disk requires a paid instance) | Add a Disk in the dashboard |
| **Fly.io** | More control, CLI-based | `fly volumes create` |
| Any VPS | Full control, run it with `pm2`/`systemd` | Just a regular directory |

### Environment variables to set in production

- `SESSION_SECRET` — any long random string, so logins survive restarts/redeploys.
- `DATA_DIR` — an absolute path to your persistent volume's mount point (e.g. `/data`). The SQLite database and uploaded photos/videos are stored under this path. If unset, it defaults to the project folder, which is fine for a VPS but gets wiped on redeploy on platforms like Railway/Render unless a volume is mounted there.
- `PORT` — most platforms set this for you automatically.

### Railway walkthrough (recommended — no CLI required)

1. Go to [railway.app](https://railway.app) and sign up (GitHub login is easiest).
2. **New Project → Deploy from GitHub repo** → select `Alysha-InclusiTech/Birthday-Missions`.
3. Railway auto-detects Node and runs `npm install` + `npm start` — no config needed.
4. Open the service's **Settings → Volumes** tab, click **New Volume**, and set the mount path to `/data`.
5. Go to **Variables** and add:
   - `DATA_DIR` = `/data`
   - `SESSION_SECRET` = (generate any random string)
6. Under **Settings → Networking**, click **Generate Domain** to get a public `https://your-app.up.railway.app` URL guests can open on their phones.
7. Redeploy (Railway usually does this automatically after you save variables/volumes).

That's it — the missions board is now live at that URL for anyone with the link.
