# Start Here — How To Resume Work On This Project

This folder (`project-notes/`) is the living state tracker for The Unshaken Self website project. It's
designed so that you — or a fresh Claude session with zero memory of past conversations — can open this
folder on **any machine** and know exactly what's done, what's mid-flight, what's planned, and how to verify
the project is actually in the state these files claim before touching anything.

## Reading order

1. **This file** — the protocol below.
2. **`01_DONE.md`** — everything completed so far, phase by phase, newest at the bottom.
3. **`02_IN_PROGRESS.md`** — anything currently mid-flight. Usually short or empty.
4. **`03_PLANNED.md`** — known future work that hasn't started yet.
5. **`04_MIGRATION.md`** — only needed if you're setting this project up on a machine it's never run on before.

If you're a Claude session picking this up fresh: read files 1–3 in full before writing any code. Don't read
`04_MIGRATION.md` unless the person tells you this is a new machine (i.e. `npm install` hasn't been run here,
or `.env.local` is missing).

## The checkpoint protocol — follow this every single time

### Before starting any new task

Run these, in order, and don't start new work until all of them check out:

1. `git log --oneline -10` — read it against the bottom of `01_DONE.md`. They should tell the same story. If
   `01_DONE.md` is missing recent commits, the file is stale — catch it up (see "After finishing a task"
   below) before doing anything else, so you're never planning on top of an inaccurate record.
2. `git status --short` — should be empty (clean working tree). If it isn't, figure out why before adding more
   changes on top: either finish and commit what's there, or confirm with the person it's safe to discard.
3. `npx tsc --noEmit` — should produce no output. If it doesn't, the project is currently broken; fix that
   first, don't layer a new feature on a broken build.
4. Confirm `.env.local` exists at the project root with the three required keys (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_ADMIN_EMAIL`) — don't print their values, just confirm the
   file and key names are present. If it's missing, you're on a fresh machine — see `04_MIGRATION.md`.
5. Only now: check `02_IN_PROGRESS.md` for anything left mid-flight that should probably be finished before
   starting something new, and `03_PLANNED.md` for what's actually queued up.

### After finishing a task

1. Run the project's standard verify pipeline: `npx tsc --noEmit`, a NUL-byte sweep on any files you edited
   (`python3 -c "open(f,'rb').read().find(b'\x00')"` style check — this project has hit real NUL-corruption
   bugs before), and `git status --short` to review exactly what changed.
2. Commit with a descriptive message explaining *what* changed and *why*, not just what.
3. Append a new entry to the bottom of `01_DONE.md` describing what shipped (one short paragraph, same style
   as the existing entries) and the commit hash(es).
4. If the task came from `03_PLANNED.md`, remove it from there. If it's not fully finished, move the remaining
   part into `02_IN_PROGRESS.md` with a note on exactly what's left.
5. Remind the person that commits are **local until pushed** — `git push origin main` has to be run from a
   real machine's terminal (not a sandboxed dev session) since that's the only place with GitHub credentials.

### A note on honesty

These files are only useful if they're accurate. Don't mark something "done" because it was attempted — only
once it's been verified (tsc clean, visually checked, or otherwise confirmed working). If something is
half-finished, say so plainly in `02_IN_PROGRESS.md` rather than letting it quietly vanish or get logged as
complete.
