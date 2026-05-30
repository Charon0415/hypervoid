# Hypervoid UI Handoff

Last updated: 2026-05-30

This document is for future AI agents or developers continuing the Hypervoid visual redesign. Read this before changing routing, login, homepage, Service Worker, or global shell UI.

## Current Route Contract

The root domain must be the blog homepage:

- `https://hypervoid.top/` -> blog homepage
- `/sign-in` -> immersive public login page
- `/admin/sign-in` -> admin login page
- `/posts` -> post index
- `/admin` -> admin dashboard, admin-only

Do not replace `/` with the Explore/login screen again. That already happened during the redesign and confused the site structure. The user clarified that the original homepage should remain the root page.

Header behavior:

- Small orbit icon at the far left opens `/sign-in`.
- `Hypervoid` wordmark opens `/`.

## What Was Changed Recently

### Service Worker and Video Loading

Commit: `4081e27 fix: stabilize service worker media handling`

Problem:

- `https://hypervoid.top/1.mp4` failed in browsers because an old Service Worker intercepted media/range requests.
- Next static chunks also had previous SW interception problems.

Current behavior:

- `public/sw.js` is `hypervoid-v8`.
- Media and Range requests bypass the Service Worker.
- `/_next/` assets bypass the Service Worker.
- Unknown requests are left to the browser instead of falling through to stale cache logic.
- `ServiceWorkerRegister.tsx` uses `SW_VERSION = "8"`.
- `layout.tsx` has a beforeInteractive cleanup script for old SW/cache versions.

Verification previously performed:

- `/1.mp4` returned `200`.
- Range request for `/1.mp4` returned `206 Partial Content`.
- `/sw.js` returned `hypervoid-v8`.

### Shell, Header, Nav, Settings

Commit: `9583fde ui: refine shell navigation and settings`

Files involved:

- `src/components/SiteHeader.tsx`
- `src/components/NavGroups.tsx`
- `src/components/MobileNav.tsx`
- `src/components/ThemeToggle.tsx`
- `src/components/SiteSettings.tsx`
- `src/components/SettingsProvider.tsx`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/auth.ts`
- `src/app/admin/settings/page.tsx`
- `src/app/admin/settings/actions.ts`

Key decisions:

- Header was restyled as a Hypervoid HUD shell.
- The left orbit icon and the wordmark are separate links.
- Mobile drawer and desktop nav were restyled but routes and menu items were preserved.
- Global main content wrapper now uses `hv-main-shell`.
- Old visitor-facing theme controls were removed from the settings panel:
  - one-click themes
  - hue selector
  - background picker
  - font picker
- The settings panel is now an "Interface Console" with:
  - display mode
  - reading font size
  - desktop mascot toggle
  - PWA install when available
- `SettingsProvider` now migrates old localStorage values away using schema version `2`.
- `homepage_login_redirect` was removed from auth logic and admin settings UI.

Important note:

- `SettingsProvider` still exposes legacy setter functions (`setHue`, `setBackground`, `setFont`) for compatibility. The UI no longer surfaces them.

### Homepage Restoration

Commit: `22c191b home: restore blog landing page`

Problem:

- The redesigned login/Explore page had replaced `src/app/page.tsx`, so `https://hypervoid.top/` became the login entrance.
- The user asked what the homepage would be if the domain became the login page.

Resolution:

- `src/app/page.tsx` was restored to the blog homepage implementation from before `ee4b121`.
- The immersive login remains available at `/sign-in`.

Root homepage currently includes:

- hero/quote block
- daily pick
- topic collections
- post activity heatmap
- latest post grid
- subscribe/RSS block
- sidebar widgets:
  - private space
  - profile card
  - site stats
  - announcement widget
  - mini terminal
  - mini calendar
  - music player widget
  - tag cloud
  - recent guestbook


### Homepage Frame Density Fix

Date: 2026-05-30

Problem:

- The homepage looked unchanged to the user after earlier spacing tweaks because the main visual problem was not only padding.
- Angled sci-fi frame styles, inline `clipPath` polygons, decorative corner lines, heavy shadows, and framed widget chrome visually created large empty areas around side widgets, post cards, and subscribe blocks.

Resolution:

