# Done — Completed Work Changelog

Phase-by-phase record of everything shipped on this project. Newest at the bottom. Cross-check the tail of
this file against `git log --oneline -10` before starting new work (see `00_START_HERE.md`'s protocol) — if
they disagree, this file is stale and should be caught up first.

## Foundation
Reviewed the existing site and Resources page, generated the original Resources menu content. Designed and
applied the Supabase schema + Row-Level Security, wired the Next.js app to Supabase, built the admin auth
gate, migrated localStorage-based flows to Supabase. Fixed Preview page audio/PDF issues, the dark/light
theme toggle, About Book teaser copy, footer social icons, the preorder currency banner, chatbot FAQ, and
About Author media-kit downloads. Created the GitHub repo and did the first push.

## CMS architecture
Designed `page_content` (slug → jsonb) and `site_settings` (key → jsonb) tables plus a shared
content-fetching helper. Wired Homepage, About Book, About Author, site-wide settings, Preorder, Preview,
Resources, Events, and Reviews pages to this CMS. Built the admin Site Editor dashboard tab to manage all of
it; added theme-color and section-visibility controls, image/video upload. Deployed to Vercel (free tier)
via GitHub integration.

## Book cover 3D feature
Built a cover-slicing math helper, extended settings with wrap-cover fields, rebuilt `Book3D` with
idle/hover/drag states, wired the new settings into the homepage and Site Editor.

## Author identity correction
Found and corrected all "Vedic researcher/counselor" mentions to the accurate author bio across About
Author, the homepage, and live Supabase content.

## Engagement features
Daily Teaching ritual + streak (Wisdom Draw), Breath Widget, Unshaken Quiz, Founding Readers Wall, Referral
unlock mechanic, shareable cards for Quiz/Countdown results, 18 printable per-chapter affirmation cards,
"Ask Ketul" live-session banner + question box, a Gita facts data file, a Spin Wheel modal, and a Visitor
Counter badge.

## Commerce evolution
The buy flow went through several real phases as the launch state changed: Early Access / Pre-Buy →
temporarily closed (links cleared, closure messaging shown instead) → reopened live with real
Amazon/Flipkart/NotionPress links at ₹399 → added an Amazon Prime badge → added Flipkart as a third store →
added CA/US/AU regional buy links, prices, and a region-tab UI in both the popup and the Preorder page
(prices verified live on each Amazon domain on 9 Sept 2026) → fixed popup dark-mode contrast. Once the book
actually launched, deleted the old Countdown component and replaced it with a "Now Live" LaunchBanner, a
"Wait Is Over" timeline section, and a genuine reader thank-you card; posted the launch-announcement blog
entry.

## Feedback system
New Supabase table + RLS, a `/feedback` page, a Navbar entry, and an admin dashboard tab.

## Typography & theming
Switched to Fraunces + Inter. Several rounds of site-wide font-size tuning (+2px, then −2px). Forced Light
mode as the default for new visitors. Added the "Available in 130+ countries" badge and fixed a subtitle
contradiction on the Preorder page.

## Sound system
Designed a synthesized Web Audio API sound engine, `SoundContext` + `SoundToggle`, wired into rituals and
general UI feedback.

## Hostinger deployment (parallel to Vercel)
Confirmed the Business Web Hosting plan can run this app via its Node.js "Web App" GitHub-integration flow.
Diagnosed and fixed a Hostinger-specific Turbopack build crash (`TurbopackInternalError` on `globals.css`,
caused by the host killing Turbopack's spawned child processes) via
`experimental.turbopackPluginRuntimeStrategy: "workerThreads"` in `next.config.ts` (commit `a30d13e`).
Walked through env-var import + redeploy; confirmed a successful live deployment.

## Brand refresh — round 1 (SVG-based)
Applied the official navy/gold/ivory/charcoal palette from `TheUnshakenSelf_Production_Brand_Package` across
~700 hex occurrences in 35 files, swapped Navbar/Footer logos to theme-aware SVGs, generated real favicons
and an OG image, updated the live Supabase `theme_colors` (commit `2c83363`).

## Brand refresh — round 2 (new tree-logo artwork)
User uploaded 3 new composite brand-concept images; sliced all of them into 17 individual PNG files (7
variants × 2 sheet versions + 3 concept posters) via whitespace-gutter detection, zipped for download. User
chose the "v2" (refined) tree render as the site-wide logo. Built true-transparent PNGs by color-keying out
the cream background (the mockup's visible checkerboard wasn't real alpha — had to generate actual
transparency from scratch), plus an opaque navy "dark badge" variant for dark mode. Regenerated
favicon.ico/16/32/48/192/512, apple-touch-icon.png, and og-image.jpg from the new artwork. Swapped
Navbar/Footer logos to the new PNGs; replaced the admin-login generic lock icon with the real brand mark
(commit `8dc4299`).

Iterated the Navbar logo sizing three times based on user screenshots:
1. Tried `h-full` threaded through nested flex elements to match the navbar bar's own height (commit
   `ef13ba0`) — didn't reliably resolve across the nested flex chain and let the image overflow past the bar.
2. Traced the resulting off-center look to the logo PNG itself having asymmetric baked-in padding (22px
   above the artwork vs. 9px below) and re-cropped it to a tight content bounding box (commit `abbf453`).
3. The overflow (tree roots spilling below the bar) turned out to be the `h-full` chain itself, not just the
   crop — replaced it with a simple fixed pixel height (`h-16` unscrolled / `h-12` scrolled, matching the
   navbar's own `h-20`/`h-16` scroll states) (commit `bfffe9f`). This is the robust, currently-committed
   version.

## Resources page — affirmation card grid
Changed the 18-card grid from 6 columns × 3 rows to 3 columns × 6 rows, and added each chapter's existing
one-liner teaching (from `src/lib/wisdomLines.ts`, already used for the downloadable cards) onto the
thumbnail itself, so it previews the actual affirmation rather than just the chapter name (commit `4b0143f`).

## Project handoff docs
Added `PROJECT_HANDOFF.md` (commit `b8d2a50`) and this `project-notes/` folder — a machine-migration guide
and a living, modular state tracker (done / in-progress / planned / migration, plus the checkpoint protocol
in `00_START_HERE.md`) so the project can be picked up confidently on any machine, including by a Claude
session with no memory of prior conversations.
