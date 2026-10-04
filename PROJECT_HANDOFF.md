# The Unshaken Self — Project Handoff & Migration Guide

Last updated: 2026-10-04 · Prepared for moving work from this machine to another.

## 1. Where everything actually lives (read this first)

Nothing about this project is stored "in Claude" or "in the cloud by Anthropic." Claude only had temporary
read/write access to your local folder during each session — that access doesn't persist or sync anywhere on
its own. The actual project lives in four separate places, all already cloud-backed except the first:

| What | Where it lives | Needs manual transfer to a new machine? |
|---|---|---|
| Source code | This folder (`D:\Ketul\Composed Book\AntiGravity_project`) **and** GitHub | No — `git clone` on the new machine gets all of it |
| Database / CMS content | Supabase (cloud project `amaxinhkybanuhczowro`) | No — accessible from any machine with the right URL/key |
| Live site | Vercel + Hostinger (both deploy from GitHub automatically) | No — unaffected by which machine you develop on |
| Secrets (`.env.local`) | **Only on this machine's disk** — git-ignored, never pushed | **Yes — you must copy this file yourself** |
| Raw brand source files (`TheUnshakenSelf_*` folders/zips) | **Only on this machine's disk** — git-ignored | Optional — only needed if you'll do more logo/image work |
| This conversation's memory of what was built and why | **Nowhere except this chat** | Covered by Section 3 below |

So: GitHub is your real source of truth for code. The only things that don't travel with `git clone` are the
`.env.local` secrets file and the two leftover raw-asset folders — everything else below is about those two
plus restoring context for a fresh Claude session.

## 2. Moving to the new machine — step by step

**On the new machine:**

