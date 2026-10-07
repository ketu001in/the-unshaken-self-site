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

## LaunchBanner — Buy Now CTA + Feedback link for existing owners
Added a bold, readable line below the "Now Live" pill ("Click Buy Now to Grab your Copy" — sized up
deliberately from the small uppercase chrome around it) and a second pill beside "Now Live" linking to
`/feedback`, for readers who've already bought the book ("Already Bought? Share Feedback") (commit
`e2feef7`).

## About Book specifications — real publisher + split ISBNs
Updated the specifications table (publisher was showing a placeholder/stale "Will be Declared soon" live on
the site): Publisher -> "Notion Press Publication, India"; split the single "ISBN-13" row into "ISBN-13
(Hardcover)" (979-8906961303) and "ISBN-13 (Paperback)" (979-8906961297), since the two editions have
different real ISBNs. Updated both code defaults (about-book/page.tsx, SiteEditor.tsx) and the live Supabase
`page_content` row for slug `about-book` (commit `512b3f2`).

## About Book specs — Release Date correction
Fixed the Release Date spec from "Tentatively on September 4, 2026" to the actual "September 3, 2026
(Krishna Janmashtami)" — wrong date and stale "tentative" framing (book's already launched). Matches
LaunchBanner's LIVE_SINCE constant. Updated code defaults and the live Supabase row (commit `7d10f91`).

## Project handoff docs
Added `PROJECT_HANDOFF.md` (commit `b8d2a50`) and this `project-notes/` folder — a machine-migration guide
and a living, modular state tracker (done / in-progress / planned / migration, plus the checkpoint protocol
in `00_START_HERE.md`) so the project can be picked up confidently on any machine, including by a Claude
session with no memory of prior conversations.

## Media Kit refresh — all 4 downloads rebuilt from current assets
The 4 files behind the About Author "Official Media Kit" download cards were all dated Jul 16 2026 —
stale, predating the Sep 5 final book-cover upload and the author-identity bio correction. Confirmed via
Supabase that all four `media_kit_*_url` settings are unset, so the fix only needed to replace the static
files in `public/media-kit/` (same filenames; no DB change needed for this feature).
- **High-Res Author Portrait** (ZIP): rebuilt from the real, current author photo (the same file backing
  the live `author_photo_url` setting), resized to 2400px max dimension.
- **Book Cover Graphic Kit** (ZIP, 4 files): rebuilt Full Wrap / Front / Back / Spine crops from the
  current (Sep 5) book-cover wrap image, using the exact production crop math from `coverSlices.ts`
  (`spinePct=8`, `backPct=46`, `back-spine-front` layout) so the kit matches what `Book3D` renders live.
- **Official Launch Press Release** (PDF): rewritten from scratch with real current facts — September 3,
  2026 (Krishna Janmashtami) release; Notion Press Publishers India; real split ISBNs; 320pp, 6x9in;
  Hardcover/Paperback/Kindle/Audiobook formats; real Amazon/Flipkart/Notion Press buy links and ₹499/₹575
  prices; no fabricated city/dateline.
- **Author Full & Short Biographies** (PDF): rewritten using the live, corrected `bio_paragraphs` verbatim
  for the Full Biography, plus a newly-written ~100-word Short Biography summarizing the same real facts.

Also updated the hardcoded file-size labels in `about-author/page.tsx`'s `mediaKitAssets` array to match
the new (larger) file sizes (commit `80a45fb`).

## Contact email — switched to info@theunshakenself.com
User created a dedicated contact address; replaced the personal `ketu001in@gmail.com` with
`info@theunshakenself.com` everywhere it's used for Contact Us / press contact. Updated the code default
in `SiteSettingsContext.tsx` and the live Supabase `site_settings.contact_email` row — this single setting
feeds the About Author page's mailto links, the chatbot's contact fallback, the reader thank-you card, and
the admin SiteEditor field, so no other code changes were needed. Also regenerated the Official Launch
Press Release and Author Biographies PDFs (Media Contact / contact footer sections) with the new email
(commit `8ed9284`).

## Gita Companion chatbot — grounded, interactive rewrite
The chatbot's rule-based answers were largely fabricated — invented techniques ("5-Minute Anchor",
"Detached Goal Setting") that appear nowhere else on the site, and a generic author description instead of
the real bio. Rewrote it to pull from real, already-live site data instead:
- New interactive Chapter Explorer: ask to "explore a chapter," type a number 1-18 (digits or words), or say
  "surprise me" — pulls the real 18 chapter names + one-liners from `src/lib/wisdomLines.ts` (same source as
  the homepage Daily Teaching ritual and Resources page affirmation cards).
- New mood map: 12 real feeling keywords (stress, doubt, anxiety, anger, devotion, meditation, identity,
  faith, freedom, knowledge, guilt, grief) each resolving to a specific real chapter + its actual line.
- Author bio response now reflects the real, corrected bio instead of a generic placeholder.
- New grounded responses for free resources (real Resources page downloads), live events/Ask Ketul sessions
  (settings-driven, matches `AskKetulPanel`'s own logic), feedback/reviews, the free Chapter 1 preview
  ("When Life Freezes You" + Three-Breath Pause), real Gita trivia (`src/lib/gitaFacts.ts`), and "what's the
  book about" (live-fetched from the same about-book CMS content the About Book page uses).
- Conversational polish: randomized greeting/thanks replies, contextual follow-up suggestion chips that
  change based on the last answer, multi-line formatting in chat bubbles and the FAQ tab.
- FAQ tab expanded from 6 to 10 real-data-backed entries.
Verified keyword-matching edge cases (substring collisions like "rut" inside "truth") with a standalone
Node script before committing (commit `16bdc22`).

Follow-up: the quick-suggestion chip strip overflowed off the right edge with no visible way to reach the
hidden chips. Added left/right chevron arrows (shown only when there's actually more to scroll that
direction) and Left/Right arrow-key scrolling when the strip is focused (commit `c940718`).

Follow-up: renamed the bot to "Ask Ket — Your AI Companion" everywhere it appears (chat header, welcome
message, trigger button aria-label, and the homepage's own FAQ entry describing the widget, kept in sync
between `page.tsx` and its `SiteEditor.tsx` admin mirror). Also expanded the chatbot's own FAQ tab from 10 to
17 entries — all grounded in real, live site data: ISBNs/specs (live-synced), international availability
(real US/CA/AU Amazon links + prices from `site_settings`), the religious/dogma question, chapter count, the
Daily Teaching streak ritual, the Unshaken Quiz, and the Book Club Kit — plus matching free-text chat
triggers for all seven new topics (commit `88d048c`).
