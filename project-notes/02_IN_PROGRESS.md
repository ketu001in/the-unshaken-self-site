# In Progress

The code itself isn't mid-flight — the last unit of work (the "Ask Ket" AI chatbot rebuild, commit `34ed83e`)
is finished and verified (`tsc` clean). But see the Groq setup item below: that work only reaches its full
effect once a real API key is added outside this repo.

## Open loops

### Groq API key needed for the AI chatbot to actually use AI
As of commit `34ed83e`, `src/app/api/chat/route.ts` calls Groq for real AI-backed chat replies — but it needs
a `GROQ_API_KEY`, which hasn't been set anywhere yet. Without it, the chatbot still works (it silently falls
back to the old rule-based engine), it just isn't actually "thinking." To activate real AI:
1. Get a free key at console.groq.com/keys.
2. Local dev: paste it into `.env.local`'s `GROQ_API_KEY=` line (already scaffolded, gitignored).
3. Production: add `GROQ_API_KEY` (same value) to the Vercel project's Settings → Environment Variables, then
   redeploy.
This is a manual step outside what a sandboxed session can do (no access to your Groq account or Vercel
dashboard) — see `00_START_HERE.md`'s checkpoint protocol for why.

### Pushing to GitHub

**Local commits are ahead of GitHub.** Every commit through this project has been made from a sandboxed dev
session that can't authenticate to GitHub — so `git push origin main` has to be run from a real machine's
terminal. Check `git log origin/main..HEAD --oneline` to see exactly what hasn't been pushed yet; as of the
commits listed in `01_DONE.md`'s brand-refresh and Resources-page entries, that push had not yet happened.

Do this before switching machines, so the new machine's `git clone` picks up everything.

---

*When something is genuinely left half-done mid-session (a feature with a known-incomplete piece, a bug
that's diagnosed but not yet fixed, etc.), it gets logged here with specifics — what's done, what's left,
and any gotchas discovered while investigating — so the next session doesn't have to rediscover them.*