1. Install [Node.js](https://nodejs.org) — version 20 or later (this machine has v22.23.2; Next.js 16 needs 20+).
2. Install [Git](https://git-scm.com) and sign in to GitHub (so `git push` works there too — same as you had to set up on this machine).
3. Clone the repo:
   ```
   git clone https://github.com/ketu001in/the-unshaken-self-site.git
   cd the-unshaken-self-site
   ```
4. Install dependencies:
   ```
   npm install
   ```
5. **Copy `.env.local` from this machine to the new one manually** (USB drive, a password manager's secure note, or similar — not over chat/email in plain text, since it holds your Supabase keys). It needs exactly these three keys (values are already on this machine's copy of the file, not reproduced here):
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   NEXT_PUBLIC_ADMIN_EMAIL=
   ```
   Place it at the project root (same level as `package.json`).
6. (Optional) Copy these git-ignored folders over too, only if you expect to do more logo/brand image work — the live site doesn't need them, it already has the processed assets in `public/`:
   - `TheUnshakenSelf_Production_Brand_Package/` (+ .zip)
   - `TheUnshakenSelf_Logo_Pack/` (+ .zip)
   - `TheUnshakenSelf_Logo_Slices/` (+ .zip)
7. Verify it runs: `npm run dev`, open `http://localhost:3000`.
8. Verify a commit/push round-trips: Hostinger and Vercel are both already wired to auto-deploy from GitHub `main` — a push from the new machine will go live exactly like it did from this one.

That's the whole migration. Supabase, Vercel, and Hostinger don't know or care which machine you're pushing
from.

## 3. Starting a fresh Claude session on the new machine

A new Cowork/Claude session has no memory of this conversation. When you open one on the new machine, connect
it to the cloned project folder, then paste this whole document (or just Section 4 + 5) into the chat as your
first message — that gives it the same context this session had, including what's done and what's still open.

## 4. Checkpoint changelog — everything built so far, by phase

*(newest-first within each phase isn't preserved; this is roughly chronological by phase)*

**Foundation**
- Reviewed the existing site, Resources page, and generated the original Resources content.
- Designed and applied the Supabase schema + Row-Level Security; wired the Next.js app to Supabase; built the admin auth gate; migrated localStorage-based flows to Supabase.
- Fixed Preview page audio/PDF issues, dark/light theme toggle, About Book teaser copy, footer social icons, preorder currency banner, chatbot FAQ, About Author media-kit downloads.
- First GitHub repo creation and push.

**CMS architecture**
- Designed `page_content` (slug → jsonb) + `site_settings` (key → jsonb) tables and a shared content-fetching helper.
- Wired Homepage, About Book, About Author, site-wide settings, Preorder, Preview, Resources, Events, and Reviews pages to this CMS.
- Built the admin Site Editor dashboard tab for managing all of it; added theme-color and section-visibility controls, image/video upload.
- Deployed to Vercel (free tier) via GitHub integration.

**Book cover 3D feature**
- Built a cover-slicing math helper, extended settings with wrap-cover fields, rebuilt `Book3D` with idle/hover/drag states, wired it into the homepage and Site Editor.

**Author identity correction**
- Found and corrected all "Vedic researcher/counselor" mentions to the accurate author bio across About Author, homepage, and live Supabase content.

**Engagement features**
- Daily Teaching ritual + streak (Wisdom Draw), Breath Widget, Unshaken Quiz, Founding Readers Wall, Referral unlock mechanic, shareable cards for Quiz/Countdown results, 18 printable per-chapter affirmation cards, "Ask Ketul" live-session banner + question box, Gita facts data file, Spin Wheel modal, Visitor Counter badge.

**Commerce evolution (buy flow changed several times as the launch state changed)**
1. Early Access / Pre-Buy phase → 2. Temporarily closed (links cleared, closure messaging) → 3. Reopened live with real Amazon/Flipkart/NotionPress links and ₹399 pricing → 4. Added Amazon Prime badge → 5. Added Flipkart as a third store → 6. Added CA/US/AU regional buy links, prices, and a region-tab UI in both the popup and Preorder page (prices verified live on each Amazon domain 9 Sept 2026) → 7. Fixed popup dark-mode contrast.
- Deleted the old Countdown component once the book actually launched; replaced with a "Now Live" LaunchBanner, a "Wait Is Over" timeline section, and a genuine reader thank-you card; posted the launch-announcement blog entry.

**Feedback system**
- New Supabase table + RLS, `/feedback` page, Navbar entry, admin dashboard tab.

**Typography & theming**
- Switched to Fraunces + Inter; several rounds of site-wide font-size tuning (+2px, then −2px); forced Light mode as the default for new visitors; added the "Available in 130+ countries" badge and fixed a subtitle contradiction on Preorder.

**Sound system**
- Designed a synthesized Web Audio API sound engine, `SoundContext` + `SoundToggle`, wired into rituals and general UI feedback.

**Hostinger deployment (parallel to Vercel)**
- Confirmed Business Web Hosting plan can run this app via its Node.js "Web App" GitHub-integration flow.
- Diagnosed and fixed a Hostinger-specific Turbopack build crash (`TurbopackInternalError` on `globals.css`, caused by the host killing Turbopack's spawned child processes) via `experimental.turbopackPluginRuntimeStrategy: "workerThreads"` in `next.config.ts`.
- Walked through env-var import + redeploy; confirmed a successful live deployment.
- **DNS cutover of `theunshakenself.com` (bought via GoDaddy) to Hostinger is intentionally on hold** — pending confirmation that the 18-day WhatsApp campaign has wrapped. Don't act on this without the user's go-ahead.

**Brand refresh — round 1 (SVG-based)**
- Applied the official navy/gold/ivory/charcoal palette from `TheUnshakenSelf_Production_Brand_Package` across ~700 hex occurrences in 35 files, swapped Navbar/Footer logos to theme-aware SVGs, generated real favicons and an OG image, updated the live Supabase `theme_colors`.

**Brand refresh — round 2 (new tree-logo artwork, current)**
- User uploaded 3 new composite brand-concept images; sliced all of them into 17 individual PNG files (7 variants × 2 sheet versions + 3 concept posters) via whitespace-gutter detection, zipped for download.
- User chose the "v2" (refined) tree render as the site-wide logo. Built true-transparent PNGs by color-keying out the cream background (not just reusing the mockup's baked-in checkerboard, which wasn't real alpha), plus an opaque navy "dark badge" variant for dark mode.
- Regenerated favicon.ico/16/32/48/192/512, apple-touch-icon.png, and og-image.jpg from the new artwork.
- Swapped Navbar/Footer logos to the new PNGs; replaced the admin-login generic lock icon with the real brand mark.
- Iterated the Navbar logo sizing three times based on screenshots: (1) tried `h-full` threaded through nested flex elements to match the navbar bar's own height — this didn't reliably resolve across browsers and let the image overflow past the bar; (2) traced it to the logo PNG itself having asymmetric baked-in padding (22px above vs 9px below) and re-cropped it to a tight bounding box; (3) replaced the fragile `h-full` chain with a simple fixed pixel height (`h-16` unscrolled / `h-12` scrolled, matching the navbar's own `h-20`/`h-16` scroll states) — this is the version currently committed and is robust.
- Resources page: changed the 18-card affirmation grid from 6 columns × 3 rows to 3 columns × 6 rows, and added each chapter's existing one-liner teaching (from `src/lib/wisdomLines.ts`, already used for the downloadable cards) onto the thumbnail itself.

## 5. Pending / open items right now

- **Push to GitHub**: all recent work (logo swap, navbar height fixes, Resources grid change — commits through `4b0143f`) is committed locally but has **not been pushed** yet. Run from PowerShell in the project folder:
  ```
  git push origin main
  ```
  (This sandbox can't authenticate to GitHub directly — pushing has always had to happen from your own machine, old or new.)
- **DNS cutover** of `theunshakenself.com` to Hostinger — on hold until the WhatsApp campaign is confirmed finished. Don't do this without checking first.
- No other known blockers. Supabase, Vercel, and Hostinger all keep working regardless of which machine you develop from.

## 6. Quick reference

- Repo: `https://github.com/ketu001in/the-unshaken-self-site` (branch `main`)
- Supabase project ref: `amaxinhkybanuhczowro`
- Node: 20+ (this machine ran v22.23.2)
- Dev server: `npm run dev` · Build: `npm run build` · Lint: `npm run lint`
- Live deploys: Vercel (auto, GitHub-integrated) and Hostinger (auto, GitHub-integrated, Node.js Web App mode)
