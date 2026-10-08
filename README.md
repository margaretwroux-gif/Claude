# Productivity Dashboard

A personal productivity dashboard built with **Next.js 14 (App Router)**, **Tailwind CSS** and **Neon Postgres**, designed to deploy on **Vercel**.

- **Overview** – today's tasks, habit check-ins, focus minutes for the week and a quick-note box, with headline stats.
- **Tasks** – add tasks with priority and due date, complete them, filter open/completed/all, overdue highlighting.
- **Habits** – daily habits with a 7-day check-in grid (back-fill past days) and current streaks.
- **Focus** – Pomodoro timer (focus / short / long break, custom length); finished focus sessions are logged to the database, with a 14-day chart and history.
- **Notes** – create, edit, pin and delete notes.

All reads happen in React Server Components and all writes are Server Actions — there is no separate API layer.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 14 App Router, React 18, TypeScript |
| Styling | Tailwind CSS (light + dark via `prefers-color-scheme`) |
| Database | Neon Postgres via `@neondatabase/serverless` (HTTP driver; ideal for serverless functions) |
| Local DB | Any Postgres on `localhost` — `lib/db.ts` switches to `pg` automatically |
| Auth | Optional HTTP Basic Auth via `middleware.ts` (`DASHBOARD_PASSWORD`) |

## Environment variables

See `.env.example`.

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | yes | Postgres connection string. The Vercel ↔ Neon integration sets this for you. |
| `APP_TIMEZONE` | recommended | IANA timezone (e.g. `Europe/London`) that defines "today". Defaults to `UTC`, which is what Vercel servers run in. |
| `DASHBOARD_PASSWORD` | recommended in production | If set, the site requires this password (any username). Without it, anyone with the URL can see and edit your data. |

## Run locally

```bash
npm install
cp .env.example .env.local        # then fill in DATABASE_URL
npm run db:migrate                # creates the tables (idempotent)
npm run dev                       # http://localhost:3000
```

`DATABASE_URL` can point at a Neon database or at a local Postgres
(`postgresql://postgres:postgres@localhost:5432/dashboard`).

## Deploy to Vercel + Neon

1. Push this repo to GitHub and **import it in Vercel** (framework preset: Next.js — no extra config needed).
2. In the Vercel project, open **Storage → Create Database → Neon** (or connect an existing Neon project). This adds `DATABASE_URL` to the project's environment variables.
3. Add `APP_TIMEZONE` and `DASHBOARD_PASSWORD` under **Settings → Environment Variables**.
4. Create the tables once against the Neon database:
   ```bash
   vercel env pull .env.local     # or paste the Neon connection string into .env.local
   npm run db:migrate
   ```
5. Redeploy. Re-run `npm run db:migrate` whenever `db/schema.sql` changes — it only uses `CREATE … IF NOT EXISTS`.

## Project layout

```
app/
  actions.ts          Server Actions (all writes)
  page.tsx            Overview
  tasks/ habits/ focus/ notes/
  error.tsx loading.tsx
components/           UI pieces (task list, habit row, focus timer, chart, …)
lib/
  db.ts               query() helper — Neon HTTP driver in prod, pg for localhost
  data.ts             read queries
  time.ts             timezone-aware day helpers
db/schema.sql         schema
scripts/migrate.mjs   applies the schema
middleware.ts         optional Basic Auth
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run db:migrate` | Apply `db/schema.sql` to `DATABASE_URL` |
