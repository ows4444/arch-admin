# Loop 001

**Slice:** app-shell (cross-cutting: design system + all existing pages)
**Date:** 2026-07-21

## Goal

Give the app a real visual identity. Until this loop, every screen used unstyled default HTML — no typography, color, or layout system beyond a base reset. Scoped to CSS/markup only; no data or routing behavior changes intended.

## Files Reviewed

- `src/index.css` (the entire design surface)
- `index.html`, `public/favicon.svg`
- `widgets/app-shell/AppShell.tsx`, `pages/login/LoginPage.tsx`, `pages/dashboard/DashboardPage.tsx`, `pages/validation-rules/{ValidationRulesPage,RulesTable}.tsx`, `features/auth/{login/LoginForm,logout/LogoutButton}.tsx`, `features/validation-rules/create-rule/CreateRuleForm.tsx`

## Problems Found

**Critical**

**High**
- No visual identity at all — plain browser-default form controls/tables, no type system, no color system beyond a base reset. Not a defect exactly, but blocked every other quality dimension (readability, brand coherence) from being assessed.
- `--text-muted` failed WCAG AA contrast (2.96:1 light, 3.74:1 dark against its actual backgrounds) once real colors were chosen — caught by computing contrast ratios for every token pair before shipping, not by inspection.
- Found while verifying the redesigned validation-rules screen live: the global `retry: 1` query default retried *all* errors uniformly, including 403s that can never succeed on retry (no permission change happens between attempts). Combined with a slow/uncertain retry-timer in the test environment, this left the UI showing "Loading…" indefinitely instead of settling to a visible error. Not a CSS bug, but surfaced by testing the new error-state styling.

**Medium**
- `.btn` used as a `<Link>` (Dashboard → Validation rules CTA) rendered with a default anchor underline — `.btn` needed explicit `text-decoration: none`.
- Inline `style={{ maxWidth: 320 }}` crept into `ValidationRulesPage` during a first pass — replaced with a `.field--narrow` utility class to keep styling centralized in `index.css` rather than split across inline styles and classes.

**Low**
- Leftover default Vite/React template favicon (unrelated purple blob asset) never replaced with a real brand mark.

## Changes Made

- New design system in `index.css`: full light/dark token set (color, two-face type system — Space Grotesk display / IBM Plex Sans body / IBM Plex Mono data — spacing, radius), reusable component classes (`.card`, `.field`, `.input`, `.select`, `.btn` + variants, `.status-message`, `.token`, `.op-pill`, `.rules-table`, `.switch`, sidebar/shell layout).
- New `shared/ui/Logomark` — a keystone SVG mark, the first justified shared UI component (used identically in `AppShell` and `LoginPage`); replaces the leftover template favicon too.
- `AppShell` restructured from a bare top bar to a left sidebar (brand, nav, account footer), collapsing to a horizontal bar under 720px.
- Every existing form/table restyled against the new classes; `RulesTable` rebuilt around the loop's signature treatment — each rule renders as a compact expression (`field` `operator` `value`, mono tokens + pill) instead of a plain grid, with a switch control (gold when enabled) instead of a bare checkbox.
- Copy pass: `DashboardPage`'s placeholder text replaced with an honest, actionable empty state; rule-list empty/error states rewritten to name the target type and offer a `Retry` action instead of a static message.
- `queryClient`'s default `retry` changed from a flat count to a function that never retries 4xx errors (client errors don't resolve by retrying) and retries once for anything else — a correctness fix, not styling, but one this loop's live testing surfaced.

## Why

An internal tool used many times a day still benefits from a considered identity, especially one that reduces reading effort (the expression-row treatment lets a rule's logic be read at a glance instead of parsed from a generic table). The retry-policy fix matters independently of the redesign — it was just invisible until an error state actually had real visual affordance (a Retry button) worth verifying.

## Tests

No automated tests exist yet. Verified manually: full login → dashboard → validation-rules flow in the browser (light font-loading confirmed via `document.fonts.status`), WCAG AA contrast computed for every color-on-background pairing actually used (two failures found and fixed), keyboard focus rings visible on inputs/buttons, `prefers-reduced-motion` respected globally. Could not visually confirm the OS-level light color-scheme render (tooling in this environment only reliably showed the dark branch) — contrast math covers both branches numerically instead.

## Build

PASS

## Lint

PASS

## Remaining TODO

- Visually confirm the light color-scheme branch once there's a way to force it (OS-level `prefers-color-scheme`, not something page JS can override).
- Confirm the real "Add rule" happy-path visuals once a privileged RBAC test account exists (still blocked, per `entities/validation-rule/ARCH.md`).

## Next Loop

- Apply the same design system to the RBAC roles/permissions screen when it's built, rather than reinventing patterns.

---

# Loop 002

**Slice:** widgets/app-shell
**Date:** 2026-07-21

## Goal

Second Improvement Loop pass over `AppShell.tsx` itself (Loop 001 was a cross-cutting design-system pass touching many files; this pass is scoped to the widget's own component).

## Files Reviewed

- `widgets/app-shell/AppShell.tsx`
- `widgets/app-shell/index.ts`

## Problems Found

**Critical**
- None

**High**
- None

**Medium**
- None

**Low**
- None — layer boundaries are respected (imports `features/auth/logout`, `entities/session`, `shared/ui`; nothing upstream), the skip-link + `id="main-content"`/`tabIndex={-1}` pattern for keyboard/screen-reader users is present and correct, `NavLink`'s built-in `aria-current="page"` handles active-route indication without custom ARIA. `react-router-dom`'s `NavLink`/`Outlet` are used as intended, no prop drilling.

## Changes Made

- None. No issue found that clears the `.ci.loop` §19 bar for a justified change.

## Why

N/A — no change made.

## Tests

No automated tests exist yet (known gap).

## Build

PASS

## Lint

PASS

## Remaining TODO

- Visually re-confirm the light color-scheme branch (carried over from Loop 001, still open).

## Next Loop

- No new follow-up from this pass beyond the carried-over Loop 001 TODO.
