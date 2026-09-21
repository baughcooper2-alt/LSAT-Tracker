# LSAT Tracker

A single-file study tracker for LSAT prep: daily schedule and minutes, a wrong-answer
journal, section and practice-test scores, and miss-pattern analysis — split by
Logical Reasoning and Reading Comprehension.

Built to replace a spreadsheet, so everything is one HTML file with no build step.

## Tabs

| Tab | What it does |
| --- | --- |
| Today | The day's scheduled task, a minutes box, week progress against the weekly goal, streak and totals |
| Day log | Every past week, grouped Monday–Sunday, with per-day tasks and minutes; backfill any missed day |
| Wrong answers | Log a missed question with type, level, time, PT/section/question, and both halves of the reasoning |
| Scores | Sections, drills, and full practice tests, with an accuracy line for sections |
| Patterns | Misses by question type and difficulty, average time on a miss, and the blind-review gap |

An LR / RC toggle carries across Wrong answers, Scores, and Patterns. Full practice
tests sit outside that split, since a PT score isn't one section type.

## Running it

`index.html` works three ways, and detects which one it's in automatically, in this order:

1. **Inside a Claude artifact.** If `window.claude.use("db")` resolves, the page uses the
   Claude artifact host's `db` capability. Data lives there, synced across every view of
   that artifact. This is the private, edit-in-conversation copy.
2. **Vercel + Neon.** If this deployment has a `/api` backend (see below), the page talks
   to it over `fetch`. Data lives in a real Postgres database — synced across every
   device and browser that opens the URL. This is the one meant for actual day-to-day use.
3. **Standalone, no backend** — GitHub Pages with no `/api`, a plain web server, or
   straight off disk. Falls back to a `localDb()` shim backed by the browser's
   `localStorage`. Data then lives per-browser, not synced anywhere — clearing site data
   or switching browsers starts you over.

All three implement the exact same `doc`/`collection`/`onSnapshot`/`get`/`set`/`delete`/`add`
shape, so every render/write function in the page runs completely unmodified regardless of
which one is active.

"Back up data" exports every collection as one JSON file — through the artifact host's
`downloads` capability where available, or a plain `<a download>` blob otherwise. "Restore
backup" reads a file of that same shape back in: tasks and journal/score entries with a
matching date or id are overwritten, everything else is added. Backup/restore is how you
move data between modes — e.g. export from the Claude artifact, then restore into the
Vercel copy.

## Deploying to Vercel + Neon

1. **Create a Neon database.** New project at [neon.tech](https://neon.tech) → open its
   SQL editor → paste in and run [`schema.sql`](schema.sql) from this repo. Then copy the
   connection string (Dashboard → Connection Details — use the *pooled* one).
2. **Import this repo into Vercel.** [vercel.com/new](https://vercel.com/new) → import
   `LSAT-Tracker` from GitHub. Framework Preset: "Other". No build command needed.
3. **Set the environment variable.** In the new Vercel project → Settings → Environment
   Variables → add `DATABASE_URL` = the Neon connection string from step 1. Redeploy if
   the project already built before this was set.
4. **Open the deployed URL.** The page's own boot sequence detects `/api/config` and
   switches to the Neon-backed store automatically — nothing else to configure.

The API is five plain Vercel serverless functions under [`api/`](api) (no framework),
using [`@neondatabase/serverless`](https://github.com/neondatabase/serverless) — see
[`package.json`](package.json) for the one dependency.

## Data model

Four collections:

- `meta/config` — weekly goal, start date, and the baseline totals carried over from the
  original spreadsheet (minutes, days completed, best streak, and per-week minutes for
  weeks that predate the tracker)
- `tasks/<YYYY-MM-DD>` — one document per scheduled day: `title`, `cat`, `plannedMin`,
  `skip`, `done`, `actualMin`
- `journal/<id>` — `date`, `mode` (LR/RC), `source`, `qtype`, `level`, `timeSec`, `test`,
  `section`, `q`, `whyWrong`, `whyRight`
- `scores/<id>` — `date`, `kind` (LR/RC/Drill/PT), `mode`, `raw`, `total`, `timeSec`,
  `br`, `note`; full PTs carry `scaled` instead of `raw`/`total`

Dates are `YYYY-MM-DD` strings parsed as local time. Weeks run Monday to Sunday.

## Structure

Everything is in `index.html` — styles in a `<style>` block using CSS custom properties
with light/dark variants, and an IIFE holding state, date helpers, render functions per
tab, and the write functions. No dependencies beyond two Google Fonts.
