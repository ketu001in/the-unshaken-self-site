# Setting This Project Up On A New Machine

Only needed once per new machine. If `.env.local` already exists at the project root and `npm run dev`
already works, skip this.

## Where everything actually lives

Nothing about this project is stored "in Claude" or by Anthropic — a Claude session only ever has temporary
read/write access to whichever local folder you connect it to, and that access doesn't sync or persist on
its own. The real project lives in four places:

| What | Where | Needs manual transfer to a new machine? |
|---|---|---|
| Source code | This folder **and** GitHub (`ketu001in/the-unshaken-self-site`, branch `main`) | No — `git clone` gets all of it |
| Database / CMS content | Supabase (cloud project `amaxinhkybanuhczowro`) | No — reachable from any machine |
| Live site | Vercel + Hostinger (both auto-deploy from GitHub) | No — unaffected by dev machine |
| Secrets (`.env.local`) | **Only this machine's disk** — git-ignored, never pushed | **Yes, manually** |
| Raw brand source files (`TheUnshakenSelf_*` folders/zips) | **Only this machine's disk** — git-ignored | Optional, only if doing more logo work |

## Steps

1. Install [Node.js](https://nodejs.org) 20 or later, and [Git](https://git-scm.com).
2. Sign in to GitHub on the new machine so `git push` works from there too.
3. Clone:
   ```
   git clone https://github.com/ketu001in/the-unshaken-self-site.git
   cd the-unshaken-self-site
   ```
4. Install dependencies: `npm install`
5. Copy `.env.local` from the old machine to the new one's project root, **not over chat/email in plain
   text** (USB drive or a password manager's secure note). It needs exactly these three keys:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   NEXT_PUBLIC_ADMIN_EMAIL=
   ```
6. (Optional) Copy over these git-ignored folders only if you'll do more brand/logo image work — the live
   site already has the processed output in `public/` and doesn't need the raw sources:
   - `TheUnshakenSelf_Production_Brand_Package/` (+ `.zip`)
   - `TheUnshakenSelf_Logo_Pack/` (+ `.zip`)
   - `TheUnshakenSelf_Logo_Slices/` (+ `.zip`)
7. Verify: `npm run dev`, open `http://localhost:3000`.
8. Run through the checkpoint protocol in `00_START_HERE.md` before starting any new work.

## Quick reference

- Repo: `https://github.com/ketu001in/the-unshaken-self-site` (branch `main`)
- Supabase project ref: `amaxinhkybanuhczowro`
- Node: 20+ required (previously run on v22.23.2)
- Dev: `npm run dev` · Build: `npm run build` · Lint: `npm run lint`
- Live deploys: Vercel (auto, GitHub-integrated) and Hostinger (auto, GitHub-integrated, Node.js Web App mode)