- Homepage hero now uses a normal compact rounded frame instead of a large angled polygon frame.
- Subscribe/RSS blocks were changed to compact horizontal panels with regular rounded inputs/buttons.
- Post cards removed corner accent lines, scan-line decoration, image notches, and angled controls.
- Global CSS now includes `Compact frame reset v2`, which disables inline/Tailwind `clip-path` angled frame shapes and hides decorative frame pseudo-elements/corner-line overlays for `hv-card`, `hv-panel`, and `hv-panel-sci`.
- Sidebar rail, subscribe block, and stats carousel were tightened so widgets no longer look like large empty boxes.

Verification:

- `pnpm lint` passed.
- `pnpm build` passed.
- `git diff --check` passed.
- Local production server restarted with `pnpm exec next start -p 3000`.
- `curl -sI http://localhost:3000/` returned `200 OK`.
- Playwright screenshot captured at `/tmp/hypervoid-frame-reset.png`.

Future note:

- Do not reintroduce angled `clipPath` panel frames on homepage/sidebar widgets unless the layout is redesigned around the lost visual space. Prefer thin borders, small radius, restrained glow, and dense internal structure.

## Files To Check Before Future UI Work

- `AGENTS.md`: requires reading local Next docs because this is Next.js 16 with changed conventions.
- `node_modules/next/dist/docs/01-app/index.md`: App Router docs entry.
- `src/app/layout.tsx`: global shell, header, footer, providers.
- `src/components/SiteHeader.tsx`: route link split for login/home.
- `src/app/page.tsx`: root homepage. Do not replace with login.
- `src/app/sign-in/page.tsx`: current login page.
- `src/components/VoidEntryLogin.tsx`: mounted by `/sign-in` for the immersive Explore/login experience and uses `/1.mp4`.
- `src/app/globals.css`: shell styles, `hv-*` utilities, full-screen entry video CSS.
- `src/components/SiteSettings.tsx`: new settings console.
- `src/components/SettingsProvider.tsx`: localStorage migration and global display settings.

## Verification Commands

Run after UI/routing changes:

```bash
pnpm lint
pnpm build
git restore -- src/lib/blog-corpus-text.ts
git diff --check
```

For local production preview:

```bash
pkill -f "next start -p 3000"
setsid pnpm exec next start -p 3000 >/tmp/hypervoid-next-start.log 2>&1 < /dev/null &
curl -sI http://localhost:3000/
curl -sI http://localhost:3000/sign-in
curl -sI -H "Range: bytes=0-1023" http://localhost:3000/1.mp4
```

Expected:

- `/` returns `200`.
- `/sign-in` returns `200`.
- `/1.mp4` Range request returns `206`.

Deploy check:

```bash
git push
gh api repos/HyperCharon/hypervoid/commits/<sha>/status --jq '{state, statuses: [.statuses[] | {context, state, description, target_url, updated_at}]}'
curl -sI https://hypervoid.top/
curl -sI https://hypervoid.top/sign-in
```

## Known Warnings

`pnpm lint` currently passes with existing warnings:

- `<img>` warnings in:
  - `src/app/series/[name]/page.tsx`
  - `src/app/series/page.tsx`
  - `src/components/TopicCollections.tsx`
- unused `useSpring` in `src/components/PhotoSphereGL.tsx`
- unused `EASE_OUT_BACK` in `src/components/PhotoWall.tsx`
- unused `eq` in `src/lib/series-public.ts`

Do not treat these as new regressions unless touched.

## Current Design Direction

The desired visual language:

- cosmic / black-hole / future-tech / sci-fi HUD
- dark glass panels
- thin cyan-white borders
- restrained glow
- dense but readable blog/admin layouts
- no marketing landing page on `/`
- no old colorful theme marketplace

Avoid:

- putting the login Explore screen back on `/`
- reintroducing old hue/background/theme controls
- rounded card-heavy marketing layouts
- changing backend/admin functionality while doing visual work
- removing admin routes or auth gates

## Likely Remaining Work

The user said there is still a lot to change. Likely next targets:

- article detail page visual cohesion
- post list/card polish
- sidebar widget consistency
- admin page chrome and tables
- footer and bottom mobile nav
- settings/admin theme pages that still reference old concepts
- old utility classes that still visually leak pre-redesign style

Keep function intact. Change the skin, hierarchy, spacing, and interaction states first.
