# Loop 001

**Slice:** pages/dashboard
**Date:** 2026-07-21

## Goal

First Improvement Loop pass over `pages/dashboard` (no prior LOOP.md/ARCH.md).

## Files Reviewed

- `pages/dashboard/DashboardPage.tsx`
- `pages/dashboard/index.ts`

## Problems Found

**Critical**
- None

**High**
- None

**Medium**
- None

**Low**
- None — static content page, no data fetching to review, correct semantic structure (`<h1>`/`<h2>`), CTA `Link` styled as a button per the `widgets/app-shell` Loop 001 fix (`.btn` + `text-decoration: none`).

## Changes Made

- None.

## Why

N/A — no change made.

## Tests

No automated tests exist yet (known gap).

## Build

PASS

## Lint

PASS

## Remaining TODO

- Revisit once a real dashboard (metrics/summary) is scoped — current content is an intentional placeholder per its own copy, not a defect.

## Next Loop

- No known follow-up until dashboard scope is defined (Design Mode territory, not this loop).

---

# Loop 002

**Slice:** pages/dashboard
**Date:** 2026-07-22

## Goal

Fix stale copy found by manually exercising the app in-browser against a running backend.

## Files Reviewed

- `pages/dashboard/DashboardPage.tsx`

## Problems Found

**Critical**
- None

**High**
- None

**Medium**
- Copy said "Roles and permissions are next" and only linked to validation rules — stale since the RBAC screen shipped (`pages/rbac`, `entities/rbac/ARCH.md` Design 001, 2026-07-21). The one page a new admin lands on was advertising a feature as unbuilt when it had already existed for a day, and gave no way to navigate to it from the dashboard.

**Low**
- None

## Changes Made

- Updated the callout heading/copy to reflect both consoles being online.
- Added a second CTA link to `/rbac` alongside the existing validation-rules link.
- Added `.callout-actions` (flex row, `gap: var(--space-3)`) to `index.css` for the two-button layout — no existing button-group utility class to reuse.

## Why

Loop 001 correctly judged the original copy as an "intentional placeholder, not a defect" — true at the time (RBAC didn't exist yet), but nothing re-checked it after RBAC shipped. Caught only now because this was the first time the dashboard was actually loaded in a browser against live data.

## Tests

No automated tests exist yet (known gap). Manually verified in-browser: both links render and navigate correctly.

## Build

PASS

## Lint

PASS

## Remaining TODO

- None.

## Next Loop

- If a third console ships, re-check this page's copy again rather than assuming it still holds — this is the second time it's gone stale.
