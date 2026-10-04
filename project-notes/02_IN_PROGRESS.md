# In Progress

Nothing is mid-flight in the code right now — the last unit of work (Resources page grid + affirmation
one-liners, commit `4b0143f`, plus the handoff docs in `b8d2a50`) is finished and verified (`tsc` clean,
working tree clean as of this writing).

## The one open loop

**Local commits are ahead of GitHub.** Every commit through this project has been made from a sandboxed dev
session that can't authenticate to GitHub — so `git push origin main` has to be run from a real machine's
terminal. Check `git log origin/main..HEAD --oneline` to see exactly what hasn't been pushed yet; as of the
commits listed in `01_DONE.md`'s brand-refresh and Resources-page entries, that push had not yet happened.

Do this before switching machines, so the new machine's `git clone` picks up everything.

---

*When something is genuinely left half-done mid-session (a feature with a known-incomplete piece, a bug
that's diagnosed but not yet fixed, etc.), it gets logged here with specifics — what's done, what's left,
and any gotchas discovered while investigating — so the next session doesn't have to rediscover them.*
