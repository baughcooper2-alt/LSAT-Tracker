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

"Back up data" (top right) exports every collection — config, tasks, journal, scores —
as one JSON file via the artifact host's `downloads` capability. "Restore backup" reads
a JSON file of that same shape back in: tasks and journal/score entries with a matching
date or id are overwritten, everything else is added.

## Important: this needs the Claude artifact runtime

The page stores data through `window.claude.use("db")`, a capability provided by the
Claude artifact host. **Opening `index.html` from a file system, a plain web server, or
GitHub Pages will not work** — `window.claude` is undefined there, so the page loads
and shows an "isn't available in this view" message with no data.

This repository is therefore useful for version history and editing the source, not as
a deployable site. To run it, publish `index.html` as a Claude artifact with the `db`
capability declared.

Making it standalone would mean swapping the storage layer for `localStorage` or a
backend of your own. The read and write calls are isolated in three places — `subscribe()`,
`logDay()`/`undoDay()`, and `saveJournal()`/`saveScore()` — so it's a contained change.

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
